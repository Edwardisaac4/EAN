# v7 Ink/Brass Redesign — Implementation Plan

**Date:** 31 August 2026
**Source of truth:** `EAN_Revised_Site_v7_FOR_YUWA.html` (change-order prototype), read
in **clean view** — annotations off. The annotation layer is review scaffolding and
ships nothing.
**Status:** Not started. Supersedes the dark half (Job B) of
[2026-08-31-blue-gold-dark-theme.md](./2026-08-31-blue-gold-dark-theme.md), whose
Job A (de-burgundy) already shipped.

**Goal:** Take the site from indigo/gold-on-mixed-surfaces to the prototype's
ink/brass/ivory system — Fraunces + Archivo + IBM Plex Mono, near-black surfaces
throughout, hairline rules, square geometry — and rebuild the six page layouts the
prototype restructures.

**Scope: the public site only. The admin console is out of scope and must come out
of this work looking exactly as it does today.** That is not free — see §4.5. Admin
resolves through the same `@theme` tokens as the public site, so it changes with the
swap unless it is deliberately pinned. §4.5 is the pin, and it ships in the same
commit as the palette.

All counts below were measured against the repo on 31 August 2026, not estimated.
Method: word-boundary utility scan across the 149 `.ts`/`.tsx`/`.css` files outside
`node_modules`, `.next` and `docs`; raw-literal scan for every hex and `rgba()` in
`.ts`/`.tsx`. **Every count in this document is public-side only** unless the row
says otherwise; admin figures appear only in §4.5, where they are the size of the
thing being held still.

---

## 1. This is four jobs, ordered by risk

Keeping them separate is the plan. Each one is independently shippable and
independently reviewable, and the first two are nearly free.

| | Job | Scope | Files | Risk |
|---|---|---|---|---|
| **T** | Typography swap | 3 font families | **2** | Very low — mechanical, but re-tunes every heading size (§3.3) |
| **P** | Palette swap | 24 token values + 145 raw literals + the admin pin | **1 + 22 + 2** | Low — provable per-pairing contrast (§4.3) |
| **G** | Geometry | 461 `rounded-*`, borders → hairline | **~40** | Low, tedious. Purely visual |
| **L** | Layout rebuild | 6 pages restructured, 2 new routes, ~14 new components | **~45** | High — real design and copy work, section by section |

**T and P do not require G or L.** The site can be Fraunces-on-ink with its current
rounded cards and current section layouts, shipped and reviewed, before anything is
restructured. Do T, then P, ship, then G, then take L page by page.

---

## 2. The lever: 2,036 public references change with zero component edits

Every colour and every font on the site resolves through a `@theme` token in
[app/globals.css](../../app/globals.css). Tailwind v4 resolves `bg-ean-navy` to
`--color-ean-navy` and `font-display` to `--font-display` at build time, so:

| What | Public refs | Files touched to change it |
|---|---|---|
| `font-ui` (Inter → Archivo) | 437 | `app/layout.tsx` |
| `font-display` (Cormorant → Fraunces) | 131 | `app/layout.tsx` |
| `font-mono` (browser stack → IBM Plex Mono) | 74 | `app/globals.css` — **token does not exist yet** |
| `ean-gold*` (gold → brass) | 915 | `app/globals.css` |
| `ean-navy*` / `ean-black*` (indigo → ink) | 334 | `app/globals.css` |
| `ean-burgundy*` (legacy aliases) | 74 | `app/globals.css` |
| `ean-obsidian*` | 71 | `app/globals.css` |

**Two files carry Jobs T and P for 2,036 of 2,181 public call sites.** Rewrite the
values and the public site turns ink and brass at once.

Three corollaries, and they are the entire manual surface of T and P:

1. **The 145 raw hex/`rgba()` literals in 22 files will not follow.** Listed in §4.4.
2. **`font-mono` has no token today.** 74 public call sites currently render in the
   browser's default monospace. Defining `--font-mono: IBM Plex Mono` upgrades all
   74 for free — the single highest-yield line in the plan, and the prototype leans
   on mono type heavily (eyebrows, basis lines, ops strip, stat labels, dept tags).
3. **The same lever reaches into admin, which is out of scope.** 1,013 admin
   references (935 colour, 78 font) move with these values whether we intend it or
   not. §4.5 pins them.

---

## 3. Job T — typography

### 3.1 What changes

| Role | Now | Prototype | Weights used | Notes |
|---|---|---|---|---|
| Display / headings | Cormorant Garamond | **Fraunces** | 300, 400, 500, italic 300 | `wght` axis default; italic needs `style` |
| Body / UI | Inter | **Archivo** | 300, 400, 500, 600, 700 | variable, one file |
| Mono | *(browser default)* | **IBM Plex Mono** | 400, 500 | static — weights must be listed |

