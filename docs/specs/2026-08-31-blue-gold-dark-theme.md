# Burgundy → Blue/Gold Dark Theme — Implementation Plan

**Date:** 31 August 2026
**Status:** **Job A shipped 31 August 2026** — Phases 1, 2 and 5 complete (7 files).
The site is indigo/gold with zero live burgundy. Job B (Phase 3, the dark
conversion) is **not started** and still blocked on §6. Phase 4 is optional and
untouched.

Verified after implementation: `npm run lint` zero errors / zero warnings ·
`npm run build` clean with the prerender set unchanged · all 13 new values present
in the production CSS chunk and all 10 wine values absent · prerendered HTML free
of every wine literal.

The saturation question in §3 was resolved as **full saturation** (Option A) — the
values below are what shipped. The 0.62 cap remains available as a one-line change
if the surfaces read too purple in use.

**Goal:** Retire the burgundy palette; ship a dark-themed site on indigo surfaces drawn from the new logo, with gold and indigo accents.

All counts below were measured against the repo, not estimated. Method: word-boundary
token scan across the 152 `.ts`/`.tsx`/`.css` files outside `node_modules`, `.next`
and `docs`, plus a hue test on every raw hex/rgba literal.

The blue is measured out of `public/images/new-logo.png` rather than chosen — see §3.

---

## 1. This is two jobs, not one

Keeping them separate is the whole plan. They have different risk profiles and
one of them is nearly free.

| | Job A — de-burgundy | Job B — go dark |
|---|---|---|
| What | Swap the hue of every wine-tinted colour to the logo's indigo | Turn light sections into dark ones |
| Scope | 17 token values + 43 raw literals | 653 light-surface utilities across 57 files |
| Risk | Very low — contrast ratios provably unchanged (§3) | High — real design work, per section |
| Reviewable | One diff, visually verifiable in a single pass | Section by section |

**Job A does not require Job B.** The site can be fully indigo-and-gold while some
sections stay light. Do A first, ship it, then take B section by section.

---

## 2. The lever: 947 of 947 call sites change with no component edits

Every wine colour on the site resolves through a `@theme` token in
[app/globals.css](../../app/globals.css). There are **947 token references across 77 files**
— and not one of them needs editing, because Tailwind v4 resolves
`bg-ean-navy` to `--color-ean-navy` at build time.

Rewrite 17 values in the `@theme` block and all 947 call sites turn indigo at once.

The corollary matters just as much: the **43 raw literals in §5 will *not* follow**.
Those are the only places burgundy can survive the swap, and they are the entire
manual surface of Job A.

Deliberately **not** part of Job A: renaming `ean-burgundy-*` to a blue name.
That is a 77-file cosmetic churn with no visual effect. Alias the old names to the
new values (§4, Phase 1), let the site go indigo, and rename later or never.

---

## 3. The palette, taken from the logo

### The source

The blue is not invented. It is measured out of `public/images/new-logo.png`, an
indexed PNG whose 29-entry palette holds only two real colours plus the
anti-aliasing blends between them:

| hex | hue | sat | lig | px | role in the mark |
|---|---|---|---|---|---|
| `#2a009a` | **256.4°** | 100% | 30% | 20,882 | the `ean` wordmark and the swirl — the brand indigo |
| `#4d2da4` | 256.1° | 57% | 41% | 38 | edge blend |
| `#6953ab` | 255.0° | 35% | 50% | 4 | edge blend |
| `#725eae` | 255.0° | 33% | 53% | 38 | edge blend |
| `#9a91b8` | 253.8° | 22% | 65% | 36 | edge blend |
| `#a9a5bc` | 250.4° | 15% | 69% | 0 | edge blend |
| `#bdbfc1` | 210.0° | 3% | 75% | 5,633 | `AVIATION` subline — effectively neutral grey |

The blends are the useful find: hue holds at **250–256°** while lightness climbs
30 → 41 → 50 → 53 → 65 → 69 → 75. The logo already contains a tint ramp of its own
brand colour, and **hue 256.4° is the anchor for everything below.**

Note this is a violet-leaning indigo, not a cyan-leaning aviation blue. Anchoring
on the logo means the site reads deep indigo/royal. That is the tradeoff of using
the logo's own palette, and it is the intended one.

### The method

