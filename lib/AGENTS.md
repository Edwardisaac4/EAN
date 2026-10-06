# lib/ — data layer, services, domain logic

Read alongside the root `AGENTS.md`.

## Supabase clients — pick the right one

All four live in `utils/supabase/`, not here. Choosing wrong is a security bug,
not a style issue.

| Client | Use in | Key | Respects RLS |
|---|---|---|---|
| `client.ts` | `'use client'` components | publishable | yes |
| `server.ts` | Server Components, route handlers | publishable | yes |
| `admin.ts` | **Server only** — route handlers, services | `service_role` | **no** |
| `middleware.ts` | `middleware.ts` only | publishable | yes |

`createClient()` from `server.ts` is **async** — always `await` it.

`adminSupabase` bypasses row-level security entirely. Never import it into a
file that carries `'use client'`, and never into a module reachable from one.
If you need admin data on the client, go through an API route that checks the
session first.

## Layout

```
services/          server-only business logic
  leads-service.ts       all lead CRUD (uses adminSupabase)
  lead-input.ts          zod schemas + guards for every untrusted lead payload
  lead-notifications.ts  Resend email on new lead
pricing/           quote engine
  bands.ts               MTOW bands, tariffs, add-ons — the rate card
  calculations.ts        buildQuote(state) -> QuoteResult
  reveal-store.ts        gates price reveal behind the lead form
mappers/
  lead-mapper.ts         snake_case DB rows -> camelCase admin UI shape
supabase/helpers.ts      dbError() / notFound() response builders
auth.ts                  HMAC session token sign + verify
rate-limiter.ts          in-memory attempt throttle (admin login)
graphql-client.ts        typed browser client for /api/graphql
lead-tracking.ts         UTM / referrer attribution capture
constants.ts             site copy, nav, services, team, blog seed (65 KB)
legal-constants.ts       privacy + terms copy
aircraftData.ts          aircraft reference table
admin-leads-data.ts      Lead/LeadStatus/LeadPriority types for the admin UI
blog-templates.ts        starter Tiptap documents
```

## Rules

**Validate every untrusted payload through `services/lead-input.ts`.** The
public contact form, the pricing portal, and the admin GraphQL endpoint all
feed `createLead`. Casting a field to `string` instead of guarding it let
numbers, objects and arrays reach the insert. Add new fields to the zod schema,
not to the call site.

**`LEAD_SERVICE_VALUES` mirrors the `lead_service` Postgres enum.** Changing
one without the other fails at insert time. A change to either needs a
migration in `supabase/migrations/`.

**Keep the DB shape out of components.** `mappers/lead-mapper.ts` is the only
translation layer between Supabase's snake_case rows and the admin UI's
camelCase `Lead`. Components must never see a raw row.

**`rate-limiter.ts` is in-memory**, held on `globalThis` to survive module
reloads. It does not survive a cold start and is not shared across serverless
instances. It raises the cost of brute force; it is not a guarantee. Do not
present it as one.

**`constants.ts` is imported by client components.** It is 65 KB. Tree-shaking
keeps unused exports out of the bundle — do not defeat that by adding barrel
re-exports or side effects at module scope.

**Pricing figures live in `pricing/bands.ts`.** Never inline a rate in a
component or a route. `buildQuote` falls back to a 5,700 kg MTOW when weight is
missing — that default is deliberate, not a placeholder.

Every figure in `pricing/bands.ts` is transcribed from
`docs/FBO PRICE LIST_adjusted.pdf` and nothing else. The MTOW bands are that
sheet's columns (0–9,000 · 9,001–20,000 · 20,001–30,000 · 30,001–50,000 ·
50,001+ kg), and the quote is USD-only — the passenger service charges, the
₦85,000 VIP lounge rate and the $850 international terminal fee were removed in
August 2026 because the sheet does not carry them. Do not reintroduce a rate the
sheet does not publish; revise the sheet first.

## Database

Tables: `leads`, `lead_tracking`, `lead_activities`, `lead_notes`.
Migrations are ordered files in `supabase/migrations/` — `001_leads_schema`,
`002_fix_linter_security_warnings`, `003_lead_analytics`.

- Never rename or drop a column without a new migration file.
- Enable RLS on every new table.
- Select explicit columns; never `SELECT *`.
- Paginate list queries; never return an unbounded set.
- `uuid` primary keys, never serial.
- Never store passwords, payment details, or government IDs.
