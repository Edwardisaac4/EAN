-- ============================================================================
-- Migration: 002_fix_linter_security_warnings.sql
-- Created: 2026-07-28
-- Description: Fix Supabase Database Security Linter Warnings:
--   1. Set explicit search_path on update_updated_at_column & generate_lead_code (lint 0011)
--   2. Drop overly permissive WITH CHECK (true) RLS policies (lint 0024)
-- ============================================================================

-- 1. Fix search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Fix search_path & concurrency/type-safety on generate_lead_code
CREATE OR REPLACE FUNCTION public.generate_lead_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  next_num integer;
  year_str text;
BEGIN
  year_str := to_char(now(), 'YYYY');

  -- Acquire transaction-level advisory lock per year to prevent concurrent sequence race conditions
  PERFORM pg_advisory_xact_lock(hashtext('lead_code_' || year_str));

  SELECT COALESCE(MAX(
    CAST(
      substring(lead_code from '^EAN-LD-\d{4}-(\d+)$') AS integer
    )
  ), 0) + 1
  INTO next_num
  FROM leads
  WHERE lead_code ~ ('^EAN-LD-' || year_str || '-\d+$');

  NEW.lead_code := 'EAN-LD-' || year_str || '-' || lpad(next_num::text, 3, '0');
  RETURN NEW;
END;
$$;

-- 3. Drop overly permissive WITH CHECK (true) RLS policies on INSERT
-- Lead capture and admin management are performed securely server-side
-- using the Supabase service_role admin client (adminSupabase), which bypasses RLS.
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Public can insert lead tracking" ON public.lead_tracking;
DROP POLICY IF EXISTS "Public can insert lead activities" ON public.lead_activities;