### 3.2 Files

**`app/layout.tsx`** — swap the two `next/font/google` loaders for three:

```ts
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],    // prototype uses italic 300 for pull-quotes
  axes: ["SOFT", "WONK", "opsz"], // declare or they pin at defaults
  display: "swap",
});
const archivo = Archivo({ variable: "--font-ui", subsets: ["latin"], display: "swap" });
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],         // not a variable font — required
  display: "swap",
});
```

…and add all three variables to the `<html className>`.

**`app/globals.css`** — the `@theme` typography block:

```css
--font-display: var(--font-display), ui-serif, serif;
--font-ui: var(--font-ui), ui-sans-serif, sans-serif;
--font-mono: var(--font-mono), ui-monospace, monospace;   /* NEW */
```

Plus the prototype's heading defaults, which the repo has no equivalent for
(`letter-spacing: -.012em; line-height: 1.14; font-weight: 300` on h1/h2/h3) — add
as a `@layer base` rule rather than repeating three utilities on 153 headings.

### 3.3 The one real gotcha: Fraunces is not a drop-in for Cormorant

Cormorant Garamond is a small-x-height, high-contrast Garamond. Fraunces has a much
larger x-height and a wider default advance at the same `font-size`. Every heading
will read **noticeably larger and heavier** at its current class — the
`text-3xl sm:text-5xl … xl:text-8xl` scales in
[HeroSection.tsx](../../components/sections/HeroSection.tsx) especially.

The prototype's own scale is the target and it is narrower than ours:
`clamp(36px, 5.6vw, 68px)` for the hero h1, `clamp(26px, 3.4vw, 40px)` for section
h2, 23–25px for card h3. Expect to step display sizes **down one stop** across the
board as part of Job T, not as a later fix. This is the part of T that needs eyes,
not a script.

Also note: the prototype loads fonts via a `<link>` to `fonts.googleapis.com`.
**Do not port that.** `next.config.ts:52,54` sets
`style-src 'self' 'unsafe-inline'` and `font-src 'self' data:` — a Google Fonts
`<link>` is blocked by our own CSP. `next/font` self-hosts, which is why it works
today and why it stays.

### 3.4 Deliberately not in Job T

Renaming `--font-ui` to `--font-sans`. That is a 445-site cosmetic churn with no
visual effect. Repoint the value; keep the name.

---

## 4. Job P — palette

### 4.1 The prototype's system

```
ink   #0E1214   ink2 #161C1F   ink3 #1D2529      surfaces, darkest first
ivory #F5F2EA   ivory2 #C9C4B6                   body text, secondary text
brass #A9895A   brassL #C4A576                   the only accent
slate #8A939B   slateD #5B6670                   small print, labels
live  #2E7D5B                                    ops-strip status dot only
hair  rgba(245,242,234,.13)                      every rule on the site
max   1160px                                     container
```

Three facts to absorb before touching values:

- **There is no light surface anywhere.** Not one section, not one card. Our
  `ean-surface`, `ean-text-dark`, `ean-border-light`, `bg-white` — 420 call sites —
  have no counterpart. That is Job L's biggest mechanical chunk (§6.0).
- **Body text is ivory `#F5F2EA`, not white.** `--color-ean-text-light: #ffffff` is
  wrong for this system. The warm off-white against warm brass is most of why the
  prototype reads as it does.
- **Brass is the only accent.** No second colour. `ean-blue*` and `ean-indigo` are
  already at 0 public call sites, so nothing breaks — but they should be deleted,
  not repointed, or someone will reach for them.

### 4.2 Token mapping — `app/globals.css` only