Each surface is the wine colour's **exact relative luminance** re-hued to 256.4°,
with the original token's own saturation preserved. Because luminance is the only
input to the WCAG contrast formula, **every existing text-on-background pairing keeps
its current contrast ratio to 16 decimal places.** Measured delta ≤ 3.5e-18.

That is the safety argument for Job A: it cannot introduce a contrast regression,
so it needs no per-component accessibility re-check.

### Surfaces & text

| Token | Now (wine) | Becomes (indigo) | sat kept | CR vs white | Δ |
|---|---|---|---|---|---|
| `ean-navy` | `#2d0710` | `#180a3e` | 73% | 18.27 | unchanged |
| `ean-navy-mid` | `#1e050b` | `#100728` | 71% | 19.41 | unchanged |
| `ean-black` | `#140307` | `#0a041b` | 74% | 20.08 | unchanged |
| `ean-black-pure` | `#070103` | `#04010a` | 75% | 20.70 | unchanged |
| `ean-black-accent` | `#1e050b` | `#100728` | 71% | 19.41 | unchanged |
| `ean-text-dark` | `#2a070e` | `#160939` | 71% | 18.50 | unchanged |
| `ean-muted-dark` | `#854452` | `#5f4c94` | 32% | 7.13 | unchanged |
| `ean-surface` | `#fdf6f7` | `#f8f7fd` | 64% | 1.07 | unchanged |
| `ean-border-light` | `#f0d8dc` | `#e1dbf1` | 44% | 1.35 | unchanged |

If these read too purple in place, a **saturation cap of 0.62** pulls them toward
navy without touching luminance — `ean-navy` `#180d36`, `-mid` `#100823`,
`ean-black` `#0a0516`, `ean-black-pure` `#030207`, `ean-text-dark` `#170c33`,
`ean-burgundy-rich` `#201148`. Every contrast figure in this document is unchanged
by that swap, because luminance is identical.

**Shipped at full saturation** — the values in the table above. If the surfaces read
too purple in use, applying the cap is a one-line edit per token in `globals.css`
and needs no other change anywhere.

### Burgundy ramp — alias in Phase 1, retire in Phase 4

| Token | Now | Becomes | Refs |
|---|---|---|---|
| `ean-burgundy-rich` | `#3b0913` | `#1f0c52` | 24 |
| `ean-burgundy-night` | `#070103` | `#04010a` | 20 |
| `ean-burgundy-deep` | `#1e050b` | `#100728` | 14 |
| `ean-burgundy-dark` | `#140307` | `#0a041b` | 8 |
| `ean-burgundy-accent` | `#3b0913` | `#1f0c52` | 5 |
| `ean-burgundy-dusk` | `#22060d` | `#12082e` | 5 |
| `ean-burgundy-mid` | `#2d0710` | `#180a3e` | 3 |
| `ean-burgundy` | `#2d0710` | `#180a3e` | 3 |

### The accent — and why the brand indigo cannot be one

The surfaces above are near-black and cannot carry accent duty. Neither can
`#2a009a` itself: at lightness 30% it is *darker* than mid-grey and fails against
every dark surface in the ramp. Measured against the new surfaces:

| Logo tint | black-pure | black | navy-mid | navy | verdict |
|---|---|---|---|---|---|
| `#2a009a` | 1.54 | 1.50 | 1.45 | 1.36 | fails everywhere |
| `#4d2da4` | 2.19 | 2.13 | 2.06 | 1.94 | fails everywhere |
| `#6953ab` | 3.37 | 3.27 | 3.17 | 2.98 | large text / UI only |
| `#725eae` | 3.87 | 3.75 | 3.63 | 3.42 | large text / UI only |
| `#9a91b8` | 7.01 | 6.80 | 6.58 | 6.19 | **AA everywhere** |
| `#a9a5bc` | 8.66 | 8.41 | 8.14 | 7.65 | **AA everywhere** |
| `#bdbfc1` | 11.21 | 10.88 | 10.53 | 9.90 | **AA everywhere** |

So the accent must come from the *upper* half of the logo's own ramp. Two choices:

```css
/* Literal — these hexes are lifted straight out of the logo file */
--color-ean-indigo:       #2a009a;  /* brand mark only; never text on dark */
--color-ean-indigo-tint:  #9a91b8;  /* AA body text on every dark surface */
--color-ean-indigo-hair:  #725eae;  /* borders, hairlines, large text only */

/* Or — the logo's hue at more chroma, if #9a91b8 reads too muted */
--color-ean-blue:         #9174dc;  /* hsl(256.4 60% 66%) · 5.67 on black-pure, 4.99 on navy */
--color-ean-blue-light:   #a390d5;  /* hsl(256.4 45% 70%) · 7.41 / 6.52 */
```

`#9a91b8` is exactly faithful to the logo but soft — a lilac-grey at 22%
saturation. `#9174dc` keeps the logo's hue and clears AA on every dark surface
while actually reading as a colour. **Recommendation: `#9174dc`,** with the literal
tints reserved for the logo lockup itself.

### Gold is untouched

Gold never needed changing. All 1,257 gold-family references stay as they are, and
gold sits comfortably on every new surface:

| Gold on | New surface | CR |
|---|---|---|
| `ean-black-pure` | `#04010a` | 7.57 |
| `ean-black` | `#0a041b` | 7.34 |
| `ean-navy-mid` | `#100728` | 7.10 |
| `ean-navy` | `#180a3e` | 6.68 |

Gold against the brand indigo measures **4.91** — the two are a genuine pair, which
is the payoff of a blue/gold scheme on this logo. But gold against the *tints* is
poor (`#725eae` → 1.96): never put gold text on an indigo-tint fill.

Gold stays an accent only — CTAs, badges, underlines, icon strokes. Never a large
surface fill. Unchanged from AGENTS.md §5.

### The obsidian ramp needs a decision

`ean-obsidian` / `-raised` / `-elevated` / `-highlight` (`#08080a` → `#0f0f14`, 75
refs) are near-neutral with a *faint* blue cast at hue ~240. Against a hue-256
indigo ramp they will read slightly cool and grey rather than matching.

They can stay as they are — they exist specifically so hero photography takes no
colour wash (AGENTS.md §8), and that reasoning holds for indigo exactly as it did
for wine. Leaving them is the low-risk call. Nudging them to hue 256 at very low
saturation is the tidier one. Not blocking; revisit after Phase 1 is on screen.

---

## 4. Phases and exact file lists

### Phase 0 — Decide the two open questions · ⏳ §6 still open

Blocking. Both are in §6 and §7. Nothing below is safe to start until they land.

### Phase 1 — Token swap · 1 file · ✅ DONE

| File | Edit |
|---|---|
| [app/globals.css](../../app/globals.css) | `@theme` block, lines 6–53: rewrite 17 values per §3; add the accent tokens (`--color-ean-blue` `#9174dc` + `--color-ean-blue-light` `#a390d5`, or the literal logo tints). Leave the burgundy *names* in place, pointed at indigo values. |

Also in this file: the `/* Burgundy Palette - Toned down… */` comment (line 30) and
the obsidian block's comment (lines 15–23), which explains itself by contrast with
"wine-tinted (#070103 upward)" and stops being true.

**After this one file, the site is indigo.** Everything below is cleanup and design.

Do the saturation call here too (§3): render the page, and if the surfaces read
purple rather than navy, apply the 0.62 cap. No contrast figure moves either way.

### Phase 2 — Raw-literal stragglers · 5 files · ✅ DONE

The only places burgundy survives Phase 1. Verified line-by-line as live code.

| File | Literal | Count | Lines | Replace with |
|---|---|---|---|---|
| [components/pricing/BuildYourQuoteCard.tsx](../../components/pricing/BuildYourQuoteCard.tsx) | `#581825` | 37 | 114, 125, 153×2, 162, 180, 199×2, 208, 229, 239–240, 251–252, 262, 272–273, 284–285, 295, 305–306, 317–318, 328, 337×2, 346, 356–357, 368–369, 403, 413–414, 425–426 | `#351e70` |
| [app/global-error.tsx](../../app/global-error.tsx) | `#2d0710` | 2 | 34, 87 | `#180a3e` |
| [components/pricing/QuoteActions.tsx](../../components/pricing/QuoteActions.tsx) | `#581825` | 2 | 112, 114 | `#351e70` |
| [components/history/TimelineEventModal.tsx](../../components/history/TimelineEventModal.tsx) | `#2A050D` | 1 | 99 | `#15073b` |
| [components/pricing/QuoteLineItem.tsx](../../components/pricing/QuoteLineItem.tsx) | `#581825` | 1 | 37 | `#351e70` |

