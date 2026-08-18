-- ============================================================================
-- Migration: 004_rate_limits.sql
-- Created: 2026-08-17
-- Description: Durable, shared-state rate limiting.
--
--   The previous implementation (lib/rate-limiter.ts) kept counters in a
--   module-level Map. On Vercel that state is per-lambda-instance, so the admin
--   login's "5 attempts per 15 minutes" was really "5 attempts per warm
--   instance" — trivially defeated by any attacker whose requests fan out
--   across instances. It also only attached the Map to globalThis when
--   NODE_ENV !== 'production', so the one environment that needed persistence
--   across module reloads was the one that did not get it.
--
--   Counters now live in Postgres, shared by every instance and every region.
--
--   Each function performs its read-modify-write in a SINGLE statement
--   (INSERT ... ON CONFLICT DO UPDATE). That matters: a SELECT-then-UPDATE pair
--   would let two concurrent requests for the same key both read count = 4 and
--   both conclude they were under the limit.
-- ============================================================================

-- ============================================================================
-- 1. TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key                text        PRIMARY KEY,
  count              integer     NOT NULL DEFAULT 0,
  window_started_at  timestamptz NOT NULL DEFAULT now(),
  lockout_until      timestamptz,
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Supports the pruning job below; without it, prune degrades to a seq scan once
-- the table accumulates traffic.
CREATE INDEX IF NOT EXISTS idx_rate_limits_updated_at
  ON public.rate_limits (updated_at);

-- Default-deny, matching every other table in this schema (see 001 §8). Access
-- is exclusively via the service_role key from server-side route handlers.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. READ-ONLY LOCKOUT CHECK
-- ============================================================================

-- Answers "is this key currently locked out?" without consuming budget. Used by
-- the login route before it validates credentials, so a locked-out caller never
-- reaches the comparison at all.
--
-- The LEFT JOIN against a single-row subquery is deliberate: it guarantees one
-- result row even when the key has never been seen, so callers do not have to
-- distinguish "absent" from "allowed".
CREATE OR REPLACE FUNCTION public.rate_limit_status(p_key text)
RETURNS TABLE (is_allowed boolean, retry_after_seconds integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    COALESCE(rl.lockout_until, now()) <= now() AS is_allowed,
    GREATEST(
      0,
      CEIL(EXTRACT(EPOCH FROM COALESCE(rl.lockout_until, now()) - now()))::integer
    ) AS retry_after_seconds
  FROM (SELECT p_key AS key) AS k
  LEFT JOIN public.rate_limits rl ON rl.key = k.key;
$$;

-- ============================================================================
-- 3. FAILURE COUNTER (credential brute-force protection)
-- ============================================================================

-- Counts *failed* attempts and imposes a lockout once p_max is reached within
-- p_window_seconds. Successful logins call rate_limit_clear instead, so a user
-- who mistypes twice and then succeeds carries no penalty forward.
CREATE OR REPLACE FUNCTION public.rate_limit_record_failure(
  p_key             text,
  p_max             integer,
  p_window_seconds  integer,
  p_lockout_seconds integer
)
RETURNS TABLE (is_allowed boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count   integer;
  v_lockout timestamptz;
BEGIN
  INSERT INTO public.rate_limits AS rl (key, count, window_started_at, updated_at)
  VALUES (p_key, 1, now(), now())
  ON CONFLICT (key) DO UPDATE
  SET count = CASE
                WHEN rl.window_started_at < now() - make_interval(secs => p_window_seconds)
                  THEN 1
                ELSE rl.count + 1
              END,
      window_started_at = CASE
                WHEN rl.window_started_at < now() - make_interval(secs => p_window_seconds)
                  THEN now()
                ELSE rl.window_started_at
              END,
      updated_at = now()
  RETURNING rl.count INTO v_count;

  IF v_count >= p_max THEN
    UPDATE public.rate_limits
    SET lockout_until = now() + make_interval(secs => p_lockout_seconds),
        updated_at    = now()
    WHERE key = p_key
    RETURNING lockout_until INTO v_lockout;

    RETURN QUERY SELECT
      false,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM v_lockout - now()))::integer);
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 0;
END;
$$;