| Token | Now | → | Prototype role |
|---|---|---|---|
| `--color-ean-black` | `#0a041b` | `#0E1214` | body / page ground (`ink`) |
| `--color-ean-black-pure` | `#04010a` | `#0A0D0F` | ops strip, footer |
| `--color-ean-navy` | `#180a3e` | `#161C1F` | `.band` (`ink2`) |
| `--color-ean-navy-mid` | `#100728` | `#111618` | `.band.alt` |
| `--color-ean-black-accent` | `#100728` | `#12171A` | dropdown, partner cell |
| `--color-ean-obsidian` | `#08080a` | `#0E1214` | collapse the ramp onto ink… |
| `--color-ean-obsidian-raised` | `#0a0a0d` | `#161C1F` | …ink2… |
| `--color-ean-obsidian-elevated` | `#0d0d12` | `#1D2529` | …ink3 (card hover) |
| `--color-ean-obsidian-highlight` | `#0f0f14` | `#1D2529` | |
| `--color-ean-gold` | `#c4952a` | `#A9895A` | brass |
| `--color-ean-gold-light` | `#d4ab50` | `#C4A576` | brassL |
| `--color-ean-gold-muted` | `rgba(196,149,42,.25)` | `rgba(169,137,90,.22)` | chip fills |
| `--color-ean-text-light` | `#ffffff` | `#F5F2EA` | ivory |
| `--color-ean-muted-light` | `rgba(255,255,255,.65)` | `#C9C4B6` | ivory2 |
| `--color-ean-border-dark` | `rgba(255,255,255,.1)` | `rgba(245,242,234,.13)` | hair |
| `--color-ean-text-dark` | `#160939` | `#0E1214` | ink type on brass fills |
| `--color-ean-muted-dark` | `#5f4c94` | `rgba(14,18,20,.75)` | on brass fills |
| `--shadow-ean-gold` | gold α.35 | `rgba(169,137,90,.30)` | brass α |
| `--shadow-ean-gold-strong` | gold α.55 | `rgba(169,137,90,.45)` | brass α |
| `--color-ean-slate` | — | `#8A939B` | **new** — labels, card body |
| `--color-ean-slate-deep` | — | `#767F8A` | **new** — see §4.3 |
| `--color-ean-live` | — | `#2E7D5B` | **new** — ops dot only |
| `--color-ean-burgundy*` (8 aliases) | indigo | ink equivalents | 74 sites, keep aliased |
| `--color-ean-surface` / `-border-light` | light | **retire in Job L** | no light surfaces exist |
| `--color-ean-indigo` / `-blue` / `-blue-light` | indigo | **delete** | 0 public call sites |

### 4.3 One correction to the prototype: `slateD` fails WCAG AA

Computed relative luminance, WCAG 2.1 formula, against `ink #0E1214`:

| Pair | Ratio | Verdict |
|---|---|---|
| ivory `#F5F2EA` on ink | 16.9 : 1 | pass |
| ivory2 `#C9C4B6` on ink | 10.9 : 1 | pass |
| slate `#8A939B` on ink | 6.1 : 1 | pass |
| brass `#A9895A` on ink | 5.8 : 1 | pass |
| **slateD `#5B6670` on ink** | **3.2 : 1** | **fails AA for text** |
| ink `#0E1214` on brass | 5.8 : 1 | pass |

The prototype uses `slateD` for `.src` — the **"Basis:" lines under every stat** — at
9.5px. Those lines are the entire point of the revised homepage: the claim plus its
evidence. Shipping the evidence at 3.2:1 and 9.5px puts it below the threshold for
exactly the readers most likely to check it.

**Fix:** `--color-ean-slate-deep: #767F8A` → **4.7 : 1**, passes AA, still visibly
recessed from `slate`. Also raise `.src` from 9.5px to 11px. This is the one place
we deliberately do not match the prototype pixel-for-pixel; everything else matches.

### 4.4 The manual surface — 145 raw literals, 22 files

These do **not** follow the token swap. Non-admin only; admin has its own set.

| Count | File |
|---|---|
| 27 | `components/layout/Preloader.tsx` (SVG stops, gradients) |
| 18 | `app/globals.css` preloader keyframes (`ean-preloader-*`) |
| 14 | `components/team/TeamGsapTimeline.tsx` |
| 11 | `components/sections/HeroSection.tsx` (scrim gradients) |
| 10 | `components/pricing/PriceListDirectory.tsx` |
| 9 | `components/aeroplex/AeroplexHero.tsx` |
| 8 | `components/sections/VIPSection.tsx` |
| 7 | `components/sections/CharterSection.tsx` |
| 6 | `components/history/TimelineEventModal.tsx` |
| 5 each | `Footer.tsx`, `Navbar.tsx`, `AboutSection.tsx`, `PartnersStrip.tsx` |
| ≤4 each | 9 further files |

Regenerate this list before starting — it is the checklist:

```bash
grep -rIn "#[0-9a-fA-F]\{6\}\b\|rgba\?(" app components lib \
  --include=*.tsx --include=*.ts | grep -v /admin/
```

Special case: **the scrim gradients.** Every hero and feature band in the prototype
is photography under a gradient scrim, and the exact stops are what keeps type
legible. Port them literally:

```
hero:      180deg, rgba(14,18,20,.72) 0%, rgba(14,18,20,.55) 35%, rgba(14,18,20,.93) 100%
page hero: 180deg, rgba(14,18,20,.70), rgba(14,18,20,.94)
feat band:  90deg, rgba(14,18,20,.95) 0%, rgba(14,18,20,.82) 45%, rgba(14,18,20,.35) 100%
tile/door: 180deg, rgba(14,18,20,.15/.20), rgba(14,18,20,.85/.80)
```