All five are luminance-matched at hue 256.4°, same method as §3. The quote card's
two non-wine literals go with them if it stays a light surface: `#EBE5DF` → `#e7e5ee`
and `#E5D7C5` → `#dcd6ed`. Its `#1A2035` is already a cool navy and can stay, or
become `#241c39` to sit on the logo hue.

`QuoteLineItem.tsx` carries **zero** design tokens — a token-only search misses it
completely. It is in this plan solely because of the hue scan.

`global-error.tsx` must keep inline styles: it renders when the root layout has
failed, so no stylesheet is guaranteed. Do not "fix" it into classes.

### Phase 3 — Job B, dark sections · ⏳ NOT STARTED (blocked on §6)

Ordered by markers, which tracks the work. Do these individually, not in a batch.

**Tier 1 — pricing funnel (227 wine refs, the heaviest area)**

| File | Wine | Light markers |
|---|---|---|
| [components/pricing/PriceListDirectory.tsx](../../components/pricing/PriceListDirectory.tsx) | 73 | 71 |
| [components/pricing/ServiceOptions.tsx](../../components/pricing/ServiceOptions.tsx) | 49 | 40 |
| [components/pricing/LeadGate.tsx](../../components/pricing/LeadGate.tsx) | 25 | 18 |
| [components/pricing/BuildYourQuoteCard.tsx](../../components/pricing/BuildYourQuoteCard.tsx) | 19 | 31 |
| [components/pricing/AircraftSelector.tsx](../../components/pricing/AircraftSelector.tsx) | 17 | 19 |
| [components/pricing/AddonsGrid.tsx](../../components/pricing/AddonsGrid.tsx) | 17 | 11 |
| [components/pricing/QuoteSummary.tsx](../../components/pricing/QuoteSummary.tsx) | 15 | 12 |
| [components/pricing/PricingCalculator.tsx](../../components/pricing/PricingCalculator.tsx) | 5 | 2 |
| [components/pricing/RequestOrderModal.tsx](../../components/pricing/RequestOrderModal.tsx) | 5 | — |
| [components/pricing/ModeToggle.tsx](../../components/pricing/ModeToggle.tsx) | 1 | — |
| [components/pricing/QuoteActions.tsx](../../components/pricing/QuoteActions.tsx) | 1 | — |
| [components/sections/QuoteCalculator.tsx](../../components/sections/QuoteCalculator.tsx) | 91 | 1 |
| [components/sections/PricingSection.tsx](../../components/sections/PricingSection.tsx) | 19 | 3 |

**Tier 2 — long-form legal & editorial (light-first, highest markers per file)**

| File | Wine | Light markers |
|---|---|---|
| [app/privacy-policy/page.tsx](../../app/privacy-policy/page.tsx) | 59 | 63 |
| [app/terms-of-use/page.tsx](../../app/terms-of-use/page.tsx) | 46 | 56 |
| [app/blog/[slug]/page.tsx](../../app/blog/[slug]/page.tsx) | 31 | 28 |
| [components/blog/ArticleBody.tsx](../../components/blog/ArticleBody.tsx) | 22 | 21 |
| [app/blog/page.tsx](../../app/blog/page.tsx) | 20 | 13 |

`ArticleBody.tsx` owns body typography for every article — do it before the two
blog pages so they inherit a settled treatment.

**Tier 3 — public pages**

| File | Wine | Light markers |
|---|---|---|
| [app/contact/page.tsx](../../app/contact/page.tsx) | 28 | 27 |
| [app/history/page.tsx](../../app/history/page.tsx) | 26 | 24 |
| [app/about/page.tsx](../../app/about/page.tsx) | 22 | 20 |
| [app/services/[slug]/page.tsx](../../app/services/[slug]/page.tsx) | 9 | 12 |
| [app/services/page.tsx](../../app/services/page.tsx) | 6 | 6 |
| [app/team/page.tsx](../../app/team/page.tsx) | 4 | — |
| [app/not-found.tsx](../../app/not-found.tsx) | 3 | — |
| [app/error.tsx](../../app/error.tsx) | 2 | 1 |
| [app/layout.tsx](../../app/layout.tsx) | 1 | — |