-- ============================================================================
-- 4. REQUEST THROTTLE (public endpoint abuse protection)
-- ============================================================================

-- Fixed-window counter that consumes budget on EVERY call, not just failures.
-- This is what the public lead form and the paid aircraft-lookup proxy use:
-- there is no notion of a "failed" submission there, so the thing being limited
-- is request volume itself.
CREATE OR REPLACE FUNCTION public.rate_limit_consume(
  p_key            text,
  p_max            integer,
  p_window_seconds integer
)
RETURNS TABLE (is_allowed boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
  v_start timestamptz;
BEGIN
  INSERT INTO public.rate_limits AS rl (key, count, window_started_at, updated_at)
  VALUES (p_key, 1, now(), now())
  ON CONFLICT (key) DO UPDATE
  SET count = CASE
                WHEN rl.window_started_at < now() - make_interval(secs => p_window_seconds)
                  THEN 1
                ELSE rl.count + 1
              END,
      window_started_at = CASE
                WHEN rl.window_started_at < now() - make_interval(secs => p_window_seconds)
                  THEN now()
                ELSE rl.window_started_at
              END,
      updated_at = now()
  RETURNING rl.count, rl.window_started_at INTO v_count, v_start;

  IF v_count > p_max THEN
    RETURN QUERY SELECT
      false,
      GREATEST(
        1,
        CEIL(EXTRACT(
          EPOCH FROM (v_start + make_interval(secs => p_window_seconds)) - now()
        ))::integer
      );
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 0;
END;
$$;

-- ============================================================================
-- 5. CLEAR & PRUNE
-- ============================================================================

-- Called after a successful login so a legitimate user's earlier typos do not
-- count against a later session.
CREATE OR REPLACE FUNCTION public.rate_limit_clear(p_key text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  DELETE FROM public.rate_limits WHERE key = p_key;
$$;

-- Without this the table grows one row per (ip, identity) pair forever. Safe to
-- run on any cadence; rows are only removed once they are both outside their
-- window and past any lockout.
CREATE OR REPLACE FUNCTION public.rate_limit_prune(p_older_than_seconds integer DEFAULT 86400)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.rate_limits
  WHERE updated_at < now() - make_interval(secs => p_older_than_seconds)
    AND (lockout_until IS NULL OR lockout_until < now());

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================================
-- 6. GRANTS — service_role only
-- ============================================================================

-- These are SECURITY DEFINER and bypass RLS, so the browser-facing roles must
-- not be able to reach them. An anon caller able to invoke rate_limit_clear
-- could erase its own lockout between attempts.
REVOKE ALL ON FUNCTION public.rate_limit_status(text)                              FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rate_limit_record_failure(text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rate_limit_consume(text, integer, integer)           FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rate_limit_clear(text)                               FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rate_limit_prune(integer)                            FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.rate_limit_status(text)                              TO service_role;
GRANT EXECUTE ON FUNCTION public.rate_limit_record_failure(text, integer, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.rate_limit_consume(text, integer, integer)           TO service_role;
GRANT EXECUTE ON FUNCTION public.rate_limit_clear(text)                               TO service_role;
GRANT EXECUTE ON FUNCTION public.rate_limit_prune(integer)                            TO service_role;

-- ============================================================================
-- 7. COMMENTS — schema documentation
-- ============================================================================

COMMENT ON TABLE  public.rate_limits                   IS 'Shared rate-limit counters for admin login, the public lead form, and the paid aircraft-lookup proxy';
COMMENT ON COLUMN public.rate_limits.key               IS 'Composite bucket identity, e.g. login:<ip>:<email> or lead:<ip>';
COMMENT ON COLUMN public.rate_limits.count             IS 'Events observed inside the current window';
COMMENT ON COLUMN public.rate_limits.window_started_at IS 'Start of the current fixed window; reset once the window elapses';
COMMENT ON COLUMN public.rate_limits.lockout_until     IS 'Set only by rate_limit_record_failure once the failure threshold is hit';
