# AGENTS.md — EAN Aviation (ean.aero)

Root context for agents working in this repo. It describes **what is actually
built**. Nested `AGENTS.md` files carry the detail for their area and load only
when you work there:

| File | Covers |
|---|---|
| `components/AGENTS.md` | Component conventions, the animation system |
| `lib/AGENTS.md` | Data layer, Supabase clients, services, pricing engine |
| `app/admin/AGENTS.md` | Admin portal, auth, leads pipeline |

Unbuilt plans (the Sanity CMS, the `lib/seo.ts` architecture, the original
admin spec) are **not** documentation. They are archived in
`docs/archive/AGENTS.legacy-2026-07.md`. Do not treat anything there as
describing this codebase.

---

## 1. What this is

Marketing site + lead-generation funnel for EAN Aviation Limited, a Nigerian
business aviation company operating an FBO at Murtala Mohammed International
Airport, Lagos. Public pages sell the services; a private admin portal triages
the leads they produce.

It is **not** a brochure site. There is real auth, a real database, a GraphQL
endpoint, a pricing calculator, and a blog editor.

## 2. Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 — `@theme` block in `app/globals.css`, **no `tailwind.config.ts`** |
| Animation | GSAP + `@gsap/react` (ScrollTrigger), plus CSS keyframes. **No Framer Motion** — see §7 |
| Database | Supabase (Postgres) |
| Blog | Hybrid: static seed in `lib/constants.ts` + `lib/blog-content.ts`, plus `blog_posts` in Supabase |
| Editor | Tiptap (admin blog) |
| Sanitiser | `isomorphic-dompurify` — the only permitted path to `dangerouslySetInnerHTML` |
| Data fetching | `@tanstack/react-query`, **pricing routes only** (`app/pricing/layout.tsx`) |
| Icons | lucide-react |
| Email | Resend |
| Fonts | Cormorant Garamond (display) + Inter (UI), via `next/font/google` |
| Charts | Hand-rolled SVG. **No charting library is installed** |
| Deployment | Vercel |

`npm run dev` · `npm run build` · `npm run start` · `npm run lint`

`npm run lint` must stay at **zero errors and zero warnings**. It is clean as of
August 2026; a new warning is a regression, not background noise.

### Dependency notes

`axios`, `@emailjs/browser`, `next-sanity` and `@sanity/client` were removed in
August 2026 — they were imported by zero files, and `next-sanity` was the
transitive source of the `framer-motion` that §7 bans. Do not reintroduce them.

`@tanstack/react-query` **is** used, despite what earlier revisions of this file
claimed: `app/pricing/layout.tsx`, `components/pricing/AircraftSelector.tsx` and
`components/pricing/BuildYourQuoteCard.tsx`. Do not remove it as dead weight.

## 3. Structure

No `src/`. No route groups. `app/` is at the repo root.

```
app/
  layout.tsx            root layout — fonts, metadata, GA, JSON-LD, PublicShell
  globals.css           @theme design tokens + animation keyframes
  page.tsx              homepage
  sitemap.ts            build-time sitemap — static routes + services + blog
  robots.ts             robots.txt; disallows /admin and /api
  not-found.tsx         branded 404
  error.tsx             route-level error boundary (client)
  global-error.tsx      root-layout failure boundary; inline styles by necessity
  about|history|team|contact|pricing|services|blog|privacy-policy|terms|terms-of-use/
    layout.tsx          server layout per client page — owns metadata + JSON-LD
  services/[slug]/      SSG service detail pages
  blog/[slug]/          blog post — static seed + Supabase
  admin/                protected portal, own layout        → app/admin/AGENTS.md
  api/                  15 route handlers
components/             → components/AGENTS.md
  blog/ArticleBody.tsx  renders structured article bodies; owns body typography
  shared/JsonLd.tsx     emits <script type="application/ld+json">
  shared/HoneypotField.tsx  spam trap for the public lead forms
lib/                    → lib/AGENTS.md
  seo.ts                buildMetadata + PAGE_SEO + JSON-LD builders
  blog-content.ts       article bodies as typed blocks, keyed by slug
  gsap-motion.ts        withReducedMotion — the prefers-reduced-motion gate
  rate-limiter.ts       Postgres-backed; requires migration 004
utils/supabase/         browser / server / admin / middleware clients
types/                  database, pricing, inquiry, supabase
supabase/migrations/    001 leads · 002 linter fixes · 003 analytics
                        004 rate limits · 005 blog_posts (backfilled)
proxy.ts                auth gate for /admin and /api only (was middleware.ts)
next.config.ts          images, security headers, caching — read §8 before editing
```