`app/layout.tsx:93` — `<body className="… bg-ean-navy text-white …">`. One class,
sets the ground for every page.

**Tier 4 — section & feature components**

| File | Wine | Light markers |
|---|---|---|
| [components/team/TeamDirectoryGrid.tsx](../../components/team/TeamDirectoryGrid.tsx) | 21 | 14 |
| [components/team/TeamGsapTimeline.tsx](../../components/team/TeamGsapTimeline.tsx) | 15 | 3 |
| [components/team/TeamMemberModal.tsx](../../components/team/TeamMemberModal.tsx) | 13 | 9 |
| [components/team/CeoSpotlight.tsx](../../components/team/CeoSpotlight.tsx) | 10 | 1 |
| [components/about/InfrastructureShowcase.tsx](../../components/about/InfrastructureShowcase.tsx) | 12 | 1 |
| [components/aeroplex/CampusFacilities.tsx](../../components/aeroplex/CampusFacilities.tsx) | 12 | 11 |
| [components/aeroplex/SiteGallery.tsx](../../components/aeroplex/SiteGallery.tsx) | 11 | 1 |
| [components/aeroplex/ProgrammeTimeline.tsx](../../components/aeroplex/ProgrammeTimeline.tsx) | 6 | 1 |
| [components/aeroplex/PartnerRequest.tsx](../../components/aeroplex/PartnerRequest.tsx) | 3 | — |
| [components/aeroplex/CampusOverview.tsx](../../components/aeroplex/CampusOverview.tsx) | — | 1 |
| [components/history/TimelineEventModal.tsx](../../components/history/TimelineEventModal.tsx) | 9 | 3 |
| [components/layout/Footer.tsx](../../components/layout/Footer.tsx) | 11 | 6 |
| [components/layout/Navbar.tsx](../../components/layout/Navbar.tsx) | 6 | 4 |
| [components/layout/Preloader.tsx](../../components/layout/Preloader.tsx) | 1 | — |
| [components/sections/NewsSection.tsx](../../components/sections/NewsSection.tsx) | 11 | 10 |
| [components/sections/PartnersStrip.tsx](../../components/sections/PartnersStrip.tsx) | 9 | 6 |
| [components/sections/AboutSection.tsx](../../components/sections/AboutSection.tsx) | 7 | 7 |
| [components/sections/VIPSection.tsx](../../components/sections/VIPSection.tsx) | 7 | 7 |
| [components/sections/TrustBar.tsx](../../components/sections/TrustBar.tsx) | 2 | — |
| [components/sections/HeroSection.tsx](../../components/sections/HeroSection.tsx) | 1 | 2 |
| [components/sections/CharterSection.tsx](../../components/sections/CharterSection.tsx) | 1 | — |
| [components/sections/ContactSection.tsx](../../components/sections/ContactSection.tsx) | 1 | — |
| [components/sections/ServicesSection.tsx](../../components/sections/ServicesSection.tsx) | — | 3 |
| [components/shared/OutlineButton.tsx](../../components/shared/OutlineButton.tsx) | 4 | 2 |
| [components/shared/GoldButton.tsx](../../components/shared/GoldButton.tsx) | 1 | 1 |

`OutlineButton` and `GoldButton` are shared primitives — settle them first, before
the sections that consume them.

`Preloader.tsx` is the sharp edge. Its timings are load-bearing (AGENTS.md §8):
the veil clears at 0.60s while the jet climbs to 1.70s on one 2.6s timeline.
**Recolour only. Do not retime, do not collapse the two layers.**

**Tier 5 — admin portal (83 + 54 refs)**

Behind auth, so it can lag public work or be skipped for now. `bg-white` here is
data-table chrome, not brand surface — a genuinely different design problem.