### 4.5 Pinning admin — the one piece of work the scope boundary costs us

Admin is out of scope, and that is not the same as leaving it alone. 1,013
references across 26 admin files resolve through the tokens Job T and Job P rewrite:

| Token family | Admin refs | Also changed by |
|---|---|---|
| `ean-gold` / `-gold-light` | 336 | P |
| `ean-muted-light` | 174 | P |
| `ean-white` | 148 | P |
| `ean-border-dark` | 134 | P |
| `ean-black-pure` / `-black-accent` / `-black` | 126 | P |
| `ean-navy` / `-navy-mid` | 11 | P |
| `ean-text-light` | 2 | P |
| `font-mono` | 58 | T — currently the browser default |
| `font-display` | 22 | T |
| `font-ui` | 8 | T |

Left alone, admin turns ink and brass on its own, and its status colours and chart
series — picked against gold on indigo — go with it. So "don't touch admin" has to
be implemented, not assumed.

**The pin. Two files, ~20 lines, zero admin component edits.**

Custom properties inherit, and a declaration on a nearer ancestor beats `:root`
regardless of specificity. [app/admin/layout.tsx](../../app/admin/layout.tsx) already
wraps every admin route — including `/admin/login` — in a single `<div>`. Add a class
to it and redeclare the old values there:

```tsx
// app/admin/layout.tsx — fonts requested only on /admin routes, not site-wide
const cormorant = Cormorant_Garamond({ variable: "--admin-display", subsets: ["latin"], display: "swap" });
const inter     = Inter({ variable: "--admin-ui", subsets: ["latin"], display: "swap" });

<div className={`admin-theme ${cormorant.variable} ${inter.variable} min-h-screen …`}>
```

```css
/* app/globals.css — outside @theme, after it. Freezes admin at the 31 Aug palette. */
.admin-theme{
  --color-ean-gold:#c4952a;       --color-ean-gold-light:#d4ab50;
  --color-ean-muted-light:rgba(255,255,255,.65);
  --color-ean-white:#ffffff;      --color-ean-text-light:#ffffff;
  --color-ean-border-dark:rgba(255,255,255,.1);
  --color-ean-black-pure:#04010a; --color-ean-black-accent:#100728;
  --color-ean-black:#0a041b;      --color-ean-navy:#180a3e;
  --color-ean-navy-mid:#100728;
  --font-display:var(--admin-display),serif;
  --font-ui:var(--admin-ui),sans-serif;
  --font-mono:ui-monospace,monospace;   /* stays the browser stack, as today */
}
```

Notes on this block:

- **It must ship in the same commit as the palette values**, or admin visibly
  changes for however long the two are apart.
- The two `next/font` calls live in the admin layout, so Cormorant and Inter are
  fetched on admin routes only and add nothing to a public page load.
- `--font-mono` is pinned to the browser stack deliberately: admin's 58 `font-mono`
  sites render in the default monospace today, and picking up IBM Plex Mono there
  would be a change to admin.
- The 28 raw literals in admin need nothing — they never followed the tokens.
- `ean-read-notifications-updated` shows up in a token scan of admin but is a DOM
  event name in `AdminHeader.tsx`, not a colour. Ignore it.
- This is an escape hatch as much as a pin: deleting the block is the whole of
  "actually, let admin adopt the new system", whenever anyone wants that.

---

## 5. Job G — geometry

The prototype is square. Radius appears in exactly three places: 4–5px on form
inputs, 100px pills on chips and small badges, `0 5px 5px 0` on the annotation box
(which does not ship). Everything else — cards, buttons, tiles, images, quote panel
— is 0.

**461 `rounded-*` utilities on the public side.** The 210 in admin stay exactly as
they are — geometry is per-component, so nothing here reaches admin by accident.

Not a find-and-replace: `rounded-full` on the chips and the ops dot stays,
`rounded-lg` on a service card goes. Work file by file, largest first. Also in G:

- **Borders become hairline.** One rule weight site-wide, `1px` at `hair`
  (`rgba(245,242,234,.13)`). No 2px borders, no soft shadows used as separators.
- **Grids separate with a 1px gap over a hair background**, not with per-card
  borders — the prototype's `.tiles`, `.cards`, `.doors`, `.people` and `.tl` all use
  `gap:1px; background:var(--hair)`. Container-level change, so it lands once per
  grid, not once per card.
- **Buttons.** `GoldButton` / `OutlineButton` (69 + 56 call sites, 2 files, both
  under 30 lines) become square, uppercase, `.08em` tracking, 12.5px, 1px brass
  border; solid = brass fill with ink text. A 2-file change reaching 125 call sites.
