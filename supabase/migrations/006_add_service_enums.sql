-- =============================================================================
-- 006 — Extend lead_service enum with three new categories
-- =============================================================================
-- Global Flight Support, Aeroplex/Investor enquiries, and Press & Media
-- contacts all previously routed through 'general' and lacked distinct
-- pipeline tracking.  Adding first-class enum values lets the CRM filter,
-- prioritise, and report on them independently.
--
-- NOTE: ALTER TYPE … ADD VALUE cannot run inside a transaction block in
-- PostgreSQL < 12.  Supabase runs PG 15, so this is safe as a single
-- migration file.
-- =============================================================================

ALTER TYPE lead_service ADD VALUE IF NOT EXISTS 'flight_support';
ALTER TYPE lead_service ADD VALUE IF NOT EXISTS 'aeroplex';
ALTER TYPE lead_service ADD VALUE IF NOT EXISTS 'press';