| File | Wine | Light markers |
|---|---|---|
| [components/admin/LeadDetailDrawer.tsx](../../components/admin/LeadDetailDrawer.tsx) | 18 | 11 |
| [components/admin/blog/EditorToolbar.tsx](../../components/admin/blog/EditorToolbar.tsx) | 13 | 21 |
| [components/admin/LeadFilterBar.tsx](../../components/admin/LeadFilterBar.tsx) | 8 | 6 |
| [components/admin/blog/SEOPanel.tsx](../../components/admin/blog/SEOPanel.tsx) | 6 | 3 |
| [components/admin/blog/PostMeta.tsx](../../components/admin/blog/PostMeta.tsx) | 5 | — |
| [components/admin/LeadDataTable.tsx](../../components/admin/LeadDataTable.tsx) | 5 | 5 |
| [components/admin/AdminHeader.tsx](../../components/admin/AdminHeader.tsx) | 4 | 7 |
| [components/admin/AdminSidebar.tsx](../../components/admin/AdminSidebar.tsx) | 4 | 3 |
| [components/admin/blog/FeaturedImage.tsx](../../components/admin/blog/FeaturedImage.tsx) | 4 | 1 |
| [components/admin/LeadPipelineKanban.tsx](../../components/admin/LeadPipelineKanban.tsx) | 3 | 2 |
| [components/admin/graphs/AcquisitionBarChart.tsx](../../components/admin/graphs/AcquisitionBarChart.tsx) | 3 | — |
| [components/admin/graphs/LeadTrendChart.tsx](../../components/admin/graphs/LeadTrendChart.tsx) | 3 | — |
| [components/admin/blog/BlogEditor.tsx](../../components/admin/blog/BlogEditor.tsx) | 2 | 1 |
| [components/admin/graphs/ServiceDonutChart.tsx](../../components/admin/graphs/ServiceDonutChart.tsx) | 2 | 1 |
| [components/admin/LeadStatCard.tsx](../../components/admin/LeadStatCard.tsx) | 1 | 1 |
| [components/admin/blog/WordCount.tsx](../../components/admin/blog/WordCount.tsx) | 1 | — |
| [components/admin/graphs/FunnelGraph.tsx](../../components/admin/graphs/FunnelGraph.tsx) | 1 | 1 |
| [app/admin/blog/page.tsx](../../app/admin/blog/page.tsx) | 10 | 10 |
| [app/admin/settings/page.tsx](../../app/admin/settings/page.tsx) | 9 | — |
| [app/admin/login/page.tsx](../../app/admin/login/page.tsx) | 8 | — |
| [app/admin/blog/[slug]/edit/page.tsx](../../app/admin/blog/[slug]/edit/page.tsx) | 7 | 4 |
| [app/admin/blog/new/page.tsx](../../app/admin/blog/new/page.tsx) | 6 | 4 |
| [app/admin/page.tsx](../../app/admin/page.tsx) | 6 | — |
| [app/admin/analytics/page.tsx](../../app/admin/analytics/page.tsx) | 4 | — |
| [app/admin/layout.tsx](../../app/admin/layout.tsx) | 4 | — |

### Phase 4 — Rename and retire · optional · not started

Only after Phase 3. Rename `ean-burgundy-*` call sites (82 refs, 8 tokens) to blue
names, then delete the aliases from `globals.css`. Purely cosmetic; skipping it
leaves eight misleading token names and nothing else.

### Phase 5 — Documentation · 1 file · ✅ DONE

| File | Edit |
|---|---|
| [AGENTS.md](../../AGENTS.md) | §5 Design tokens (lines 131–148). The paragraph at **136–137** — *"The palette is burgundy/black, not navy. `--color-ean-navy` is a legacy name whose value is `#2d0710` — a deep wine. Read the value, not the name."* — inverts completely: after this migration the name is finally accurate. The token block at **140–142** hard-codes `#070103`, `#140307`, `#1e050b`, `#2d0710`, `#fdf6f7` in prose, and line **143** lists the eight burgundy names. |

Per AGENTS.md's own closing line, this lands in the same commit as Phase 1 — not at the end.

---

## 5. What the token swap cannot reach

Covered by Phase 2. Recording the method here because a future palette change will
need it again: **grep for tokens, then hue-test every raw literal.** Tokens alone
missed `QuoteLineItem.tsx` entirely.