- **Container width** `--max: 1160px`. Check what the shell uses and reconcile in
  `PublicShell.tsx`.

---

## 6. Job L — layout, page by page

This is where the prototype stops being a re-skin. Two new routes, ~14 new
components, six pages restructured, and 420 light-surface utilities converted.

### 6.0 First: the light→dark conversion (420 utilities, 33 files)

Every file below has at least one light surface with no counterpart in the
prototype. Ordered by size — the top five are most of the work.

| Count | File | Prototype counterpart |
|---|---|---|
| 51 | `components/pricing/PriceListDirectory.tsx` | dark tariff table on ink2 |
| 43 | `app/privacy-policy/page.tsx` | dark long-form |
| 42 | `app/terms-of-use/page.tsx` | dark long-form |
| 28 | `components/pricing/ServiceOptions.tsx` | `.addon` cells on ink2 |
| 24 | `components/pricing/BuildYourQuoteCard.tsx` | `.quote` panel, brass border |
| 22 | `app/contact/page.tsx` | dark form + info card |
| 18 | `components/pricing/LeadGate.tsx` | **deleted** — §6.4 |
| 18 | `app/history/page.tsx` | `.tl` timeline rows |
| 18 | `app/blog/[slug]/page.tsx` | dark article body |
| 16 | `app/about/page.tsx` | statband + cards |
| 15 | `components/pricing/AircraftSelector.tsx` | dark `<select>` |
| 15 | `components/blog/ArticleBody.tsx` | dark prose scale |
| 12 | `app/services/[slug]/page.tsx` | dark detail page ×6 routes |
| 11 | `components/team/TeamDirectoryGrid.tsx` | `.people` grid |
| 11 | `components/pricing/AddonsGrid.tsx` | `.addons` |
| 10 | `app/blog/page.tsx` | 3 briefing cards |
| 8 | `components/aeroplex/CampusFacilities.tsx` | `.msstrip mslist` |
| 7 | `components/team/TeamMemberModal.tsx` | dark modal |
| 6 each | `PartnersStrip`, `NewsSection`, `QuoteSummary` | |
| ≤5 each | 13 further files | |

Regenerate before starting:

```bash
grep -rIln "bg-white\|bg-ean-surface\|text-ean-text-dark\|text-ean-muted-dark\|border-ean-border-light\|bg-ean-white" \
  app components --include=*.tsx | grep -v /admin/
```

### 6.1 Home — `app/page.tsx`

The most-changed page. Prototype order: ops strip → still hero → 4 tiles → statband
→ about split → 6-tab capabilities → price strip → VIP feat → charter feat →
Aeroplex split → milestone strip → 3 doors → partners.

| Component | Action |
|---|---|
| `components/layout/OpsStrip.tsx` | **NEW** — 36px status bar above nav, live dot, AOG number as `tel:` |
| `components/sections/HeroSection.tsx` | **Rewrite.** Carousel → one still hero. Deletes `carouselReady`, `SLIDE_INTERVAL_MS`, dot nav and the idle-mount logic (~120 lines out). Real LCP win |
| `components/sections/PropositionTiles.tsx` | **NEW** — the 4 tiles that absorb the carousel's slides; each its own photograph, two links |
| `components/sections/TrustBar.tsx` | **Rewrite** as `.statband` — 4 stats, each with a mono `Basis:` line. Founding stat links to `/history` |
| `components/sections/AboutSection.tsx` | Restructure to `.split`; image → `about-jet.jpg` |
| `components/sections/ServicesSection.tsx` | **Rewrite** as the 6-tab panel (`.tabs` / `.tabpane`) |
| `components/sections/PricingSection.tsx` | **Rewrite** as `.pricestrip` — full-bleed brass band, ink type |
| `components/sections/VIPSection.tsx` | Restructure to `.feat` — bg photo, 90° scrim, left-weighted copy |
| `components/sections/CharterSection.tsx` | Same; CTA → `/charter` |
| `components/sections/AeroplexTeaser.tsx` | **NEW** — `.split top`, links to `/the-aeroplex` |
| `components/sections/MilestoneStrip.tsx` | **NEW** — 4 `.msc` cards from `TIMELINE_EVENTS`, → `/history` |
| `components/sections/ThreeDoors.tsx` | **NEW** — Fly / Build / Ask. Replaces `ContactSection` on home |
| `components/sections/PartnersStrip.tsx` | Marquee → static `.plog` grid, **rendered once** |
| `components/sections/ContactSection.tsx` | Removed from home (kept if used elsewhere) |

### 6.2 Services — `app/services/page.tsx`, `app/services/[slug]/page.tsx`