**Metadata lives in a server `layout.tsx`, not the page.** Most public pages are
`'use client'` for GSAP, and a client component cannot export `metadata`. That is
why each has a sibling server layout whose only job is `metadata` + JSON-LD. Add
one when you add a client page, or the page silently inherits the root title.

## 4. Routes

**Public** — `/` `/about` `/history` `/team` `/services` `/services/[slug]`
`/pricing` `/blog` `/blog/[slug]` `/contact` `/privacy-policy` `/terms-of-use`
(`/terms` 307-redirects to `/terms-of-use`), plus `/sitemap.xml` and
`/robots.txt`.

The blog carries the three real articles migrated from the WordPress site:
`understanding-ciq-business-aviation-international-flights`,
`in-loving-memory-of-eyitayo-aiyetan`, and
`why-top-ceos-are-choosing-fbo-services-over-first-class`. The six earlier
placeholder posts were removed — they described articles that were never written
and asserted invented market figures as fact.

**Admin** — `/admin` `/admin/leads` `/admin/analytics` `/admin/blog`
`/admin/blog/new` `/admin/blog/[slug]/edit` `/admin/settings` `/admin/login`

**API** — `/api/leads` (+ `/[id]`, `/export`, `/stats`), `/api/graphql`,
`/api/pricing/quote`, `/api/aircraft/search`, `/api/analytics/leads`,
`/api/admin/*` (login, logout, upload, blog CRUD, leads/forward).

Everything except `/blog/[slug]`, the admin blog editor, and the API is
statically prerendered. Keep it that way — do not introduce request-time data
fetching into a public page without a reason.

## 5. Design tokens

Defined in `app/globals.css` under `@theme`. Always use the token; never a raw
hex, never an arbitrary colour value — with one deliberate exception, below.