One false positive worth noting so nobody re-adds it: [components/layout/Footer.tsx:77](../../components/layout/Footer.tsx#L77)
contains `#2D0710`, `#1E050B` and `#140307` **inside a comment** recording that
those literals were already replaced by tokens. The file needs no hex edit.

---

## 6. Open question A — the light surfaces

`ean-surface` (65 refs) and `ean-border-light` (121 refs) are *light* tokens. §3
re-hues them to `#f8f7fd` / `#e1dbf1`, which keeps them light — a near-white indigo.

On a dark-themed site there are three coherent answers, and this one decision drives
most of Phase 3's cost:

1. **Keep light islands.** Legal pages, article bodies and the quote card stay light
   "document" surfaces on a dark site. Cheapest by far — Phase 3 Tiers 1–2 mostly
   evaporate, and long-form reading stays comfortable.
2. **Everything dark.** `ean-surface` becomes an elevated dark surface and the light
   tokens are deleted. Most consistent, most work: all 653 markers in 57 files.
3. **Dark public site, light admin.** Admin is a data tool behind auth; dark data
   tables are their own design problem. Drops Tier 5 (137 refs) from scope.

My recommendation: **3, with 1 for the legal pages and article bodies.** It gets a
dark public site quickly, keeps 20+ screens of legal prose readable, and defers the
admin question without blocking anything.

## 7. Open question B — 45 dead `dark:` utilities

`globals.css:3` declares `@custom-variant dark (&:where(.dark, .dark *))`, so `dark:`
only applies under a `.dark` ancestor. **Nothing in the repo ever sets that class** —
`app/layout.tsx:81-84` renders `<html>` with fonts and scroll classes only.

So 45 `dark:` utilities across 6 files are unreachable, and those sections are
currently rendering their *light* branch:

| File | Dead `dark:` |
|---|---|
| [components/sections/NewsSection.tsx](../../components/sections/NewsSection.tsx) | 14 |
| [components/sections/VIPSection.tsx](../../components/sections/VIPSection.tsx) | 11 |
| [components/sections/AboutSection.tsx](../../components/sections/AboutSection.tsx) | 10 |
| [components/sections/PartnersStrip.tsx](../../components/sections/PartnersStrip.tsx) | 7 |
| [components/layout/Navbar.tsx](../../components/layout/Navbar.tsx) | 2 |
| [components/sections/TrustBar.tsx](../../components/sections/TrustBar.tsx) | 1 |

There is a finished dark design for four homepage sections sitting in the codebase,
switched off. Two ways to collect it:

- **Add `dark` to the `<html>` className** (one line). Those sections go dark
  instantly — free progress on Job B. Risk: they were probably never reviewed in
  this state, so expect to fix what it reveals.
- **Delete the light branch** and make the dark values unconditional. More edits,
  but it removes a variant the site does not otherwise use.

Recommendation: flip the class first purely as a *preview* to see what the dark
design actually looks like, then delete the light branches in Phase 3 and drop the
custom variant. Do not ship the flipped class as the final state — a
`dark:`-conditional site implies a theme toggle that does not exist.

---

## 8. The logo, already partly done

Today's change pointed the navbar and footer at `new-logo.png` and dropped the
`brightness-0 invert` filter. Against the new surfaces the brand indigo is still
unusable — and now for a sharper reason:

| On | New value | CR |
|---|---|---|
| `ean-navy` | `#180a3e` | **1.36** |
| `ean-navy-mid` | `#100728` | **1.45** |
| `ean-black` | `#0a041b` | **1.50** |
| `ean-black-pure` | `#04010a` | **1.54** |
| `ean-surface` | `#f8f7fd` | 12.63 |

Deriving the palette *from* the logo makes this worse, not better. The surfaces are
now the logo's own hue, so `#2a009a` on `#180a3e` is the same colour at two
lightnesses — 1.36:1, the lowest figure in this document. The logo cannot sit
unfiltered on a dark surface built from its own hue. That is not an argument against
the palette; it is the reason a light variant is mandatory rather than optional.

Three workable treatments, all consistent with §3:

1. **A light variant asset** — the lockup with its indigo lifted to `#9a91b8` or
   `#a390d5` from the logo's own ramp. Keeps the mark's shape and relationships.
2. **Reinstate a filter on dark surfaces only**, full colour on light ones. Cheapest,
   and closest to what the site did until today.
3. **Gold lockup on dark.** Gold against the brand indigo measures 4.91, and the
   logo-plus-gold pairing is the scheme's strongest note.

The grey `#bdbfc1` in the lockup reads fine throughout (9.9–11.2:1) — only the
indigo needs lifting.

Files, when the variant asset exists: [components/layout/Navbar.tsx](../../components/layout/Navbar.tsx#L107),
[components/layout/Footer.tsx](../../components/layout/Footer.tsx#L131),
[lib/seo.ts:209](../../lib/seo.ts#L209).

---

## 9. Explicitly out of scope — do not open these files

Checked and confirmed burgundy-free. Listed so the boundary is unambiguous.

| File / area | Why |
|---|---|
| [app/api/admin/leads/forward/route.ts](../../app/api/admin/leads/forward/route.ts) | 35 hex literals, all neutral-dark + gold (`#0a0a0a`, `#262626`, `#c9a84c`). No burgundy. Its gold is `#c9a84c` vs the token's `#c4952a` — a pre-existing mismatch, not this migration's business. |
| [lib/services/lead-notifications.ts](../../lib/services/lead-notifications.ts) | `#dc2626`, `#ef4444`, `#991b1b` are semantic alert reds in an email template, not brand wine. |
| [components/admin/graphs/ServiceDonutChart.tsx](../../components/admin/graphs/ServiceDonutChart.tsx) | `#ec4899`, `#38bdf8`, `#a855f7` etc. are a categorical data-viz palette. Recolouring it to brand blues would destroy series distinguishability. Only its 2 wine tokens are in Tier 5. |
| `ean-obsidian*` (75 refs) | Near-neutral, hue ~240, and deliberately untinted so hero photography takes no colour wash. Not blocking — §3 records the optional nudge to hue 256. |
| All gold tokens (1,257 refs) | Gold is retained. §3. |
| `ean-white`, `ean-text-light`, `ean-muted-light`, `ean-border-dark` (738 refs) | Hue-neutral — white and white-alpha. |
| `next.config.ts` | No colour values. No `theme-color`, no manifest, no PWA icons anywhere in the repo — confirmed by grep. |
| `lib/constants.ts`, `lib/blog-content.ts`, `lib/legal-constants.ts` | Copy and data only. |
| `supabase/migrations/*`, `types/*`, `utils/supabase/*`, `proxy.ts` | No presentation. |
| `public/images/*.jpg` | Photography. Untinted — the obsidian comment notes the neutral ramp exists precisely so hero photos take no red wash; blue surfaces keep that property. |
| `docs/archive/`, `docs/reviews/` | Point-in-time records. AGENTS.md's convention is to leave them unedited. |

---

## 10. Verification

Job A's contrast argument is mathematical, so the check is visual regression, not
an accessibility audit:

1. `npm run lint` — must stay at zero errors **and zero warnings** (AGENTS.md §2).
2. `npm run build` — confirm the prerender set is unchanged. Everything except
   `/blog/[slug]`, the admin blog editor and the API is statically prerendered
   (AGENTS.md §4); a colour change must not move that.
3. Re-run the hue scan. Zero wine literals outside `globals.css` means Job A is done.
4. Lighthouse on a production build, desktop preset. Performance is at 99 and Speed
   Index in a 1.0–1.1s noise band (AGENTS.md §8). A colour swap should not move
   either — if Speed Index shifts, suspect the preloader recolour.
5. Walk the funnel that earns money: `/` → `/services/[slug]` → `/pricing` →
   quote → `/contact`. Then `/blog/[slug]` for article typography.
6. Check gold CTAs against every new surface. The §3 table predicts 6.68–7.58:1;
   confirm nothing regressed where gold sits on a *photo* rather than a token.

**No test suite exists** (AGENTS.md §12) and there is no CI gate on lint or build.
Steps 1–2 are manual and easy to skip. Do not skip them.

---

## Summary

| Phase | Files | Nature |
|---|---|---|
| 0 · Decisions | — | §6 and §7, blocking |
| 1 · Token swap | **1** | Turns the whole site blue |
| 2 · Stragglers | **5** | Mechanical, exact lines given |
| 5 · Docs | **1** | Ships with Phase 1 |
| 3 · Dark sections | up to **57** | Design work, phased in 5 tiers |
| 4 · Rename | up to 77 | Optional cosmetic |

Job A — a blue-and-gold site with no burgundy — is **7 files**. The other 57 are
Job B, and how many of them you actually open depends entirely on §6.
