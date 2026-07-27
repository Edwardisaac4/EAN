-- ============================================================================
-- EAN Aviation — Leads Collection Schema
-- Migration: 001_leads_schema.sql
-- Created: 2026-07-28
-- Description: Core tables for lead capture, tracking, activities, and notes
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================================

CREATE TYPE lead_service AS ENUM (
  'fbo', 'maintenance', 'charter', 'catering', 'vip', 'leasing', 'general'
);

CREATE TYPE lead_status AS ENUM (
  'new', 'contacted', 'qualified', 'proposal_sent', 'closed_won', 'closed_lost', 'spam'
);

CREATE TYPE lead_priority AS ENUM (
  'urgent', 'high', 'normal', 'low'
);

-- ============================================================================
-- 2. LEADS TABLE — core lead records
-- ============================================================================

CREATE TABLE leads (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_code     text        UNIQUE NOT NULL,
  full_name     text        NOT NULL,
  email         text        NOT NULL,
  phone         text        DEFAULT '',
  company       text,
  service       lead_service NOT NULL DEFAULT 'general',
  message       text        NOT NULL DEFAULT '',
  status        lead_status  NOT NULL DEFAULT 'new',
  priority      lead_priority NOT NULL DEFAULT 'normal',
  estimated_value numeric(12,2) DEFAULT 0,
  source        text        DEFAULT 'Website Form',
  assigned_to   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_leads_status     ON leads (status);
CREATE INDEX idx_leads_priority   ON leads (priority);
CREATE INDEX idx_leads_service    ON leads (service);
CREATE INDEX idx_leads_source     ON leads (source);
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX idx_leads_email      ON leads (email);
CREATE INDEX idx_leads_lead_code  ON leads (lead_code);

-- Full-text search index for name, email, company
CREATE INDEX idx_leads_search ON leads USING gin (
  to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(company, ''))
);

-- ============================================================================
-- 3. LEAD_TRACKING TABLE — UTM attribution and device fingerprinting
-- ============================================================================

CREATE TABLE lead_tracking (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  utm_term          text,
  referrer_url      text,
  referrer_domain   text,
  landing_page      text,
  form_page         text,
  form_id           text,
  device_type       text        DEFAULT 'desktop',
  browser_name      text,
  user_language     text,
  screen_resolution text,
  ip_address        text,
  captured_at       timestamptz DEFAULT now(),

  CONSTRAINT fk_lead_tracking_lead FOREIGN KEY (lead_id)
    REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX idx_lead_tracking_lead_id    ON lead_tracking (lead_id);
CREATE INDEX idx_lead_tracking_utm_source ON lead_tracking (utm_source);
CREATE INDEX idx_lead_tracking_device     ON lead_tracking (device_type);

-- ============================================================================
-- 4. LEAD_ACTIVITIES TABLE — audit trail
-- ============================================================================

CREATE TABLE lead_activities (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author      text        NOT NULL DEFAULT 'System',
  action      text        NOT NULL,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_activities_lead_id    ON lead_activities (lead_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities (created_at DESC);

-- ============================================================================
-- 5. LEAD_NOTES TABLE — internal rep notes
-- ============================================================================

CREATE TABLE lead_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author      text        NOT NULL DEFAULT 'Admin',
  content     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_notes_lead_id ON lead_notes (lead_id);

-- ============================================================================
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. AUTO-GENERATE lead_code FUNCTION & TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_lead_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  next_num integer;
  year_str text;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(
      NULLIF(regexp_replace(lead_code, '^EAN-LD-\d{4}-', ''), '')
      AS integer
    )
  ), 0) + 1
  INTO next_num
  FROM leads
  WHERE lead_code LIKE 'EAN-LD-' || year_str || '-%';

  NEW.lead_code := 'EAN-LD-' || year_str || '-' || lpad(next_num::text, 3, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_leads_generate_code
  BEFORE INSERT ON leads
  FOR EACH ROW
  WHEN (NEW.lead_code IS NULL OR NEW.lead_code = '')
  EXECUTE FUNCTION generate_lead_code();

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables (Default Deny for direct anon/public access)
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tracking   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes      ENABLE ROW LEVEL SECURITY;

-- Note: All lead capture and admin operations are securely routed through server-side
-- API routes using the Supabase service_role key (adminSupabase), which bypasses RLS.
-- Direct client REST API writes/reads are blocked by default RLS policy.

-- ============================================================================
-- 9. COMMENTS — schema documentation
-- ============================================================================

COMMENT ON TABLE  leads             IS 'Core enquiry/lead records from all EAN service contact forms';
COMMENT ON TABLE  lead_tracking     IS 'UTM attribution, referrer, device and session data per lead';
COMMENT ON TABLE  lead_activities   IS 'Chronological audit trail of all actions taken on a lead';
COMMENT ON TABLE  lead_notes        IS 'Internal notes and comments added by sales representatives';

COMMENT ON COLUMN leads.lead_code   IS 'Human-readable sequential code e.g. EAN-LD-2026-001';
COMMENT ON COLUMN leads.service     IS 'Service line: fbo, maintenance, charter, catering, vip, leasing, general';
COMMENT ON COLUMN leads.status      IS 'Pipeline stage: new → contacted → qualified → proposal_sent → closed_won/closed_lost/spam';
COMMENT ON COLUMN leads.priority    IS 'Response urgency: urgent (SLA <1h), high, normal, low';
COMMENT ON COLUMN leads.source      IS 'Derived marketing channel label e.g. Google Ads, LinkedIn, Direct Visit';