The card grid is structurally right; it needs the dark/square/hairline treatment plus
six unique H2s — all six detail routes currently share one heading. Data lives in
`SERVICES_DATA`, `lib/constants.ts:415`.

### 6.3 About — `app/about/page.tsx` + `components/about/InfrastructureShowcase.tsx`

Statband with basis lines, three principles (down from four), six-card infrastructure
set including Wings and airside leasing, closing Aeroplex split.

### 6.4 Pricing — `app/pricing/page.tsx`

| File | Action |
|---|---|
| `components/pricing/LeadGate.tsx` | **DELETE** |
| `lib/pricing/reveal-store.ts` | **DELETE** — `revealed` has no consumer once the gate goes |
| `components/pricing/PricingCalculator.tsx` | Drop the `useSyncExternalStore` reveal wiring; the number is always live |
| `components/pricing/QuoteActions.tsx` | Becomes "Send this quote to dispatch" — capture moves *after* the number |
| `BuildYourQuoteCard`, `QuoteSummary`, `QuoteLineItem`, `AddonsGrid`, `ServiceOptions`, `AircraftSelector`, `ModeToggle`, `PriceListDirectory`, `RequestOrderModal` | Dark, square, brass-bordered quote panel |

Also: two new line items (landing permit, supervisory & representation) and the
"we do not store your quote unless you send it" line under the total.

### 6.5 Charter — `app/charter/` **NEW ROUTE**

`page.tsx` + `layout.tsx` (metadata) + a `CharterRequestForm` client component.
Route/date/pax, aircraft-preference chips, notes, confidentiality line. At least four
CTAs across the site point here today and land nowhere.

### 6.6 The Aeroplex — `app/the-aeroplex/page.tsx`

Route exists; six components stay, restyle only. **Blocked on imagery** — no Aeroplex
photography or cleared render exists in `public/images`, so every image on the page is
a stand-in from the facility set. Nothing uncleared ships.

### 6.7 History — `app/history/page.tsx`

Card list → `.tl` rows (150px year / 108px thumbnail / copy), hairline-separated,
final row in the brass-tinted `future` state. Two rows are currently illustrated with
partner **logo files** and one rotary milestone with a **jet cabin** — replace or drop
those three thumbnails. Data: `TIMELINE_EVENTS`, `lib/constants.ts:712`.

### 6.8 Team — `app/team/page.tsx`

| File | Action |
|---|---|
| `components/team/CeoSpotlight.tsx` | `.spotlight` — full-height portrait left, quote + 3 stats + chips right |
| `components/team/TeamDirectoryGrid.tsx` | `.people` — 3-up, 3:4 portraits, dept tag, credential bullets |
| `components/team/TeamMemberModal.tsx` | Dark, square |
| `components/team/Voices.tsx` | **NEW** — three department heads, 1:1 portrait + pull-quote |
| `components/team/TeamGsapTimeline.tsx` | 14 raw literals to convert |

**Voices ships empty or not at all** until each named person approves their own words.
Placeholder quotations attributed to real employees do not go up.

Portrait initials fallback: the prototype derives two-letter initials when a portrait
404s, stripping the `"Alyosha"` nickname first. Worth porting — it is the difference
between a missing face and a broken image.

### 6.9 Security & Data Protection — `app/security/` **NEW ROUTE**

`page.tsx` + `layout.tsx`. Four plain-language cards (discretion / physical access /
NDPA 2023 / regulatory oversight), then links to the two legal documents. No badges,
no padlock graphics. The footer already links "Security & Data Protection" at
`/privacy-policy` — repoint it (`lib/constants.ts:229`).

Also add the one-line assurance under **every** form — contact, charter, quote. The
cheapest place for it is a shared `components/shared/AssuranceLine.tsx`.

### 6.10 Insights — `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`

Cut to three briefings with named bylines. Removed: featured block, category filters,
"Volume II", read-time badges, subscribe box. **Do not link an article until its route
serves** — currently 500, not 404. The route stays `/blog`; the label is already
"Insights" in `NAV_ITEMS`. Renaming the route is a redirect job for later, not part of
this.

### 6.11 Contact — `app/contact/page.tsx`

Dark form, `.faq` `<details>` accordion with a brass `+`/`−`, info card. Add the three
missing enquiry options (Global Flight Support, Aeroplex/Investor, Press & Media), one
canonical phone number, an NDPA consent line, and hold the response-time promises
until Operations confirms them.

### 6.12 Shell — `Navbar`, `Footer`, `PublicShell`, `Preloader`

