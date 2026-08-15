-- ============================================================================
-- EAN Aviation — Lead Analytics Aggregate
-- Migration: 003_lead_analytics.sql
-- Created: 2026-08-12
-- Description: Single-round-trip aggregate for the admin dashboard and the
--   /api/analytics/leads + /api/leads/stats routes. Replaces the previous
--   approach of fetching up to 500 fully-joined lead rows into Node and
--   reducing them in JavaScript, which capped every figure at the page size
--   and shipped lead PII (names, emails, messages, notes) to compute counts.
--
--   Decisions encoded here:
--     * `spam` leads are excluded from every figure and reported separately as
--       `spamLeads`, so the headline total describes real pipeline only.
--     * `avgResponseSlaMinutes` is measured, not assumed: the first
--       lead_activities entry whose author is NOT a 'System%' actor, minus the
--       lead's created_at. Returns null when nothing has been answered yet —
--       callers must render that as "no data", never as 0.
--     * Day boundaries use Africa/Lagos, since "inquiries per day" is read by
--       the Lagos sales desk, not in UTC.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.lead_analytics()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  WITH real_leads AS (
    -- Every figure below is built from this set. RLS applies (SECURITY INVOKER),
    -- so only the service_role client sees rows.
    SELECT id, status, service, source, estimated_value, created_at
    FROM public.leads
    WHERE status <> 'spam'
  ),
  counts AS (
    SELECT
      count(*)::int                                                        AS total_leads,
      count(*) FILTER (WHERE status = 'new')::int                          AS new_leads,
      count(*) FILTER (WHERE status IN ('contacted', 'qualified', 'proposal_sent'))::int
                                                                           AS in_progress_leads,
      count(*) FILTER (WHERE status IN ('qualified', 'proposal_sent'))::int AS qualified_leads,
      count(*) FILTER (WHERE status = 'closed_won')::int                    AS closed_won_leads,
      count(*) FILTER (WHERE status = 'closed_lost')::int                   AS closed_lost_leads,
      coalesce(
        sum(estimated_value) FILTER (
          WHERE status IN ('new', 'contacted', 'qualified', 'proposal_sent')
        ), 0
      )::numeric                                                           AS pipeline_value,
      count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int  AS last_7_days
    FROM real_leads
  ),
  spam AS (
    SELECT count(*)::int AS spam_leads
    FROM public.leads
    WHERE status = 'spam'
  ),
  -- Driven off enum_range so all seven services are always present, including
  -- the ones with no leads yet — the donut chart keys off a complete record.
  service_dist AS (
    SELECT jsonb_object_agg(s.service::text, coalesce(c.n, 0)) AS dist
    FROM (SELECT unnest(enum_range(NULL::lead_service)) AS service) s
    LEFT JOIN (
      SELECT service, count(*)::int AS n
      FROM real_leads
      GROUP BY service
    ) c ON c.service = s.service
  ),
  top_sources AS (
    SELECT coalesce(
      jsonb_agg(
        jsonb_build_object('source', t.source, 'count', t.n, 'percentage', t.pct)
        ORDER BY t.n DESC, t.source
      ), '[]'::jsonb
    ) AS sources
    FROM (
      SELECT
        coalesce(nullif(btrim(source), ''), 'Direct') AS source,
        count(*)::int                                AS n,
        CASE
          WHEN (SELECT total_leads FROM counts) > 0
          THEN round(count(*)::numeric * 100 / (SELECT total_leads FROM counts))::int
          ELSE 0
        END                                          AS pct
      FROM real_leads
      GROUP BY 1
      ORDER BY n DESC
      LIMIT 10
    ) t
  ),
  top_pages AS (
    SELECT coalesce(
      jsonb_agg(
        jsonb_build_object('page', p.page, 'count', p.n)
        ORDER BY p.n DESC, p.page
      ), '[]'::jsonb
    ) AS pages
    FROM (
      SELECT
        coalesce(nullif(btrim(t.landing_page), ''), '/') AS page,
        count(*)::int                                    AS n
      FROM public.lead_tracking t
      JOIN real_leads l ON l.id = t.lead_id
      GROUP BY 1
      ORDER BY n DESC
      LIMIT 10
    ) p
  ),
  -- Defaults first so the three known device buckets always exist; `||` lets an
  -- unexpected device_type still surface rather than being silently dropped.
  devices AS (
    SELECT '{"desktop": 0, "mobile": 0, "tablet": 0}'::jsonb
           || coalesce(jsonb_object_agg(d.device, d.n), '{}'::jsonb) AS dist
    FROM (
      SELECT
        coalesce(nullif(btrim(t.device_type), ''), 'desktop') AS device,
        count(*)::int                                         AS n
      FROM public.lead_tracking t
      JOIN real_leads l ON l.id = t.lead_id
      GROUP BY 1
    ) d
  ),
  -- First human touch per lead. 'System%' authors are the automated capture and
  -- pricing-portal entries, which are written at insert time and would report a
  -- response time of zero.
  sla AS (
    SELECT round(
      avg(extract(epoch FROM (fr.first_response - l.created_at)) / 60)
    )::int AS avg_minutes
    FROM real_leads l
    JOIN (
      SELECT lead_id, min(created_at) AS first_response
      FROM public.lead_activities
      WHERE author NOT ILIKE 'System%'
      GROUP BY lead_id
    ) fr ON fr.lead_id = l.id
    WHERE fr.first_response >= l.created_at
  ),
  -- Gap-filled seven-day series: days with no leads must still plot as zero.
  trend AS (
    SELECT coalesce(
      jsonb_agg(
        jsonb_build_object(
          'date',  to_char(d.day, 'YYYY-MM-DD'),
          'label', to_char(d.day, 'Mon FMDD'),
          'count', coalesce(c.n, 0)
        ) ORDER BY d.day
      ), '[]'::jsonb
    ) AS series
    FROM (
      SELECT generate_series(
        (now() AT TIME ZONE 'Africa/Lagos')::date - interval '6 days',
        (now() AT TIME ZONE 'Africa/Lagos')::date,
        interval '1 day'
      )::date AS day
    ) d
    LEFT JOIN (
      SELECT
        (created_at AT TIME ZONE 'Africa/Lagos')::date AS day,
        count(*)::int                                  AS n
      FROM real_leads
      GROUP BY 1
    ) c ON c.day = d.day
  )
  SELECT jsonb_build_object(
    'totalLeads',             counts.total_leads,
    'spamLeads',              spam.spam_leads,
    'newLeads',               counts.new_leads,
    'inProgressLeads',        counts.in_progress_leads,
    'qualifiedLeads',         counts.qualified_leads,
    'closedWonLeads',         counts.closed_won_leads,
    'closedLostLeads',        counts.closed_lost_leads,
    'conversionRate',         CASE
                                WHEN counts.total_leads > 0
                                THEN round(counts.closed_won_leads::numeric * 100 / counts.total_leads)::int
                                ELSE 0
                              END,
    'totalEstimatedPipeline', counts.pipeline_value,
    -- Rolling seven-day average, matching the card's "7-day avg daily influx".
    'dailyInquiryRate',       round(counts.last_7_days::numeric / 7, 1),
    'avgResponseSlaMinutes',  sla.avg_minutes,
    'serviceDistribution',    service_dist.dist,
    'trackingDistribution',   jsonb_build_object(
                                'topSources',      top_sources.sources,
                                'topLandingPages', top_pages.pages,
                                'devices',         devices.dist
                              ),
    'dailyTrend',             trend.series
  )
  FROM counts, spam, service_dist, top_sources, top_pages, devices, sla, trend;
$$;

COMMENT ON FUNCTION public.lead_analytics() IS
  'Dashboard lead aggregates in one round trip. Excludes spam from all figures; '
  'avgResponseSlaMinutes is null when no lead has a human response yet.';

-- Least privilege: only the server-side service_role client calls this. RLS
-- would already return zero rows to anon/authenticated, but the pipeline totals
-- are commercial data, so the grant is explicit rather than inherited.
REVOKE ALL ON FUNCTION public.lead_analytics() FROM PUBLIC;

-- anon/authenticated/service_role are Supabase-specific roles. Guarded so this
-- migration still applies cleanly against the company Postgres later (§19.6).
DO $grants$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.lead_analytics() FROM anon';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.lead_analytics() FROM authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.lead_analytics() TO service_role';
  END IF;
END
$grants$;

-- No new indexes: the SLA aggregate groups lead_activities by lead_id, which
-- idx_lead_activities_lead_id (migration 001) already covers. A partial index on
-- the author predicate was considered and rejected — ILIKE in an index predicate
-- is a portability risk for the eventual move off Supabase.