The palette is **blue/paper**, replacing the ink/brass one. Every surface is
white or a near-white step; the brand blue (`#2b0098`, the CEO's value and, to
within three RGB units, the logotype's own indigo) is the only accent. The names
are four swaps stale — `ean-navy` is not navy, `ean-black` is white, `ean-gold`
is blue. They stayed to avoid a 900-site churn.

```
Surfaces  ean-black / ean-black-pure / ean-white / ean-obsidian #ffffff  (paper)
          ean-navy / ean-black-accent / ean-obsidian-raised #f4f5f7     (raised)
          ean-navy-mid #f9fafb
          ean-surface / ean-obsidian-elevated / -highlight #eaecf0      (recessed)
Legacy    ean-burgundy · -mid · -deep · -dark · -night · -rich · -accent · -dusk
          — aliases onto the paper ramp. Prefer the surfaces above in new code.
Accent    ean-gold #2b0098 (13.50:1 on paper) · ean-gold-light #4a1fd0 (8.76:1)
          ean-gold-muted · ean-indigo / ean-blue #2b0098 (collapsed onto the accent)
          ean-blue-light #4a1fd0 · ean-blue-muted · ean-blue-border
Neutral   ean-grey #969696 — the brand grey. STRUCTURE ONLY, see below
          ean-slate #6b6b6b (5.33:1) · ean-slate-deep #4a4a4a (8.86:1)
          Not surface-constrained: both clear AA on all three papers.
Status    ean-live #0f6b45 (6.54:1) · ean-error #b91c1c (6.47:1) — both may carry text
Text      ean-text-light #1f1f23 (ink, 16.43:1 on paper) · ean-muted-light #4a4a4a
          ean-text-dark #ffffff (13.50:1 on the blue fill) · ean-muted-dark #cfc6ee
Borders   ean-border-dark rgba(150,150,150,.45) · ean-border-light rgba(150,150,150,.30)
Fonts     font-display (Fraunces) · font-ui (Archivo) · font-mono (IBM Plex Mono)
```

**`-light` and `-dark` name the SURFACE, not the type.** `text-ean-text-light` is
"type for a light-on-dark context" and on the paper ramp that is **ink**;
`text-ean-text-dark` is "type for a dark-on-light context" and on the blue fill
that is **white**. The pair inverted with the swap, which is exactly what lets
588 existing call sites resolve correctly without being touched. Read the name as
a role, never as a colour.

**The blue is a surface, not only an accent.** Its relative luminance is 0.0278 —
one step above the old ink ramp's top step and nowhere near the papers. The paper
steps are 1.09 and 1.18 apart, so they cannot carry section rhythm the way the
old dark/light alternation did (18.83). A full-bleed `#2b0098` band and full-bleed
photography are what replace it. **Composition rule: no more than two consecutive
sections on paper.**

**`ean-grey` (`#969696`) must never carry text.** It measures 2.96:1 on paper —
below AA text (4.5:1) *and* below AA large text (3:1), and below the 3:1 non-text
floor for a border that is a control's only affordance. It is the hairline,
divider, table-rule and grid-gap colour. For muted type use `ean-slate`
(`#6b6b6b`, 5.33:1). Inside a blue fill the grey does clear 4.5:1 (4.56:1) and may
be used there.

**The one exception to "always use the token":** literal `text-white`,
`bg-black/70`, `from-black/80` and friends are correct — and required — over
**photography**. There is no token whose job is "type on a photograph", and
inventing one for ~45 sites was not worth a 25th token. A photo band is a dark
scrim carrying white type; a paper section is a token surface carrying token
type. Do not mix them.

The migration plan, the per-file inventory, and the design work still outstanding
are in `docs/specs/2026-09-01-light-blue-grey-theme.md`. The engineering track
(§1–§8) has shipped; the redesign track (§9 — band rhythm, QuoteCalculator, the
per-page rebuilds) is gated on comps and has not.

`font-display` is for headlines. Body copy, labels and UI text are `font-ui`.

## 6. Next.js 16 rules

- Dynamic `params` is a **Promise**: type it `Promise<{ slug: string }>` and
  `await` it before destructuring, in both the page and `generateMetadata`.
- `cookies()` is async. The Supabase server client already handles it — always
  `await createClient()`.
- Server Components are the default. Add `'use client'` only for hooks, GSAP,
  or browser APIs.
- `next/image` for every image, `next/link` for every internal link.
- Never import `adminSupabase` into a client component — it bypasses RLS.

## 7. Animation

Framer Motion was removed. Nothing may reintroduce it.

- **GSAP + ScrollTrigger** — scroll-driven work only: parallax, section
  reveals, stat counters, and the navbar chrome collapse. Always `useGSAP` from
  `@gsap/react`, never a raw `useEffect`. Register plugins at file level,
  outside the component. The navbar is the one that does **not** use
  ScrollTrigger: GSAP.md §6.6 takes a plain scroll listener there, because the
  same listener has to set the React state that drives the colour swap.
- **CSS keyframes in `globals.css`** — entrances, exits, hovers, the marquee.
  Utility classes: `ean-rise`, `ean-enter-*` / `ean-exit-*` (fade, up, down,
  dropdown, scale, modal), `ean-indicator`, `ean-preloader*`.
- **The preloader** (`components/layout/Preloader.tsx`) — a flight path that
  draws itself while an inline-SVG jet climbs it trailing vapour, handing off to
  a staggered `EAN` lockup, over an opaque veil that dissolves once the artwork
  is done. Zero runtime JS, zero network requests. Not a Server Component,
  though the file reads like one: `PublicShell` is `'use client'`, so it lands in
  the client bundle — harmless for first paint, since the markup is server-
  rendered and the animation is CSS. The main `ean-preloader*` layers share one
  **1.4s** timeline, so their stops are percentages of 1.4s, not delays; the
  letters and rule are the exception and carry real `animation-delay`s, because a
  stagger cannot be expressed as percentages of a single animation. The vapour
  trail is a moving dash window (`stroke-dasharray: 0.26 1` against
  `pathLength="1"`) rather than a second motion path, which is what keeps it
  locked to the jet for free. Read §8 before retiming any of it.
- **`components/shared/Presence.tsx`** — the `AnimatePresence` replacement.
  Holds a child mounted for its exit duration; renders no wrapper element.
- **Sliding indicators** (nav underline, service tabs, blog filters) — one
  absolutely positioned element per group, measured with
  `offsetLeft`/`offsetWidth`, moved by transform, with a `ResizeObserver` to
  stay attached. See `components/layout/Navbar.tsx` for the reference
  implementation.

**Every animation must respect `prefers-reduced-motion`, and for GSAP that means
`withReducedMotion` from `lib/gsap-motion.ts`.** The `@media (prefers-reduced-motion)`
block in `globals.css` can only reach the CSS utility classes — it has no effect
on a GSAP tween. Wrap every `useGSAP` body:

```ts
useGSAP(
  () => withReducedMotion(
    () => { /* the animation */ },
    () => { /* the resting state */ }
  ),
  { scope: ref }
);
```

The second callback is not optional. These animations tween *from* `opacity: 0`,
so a reduced-motion branch that merely skipped the tween would leave the content
permanently invisible. `settle` is where the final state is applied directly.
`StatCounter` is the sharp edge: its animate branch blanks the text to `0`, so its
settle branch must leave the server-rendered figure untouched.

## 8. Performance — do not regress these

These were deliberate fixes. Each has a failure mode that is invisible in dev.

**Content must paint without JavaScript.** Never ship an element whose only
path to being visible is a JS animation — no `opacity-0` class removed later by
GSAP, no full-screen overlay torn down on hydration. That pattern gates FCP and
LCP behind the entire client bundle. The hero and preloader are CSS-driven for
exactly this reason. `StatCounter` renders its real figure in the markup and
resets to `0` in JS, so crawlers and no-JS visitors read the true number.

**The preloader's veil holds opaque until the artwork is finished, and the beat
is short to pay for that.** The timeline is **1.4s**: veil fully opaque 0 → 1.15s
(`82%`), covering the jet's climb (0 → 0.77s) and the lockup's stagger (0.60 →
1.08s); the veil and the artwork then dissolve together 1.15 → 1.36s (`97%`);
the wrapper hides at 1.4s. The veil and the mark share the `ean-veil-out`
keyframe precisely so they cannot drift apart.

This deliberately reverses an earlier design that cleared the backdrop at 0.60s
and let the jet finish its climb over the live hero, keeping the opaque phase
tiny. That was the cheaper choice for Lighthouse's Speed Index — an opaque
full-viewport layer is the one thing SI penalises, because it scores a filmstrip
of visual progress — but it made the site appear while the preloader was still
playing, which defeats the point of having one. **Speed Index is the price, and
it is the only metric that moves**: the opaque phase went 0.60s → 1.15s, so
expect SI to rise by roughly that difference from its ~1.0–1.1s baseline. LCP,
CLS and TBT are still indifferent — LCP performs no occlusion test for overlays,
the layer is `fixed`/`inset-0` and out of flow, and there is no JS.

The old "Performance held at 99 across four runs, 1.2s → 2.6s" measurement was
taken against the split timeline and **no longer describes this build**. Re-run
Lighthouse before quoting a number.

If Speed Index needs buying back, shorten the beat and scale every percentage
stop with it — 1.2s was a shipped length before, so there is room. Do not
reintroduce an early veil clear. `pointer-events-none` on the wrapper is still
required, but it now covers only the 0.25s dissolve rather than three quarters
of the beat.

**`images.qualities` in `next.config.ts` is a whitelist.** Next 16 returns
**HTTP 400** for any `quality` not listed. It currently allows `[70, 75, 80]` —
70 for full-bleed hero art, 80 for content imagery, 75 because that is the
default for any `<Image>` that omits the prop. Add a new value to the array
*before* using it in a component.

**Never put a comma in an image filename.** The optimizer rejects it with
"The requested resource isn't a valid image." Spaces and parentheses are fine.

**`priority` belongs only on a genuine above-the-fold LCP image**, one per
page. Each extra `priority` adds a preload that competes with the real LCP.

**Only the active hero slide is server-rendered.** The rest mount after idle.
Absolutely positioned slides sit inside the viewport, so `loading="lazy"` does
not defer them — mounting does.

**`proxy.ts` matches `/admin` and `/api` only.** Public pages are static; do
not widen the matcher.

**`next.config.ts` sends security headers on every route**, including a CSP.
`script-src` carries `'unsafe-inline'` deliberately: a nonce cannot be embedded in
statically prerendered HTML, so adopting one would force every public page to
render on demand and throw away the prerendering this section protects. Do not
"fix" it by adding a nonce without also accepting that cost.

**`images.remotePatterns` must cover Supabase Storage.** Blog covers uploaded via
`/api/admin/upload` are served from the Supabase public bucket. Without the
pattern, `<Image src={cover_image_url}>` throws "hostname is not configured" and
takes the whole post page down at request time.

Source images live in `public/images/` as JPEG. Photos are never PNG.

## 9. Environment

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          server-only — never NEXT_PUBLIC_
ADMIN_EMAIL / ADMIN_PASSWORD       admin login
ADMIN_SESSION_SECRET               HMAC key for the session cookie
RESEND_API_KEY                     server-only
NEXT_PUBLIC_GA_MEASUREMENT_ID      optional; GA is skipped when unset
NEXT_PUBLIC_SITE_URL              optional; canonical origin override for
                                  preview deploys. Defaults to https://ean.aero
API_NINJAS_KEY / RAPIDAPI_KEY / RAPIDAPI_AERODATABOX_KEY   aircraft lookup
```

`RESEND_API_KEY` is **not** in the local `.env.local`. When it is unset,
`lib/services/lead-notifications.ts` logs a warning and returns — the lead is
still saved, but nobody is emailed about it. Confirm it is set in Vercel, or lead
alerts are silently dropped in production.

## 10. Code standards

- Strict TypeScript. No `any`, no `as any`, no `@ts-ignore`.
- Explicit prop types via `interface`; `type` for other object shapes.
- Components PascalCase · hooks `use*` · constants SCREAMING_SNAKE_CASE ·
  handlers `handle*` · booleans `is*`/`has*`.
- Import order: React → Next → third-party → internal (`@/…`).
- No dead imports, no placeholder comments, no `TODO`.
- Comment *why*, not *what*. If a line looks wrong but is deliberate, say why.
- `console.*` is stripped from production builds except `error` and `warn` —
  do not rely on it reaching a user.

## 11. Rate limiting

`lib/rate-limiter.ts` is backed by the `rate_limits` table and the
`rate_limit_*` functions in **migration 004**. Counters are shared across lambda
instances; the previous in-memory `Map` could not work on Vercel, where each
instance held its own.

Every helper **fails open** and logs `[rate-limiter] … allowing request
unthrottled`. Seeing that line in production means migration 004 has not been
applied — the limits are silently absent even though the code is present.

Guarded surfaces: admin login (5 failed attempts / 15 min, then a 15 min
lockout), `POST /api/leads` (5 / hour / IP), `/api/aircraft/search` (30 / min /
IP, protecting metered third-party API spend).

The public lead forms also carry a honeypot (`components/shared/HoneypotField.tsx`,
validated in `app/api/leads/route.ts`). A tripped honeypot returns the normal
success shape so the bot gets no signal — do not "fix" that into an error.

## 12. Not built

Do not assume these exist; say so if a task depends on one.

- **A test suite.** Still nothing. No CI gate on `lint` or `build` either.
- **Purpose-built OG images** (`public/images/og/`). Open Graph tags exist on
  every page, but they point at existing photography rather than 1200×630
  branded cards, so social platforms crop them.
- **Multi-user admin auth.** Login is still a single shared credential in
  `ADMIN_EMAIL`/`ADMIN_PASSWORD`, compared in constant time, with no per-user
  accounts and no audit trail of who changed which lead. Sessions are revocable
  only in bulk, by rotating `ADMIN_SESSION_SECRET` or the password (see the `sv`
  claim in `lib/auth.ts`).
- **Error monitoring.** No Sentry or equivalent. `error.tsx` surfaces a `digest`
  to the user and logs it, but nothing aggregates those.
- **Blog view counts.** The admin blog table renders a `views` column that no
  database column backs, so it always shows 0. Either add the column and a
  tracking path, or remove the metric.
- **The WordPress→new-URL redirects.** Deliberately not built: the new site
  replaces ean.aero, so redirects pointing at ean.aero would be circular. A
  www→apex redirect is still unconfigured.
- shadcn/ui — no `components/ui/` directory

### The founding year is 2011 — C44, settled 18 August 2026

Every surface says **2011**, and new copy must not reintroduce another year.
`TRUST_STATS` publishes "2011 · Founded in Lagos", the homepage About section
reads "Founded in Lagos in 2011", and `TIMELINE_EVENTS` opens on a single 2011
card. `foundingDate: "2011"` is now asserted in the `organizationSchema` JSON-LD
in `lib/seo.ts`, which had withheld it while the timeline disagreed.

The founding, the first integrated FBO hangar and the Wings™ flight kitchen are
**three separate cards that all carry the year 2011**. The card boundaries are
free to move; **the year is not**. These were once dated 2009 and 2010, which put
the catering launch before the company existed — never re-date either of them
off 2011. (They were briefly merged into one card to enforce that; splitting them
again on a shared 2011 keeps the constraint without the merge.) `/history`
therefore holds three 2011 cards — founding, Wings™ and the NCAA AMO approval —
and its header range reads "2011 / 2026".

Note that `docs/reviews/2026-08-18-content-signoff-brief.md` still records C44 as
open, and argues against 2011 on the grounds above; that objection is answered by
the merge. The brief is a point-in-time record and was left unedited.

`/history` keeps its own separate metrics strip, reading "15+ Years of
Operation" — consistent with 2011 as of 2026.

### TRUST_STATS is shared

`TRUST_STATS` (`lib/constants.ts`) is the single source for the four KPIs on both
the homepage band (`components/sections/TrustBar.tsx`) and the `/about` metric
cards — `label` is the short band form, optional `description` the card sentence.

---

*Rewritten August 2026 against the repo as built, and revised 17 August 2026
after the production-readiness pass (security headers, shared-state rate
limiting, DOMPurify, SEO layer, error boundaries, reduced-motion gate, blog
migration). When you change something this file describes, update it in the same
commit.*

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