Nav is 66px, sticky, `rgba(14,18,20,.94)` + `blur(12px)`, 12.5px uppercase links,
brass underline on active, hover-and-focus-within dropdowns. Footer is a 4-column
`1.4fr 1fr 1fr 1fr` grid on `#0A0D0F` with mono column heads. The preloader needs its
27 literals re-picked for ink/brass — it is the first thing anyone sees.

### 6.13 Shared primitives

| File | Action |
|---|---|
| `components/shared/ImageBlock.tsx` | **NEW** — the prototype's `.ib`: ratio box, ink gradient ground, `object-fit: cover`, hover zoom, failure state. Used ~60× across the site. Build this first; it is the most-repeated primitive |
| `components/shared/Eyebrow.tsx` | **NEW** — mono 11px, `.2em`, uppercase, brass. On every section |
| `components/shared/SectionHead.tsx` | **NEW** — the `.shead` eyebrow + h2 + right-aligned note |
| `components/shared/BasisLine.tsx` | **NEW** — the `Basis:` evidence line under a stat |
| `GoldButton` / `OutlineButton` | Restyle (§5). Consider renaming to `BrassButton` later, not now |
| `components/shared/StatCounter.tsx` | Fraunces 300 numerals |

---

## 7. What does not ship from the prototype

Stated explicitly so nobody ports it by reflex:

- The annotation system (`.ann`, `.annbox`, `.imgcap`) and every `Cnn` reference
- The bottom control bar and the annotations/clean-view toggle
- The Change Order overlay (`#cidx`) and the `CHANGES` array
- The image load-test panel (`#itest`) and the `img.ti` instrumentation
- The single-file `data-go` router and `.page` show/hide — we have the App Router
- The `fonts.googleapis.com` `<link>` — CSP-blocked; `next/font` instead

---

## 8. Master file list

**Total: 1 config, 1 stylesheet, 4 content modules, ~45 components restyled, 6 pages
restructured, 2 new routes, ~14 new components, 2 deletions.**

### Change once, changes everything (do first)

```
app/layout.tsx        fonts (T)
app/globals.css       24 token values, 3 new tokens, base heading rule,
                      18 preloader literals, the .admin-theme pin (T, P)
app/admin/layout.tsx  one class + two admin-scoped font loaders (§4.5).
                      The ONLY admin file this project touches, and it exists
                      to keep admin from changing.
```

### Content spine — copy, structure, SEO

```
lib/constants.ts          hero → single slide, trust stats + basis lines, nav,
                          footer links, services copy, timeline, team, FAQ
lib/seo.ts                per-page titles/descriptions, + /charter, /security
lib/legal-constants.ts    the legal amendments
lib/aeroplex-constants.ts copy only
```

### New routes

```
app/charter/page.tsx       NEW
app/charter/layout.tsx     NEW
app/security/page.tsx      NEW
app/security/layout.tsx    NEW
```

### New components

```
components/layout/OpsStrip.tsx
components/sections/PropositionTiles.tsx
components/sections/AeroplexTeaser.tsx
components/sections/MilestoneStrip.tsx
components/sections/ThreeDoors.tsx
components/charter/CharterRequestForm.tsx
components/security/SecurityCards.tsx
components/team/Voices.tsx
components/shared/ImageBlock.tsx
components/shared/Eyebrow.tsx
components/shared/SectionHead.tsx
components/shared/BasisLine.tsx
components/shared/AssuranceLine.tsx
components/shared/FaqAccordion.tsx
```

### Deleted

```
components/pricing/LeadGate.tsx
lib/pricing/reveal-store.ts
```

### Restyled or rewritten

```
app/page.tsx  app/about/page.tsx  app/history/page.tsx  app/team/page.tsx
app/pricing/page.tsx  app/services/page.tsx  app/services/[slug]/page.tsx
app/contact/page.tsx  app/blog/page.tsx  app/blog/[slug]/page.tsx
app/the-aeroplex/page.tsx  app/privacy-policy/page.tsx  app/terms-of-use/page.tsx
app/terms/page.tsx  app/not-found.tsx  app/error.tsx  app/global-error.tsx
+ the 9 layout.tsx metadata files

components/layout/     Navbar  Footer  PublicShell  Preloader
components/sections/   HeroSection  TrustBar  AboutSection  ServicesSection
                       VIPSection  CharterSection  PricingSection  PartnersStrip
                       NewsSection  ContactSection  QuoteCalculator
components/pricing/    AddonsGrid  AircraftSelector  BuildYourQuoteCard  ModeToggle
                       PriceListDirectory  PricingCalculator  QuoteActions
                       QuoteLineItem  QuoteSummary  RequestOrderModal  ServiceOptions
components/team/       CeoSpotlight  TeamDirectoryGrid  TeamGsapTimeline
                       TeamMemberModal
components/about/      InfrastructureShowcase
components/aeroplex/   AeroplexHero  CampusFacilities  CampusOverview
                       PartnerRequest  ProgrammeTimeline  SiteGallery
components/blog/       ArticleBody
components/history/    TimelineEventModal
components/shared/     GoldButton  OutlineButton  SectionReveal  StatCounter
```

### Out of scope — pinned, then left alone

```
app/admin/**  components/admin/**     26 files, 1,013 token refs, 210 rounded,
                                      28 raw literals. Zero edits beyond the one
                                      class on app/admin/layout.tsx.
```

No admin restyling, no chart-colour re-picking, no dark conversion, no de-rounding.
The pin exists so that none of that becomes necessary.

---

## 9. Sequencing

| Phase | Job | Ship? |
|---|---|---|
| 0 | The `.admin-theme` pin (§4.5) — **before or with phase 1** | Yes. Nothing changes visually; it is the guard rail for 1 and 2 |
| 1 | T — fonts + heading scale re-tune | Yes. Reviewable in one pass |
| 2 | P — token values, then the 145 literals | Yes |
| 3 | Shared primitives (`ImageBlock`, `Eyebrow`, `SectionHead`, buttons) | Yes — nothing visible changes yet, but L depends on all of it |
| 4 | G — de-round, hairline rules, container width | Yes |
| 5 | L, home only (§6.1) | Yes — the biggest single visual delta |
| 6 | L, pricing (un-gate) + the two new routes | Yes — closes the dead CTAs and the gate |
| 7 | L, remaining pages, largest light-surface count first | Section by section |

Phase 0 is not optional and it is not a later cleanup: the pin has to exist before
any token value moves, or admin ships changed. Phases 1–4 are the re-skin and touch
no structure. If time runs short, 0–4 alone give the prototype's look on the current
layouts.

---

## 10. Blocked, and on whom

Not implementation work, but the plan stalls in these places if they go unanswered.

| # | Blocked on | Blocks |
|---|---|---|
| 1 | Aeroplex imagery — cleared render or dated site photography | §6.6, home Aeroplex split, 5 stand-in images |
| 2 | A helicopter photograph; two event photographs | §6.7 — three wrong thumbnails |
| 3 | Approved words from three department heads | §6.8 Voices — ships empty otherwise |
| 4 | Timeline claim verification (IS-BAO vs IS-BAH especially) | §6.7 content |
| 5 | Rate clearance for the two new pricing line items | §6.4 |
| 6 | Legal amendments in the two published documents | §6.9 — the page must not link them first |
| 7 | Response-time confirmation from Operations | §6.11 FAQ, §6.5 |
| 8 | Partner logo names and clearance (11 of them) | §6.1 partners grid |
| 9 | Insights route 500 debugged | §6.10 — index must not link until it serves |
| 10 | One photographic sitting for all 15 portraits | §6.8 — page works without it, reads better with |

---

## 11. Verification, per phase

```bash
npm run lint     # zero errors, zero warnings
npm run build    # clean, prerender set unchanged
```

Then the checks that actually catch a botched swap:

- **Font landed:** grep the production CSS chunk for `Fraunces`, `Archivo` and
  `IBM Plex Mono` `@font-face` blocks; confirm the self-hosted woff2 files under
  `.next/static/media`.
- **Old palette gone:** every value in the §4.2 "Now" column must be **absent** from
  the built CSS and from prerendered HTML. Cormorant and Inter likewise.
- **New palette present:** all 24 new values present in the CSS chunk.
- **No light surface survives:** zero `bg-white`, `bg-ean-surface`,
  `text-ean-text-dark`, `border-ean-border-light` in non-admin `.tsx` after §6.0.
- **Admin is unchanged**, and this is the check that is easiest to skip and most
  expensive to skip. After every phase that touches `globals.css` or `layout.tsx`,
  open `/admin`, `/admin/leads`, `/admin/analytics` and `/admin/login` and compare
  against a screenshot taken before phase 0. Specifically: gold buttons still gold,
  the four graph components' series unchanged, kanban status pills unchanged, table
  rules still `rgba(255,255,255,.1)`, headings still Cormorant, mono columns still in
  the browser's default monospace. `git diff --stat app/admin components/admin`
  should show exactly one file and roughly four changed lines, for the whole project.
- **Contrast:** re-measure the §4.3 table after any value is adjusted. Nothing
  carrying text ships below 4.5:1.
- **Routes:** `/charter` and `/security` render, and no CTA anywhere points at a route
  that 404s or 500s.
- **Reduced motion:** the prototype disables all animation under
  `prefers-reduced-motion`. Confirm ours still does after the hero rewrite.
