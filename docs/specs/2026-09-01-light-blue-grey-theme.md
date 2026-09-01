# v8 Light Theme — Blue / Grey on Paper

**Date:** 1 September 2026
**Instruction:** CEO — the site is to be light themed, not dark themed.
**Given values:** blue `#2b0098`, grey `#969696`.
**Status:** **Engineering track shipped (§1–§8), 1 September 2026** — S1, S2,
S3, P, S4, the §6 off-token cleanup and R1's glow/heavy-shadow strip. The design
track is **not** started: R2 (band rhythm), R3 (QuoteCalculator) and the §9.4
per-page rebuilds are gated on the three comps at §9.6, and open decision §10.3.2
is gated on the CEO. See §11 for what shipped, what changed against this document,
and what is left.

Supersedes the surface half of
[2026-08-31-v7-ink-brass-redesign.md](./2026-08-31-v7-ink-brass-redesign.md) (Job P),
and rewrites the brief for its Job L. Jobs T (typography) and G (geometry) from that
document are untouched by this one and remain valid.

**This is two projects.** §1–§8 are the engineering: get every pairing legible on
paper and every token pointing somewhere sensible. **§9 is the redesign**, and it is
the larger half — the site currently takes all of its section hierarchy from
dark/light alternation, and a paper ramp cannot alternate. Read §9 before estimating
this work.

**Scope: the public site only.** The admin console stays exactly as it looks today.
§7 shows the existing pin already covers it — no new admin work is required, and that
is a measured result, not an assumption.

All counts below were measured against the repo on 1 September 2026. Method:
word-boundary utility scan across the 64 public `.ts`/`.tsx` files that reference any
colour token or raw colour utility, plus `app/globals.css`; `admin/` excluded
throughout. Family totals (`ean-gold`, `ean-navy`, `ean-black`) include their own
sub-tokens.

---

## 1. The one-file lever does not work here, and that is the whole story

The v7 palette swap was a single-file change: 24 token values in
[app/globals.css](../../app/globals.css), 2,036 references following for free. It
worked because every value moved *within its role* — a dark surface became a
different dark surface, a light text became a different light text.

This change inverts roles. Surfaces go from dark to light and text goes from light to
dark. Four token families are **used in both roles at once**, so no single value can
be correct for them:

| Token family | Used as background | Used as text | Conflict |
|---|---|---|---|
| `ean-navy` / `-mid` | 132 | **150** | Section fill *and* heading colour on the light sections |
| `ean-text-dark` / `ean-muted-dark` | 0 | 175 | Label on the brass CTA fill *and* body copy on light sections |
| `ean-white` | 23 | 1 | Light section fill *and* the preloader wordmark on the veil |
| `ean-text-light` / `ean-muted-light` | 0 | 588 | Copy on ink surfaces *and* copy over photography |

Repointing values alone would set `text-ean-navy` headings to paper-on-paper
(invisible), and set the primary CTA to ink on `#2b0098` — **1.22:1**, which is not a
degradation, it is a blank button.

**So this is a split job, then a swap job.** §5 splits the four families at the call
site; §4 then swaps the values. Doing them in the other order breaks the site between
commits.

**And a swap job is still not a light site.** §1–§9 get every pairing legible and
every token pointing somewhere sensible. They do not produce a design. The current
site takes all of its section hierarchy from dark/light alternation, and the paper
ramp cannot alternate — the widest separation available between two papers is
**1.18:1** against the 18.83:1 the site uses today. §9 is the design work that has
to replace it, and it is the larger half of this project.

---

## 2. What the two given values can and cannot do

Measured, sRGB, WCAG 2.1 relative luminance.

### 2.1 Blue `#2b0098` — carries everything

| Pairing | Ratio | |
|---|---|---|
| `#2b0098` on white | **13.50:1** | AAA — headings, links, body copy, all sizes |
| `#2b0098` on `#f4f5f7` | **12.37:1** | AAA |
| `#2b0098` on `#eaecf0` | **11.41:1** | AAA |
| white on `#2b0098` | **13.50:1** | AAA — the filled CTA |

This is the strongest accent the site has ever had. Brass was 5.8:1 and could not be
used at small sizes over anything but ink; `#2b0098` passes AAA at every size on every
paper in the ramp. It replaces `ean-gold` outright.

It is also, to within three RGB units, the `--color-ean-indigo` already sitting in
`@theme` at line 100 — `#2a009a`, documented there as "the authentic brand indigo
measured from the mark". The CEO's value and the logotype's value are the same blue.
That token has 3 references and should be collapsed into `ean-gold` rather than kept
alongside it.

### 2.2 Grey `#969696` — cannot carry text, and cannot carry a control border either

| Pairing | Ratio | Verdict |
|---|---|---|
| `#969696` on white | **2.96:1** | **Fails** AA text (4.5:1). **Fails** AA large text (3:1) |
| `#969696` on `#f4f5f7` | **2.71:1** | Fails |
| `#969696` on `#eaecf0` | **2.50:1** | Fails |
| `#969696` on `#2b0098` | 4.56:1 | Passes — but only inside a blue fill |

`#969696` misses AA large-text by 0.04 and misses the 3:1 non-text floor for a border
that is the sole affordance of a control (an input outline, a focus ring) by the same
0.04. That is not a margin worth arguing over: it fails.

**This is the one place the brief cannot be implemented as literally given.** The
grey is a real brand value and stays in the system, but as the **hairline and
divider** colour and as muted type **on the blue fill only** — never as body copy or
a caption on paper. Everything the current design uses `ean-slate` and
`ean-muted-light` for needs a darker neutral, so the grey is extended into a ramp
anchored on the given value (§4.2). The given `#969696` is kept verbatim as
`--color-ean-grey`.

If the CEO's intent was "grey text", the nearest honest value is `#6b6b6b`
(5.33:1) — the same neutral, four steps down. Flag this before build. It is one of the
two open decisions in this document; the other is §9.2, and both are listed at §10.3.

---

## 3. What the site actually looks like today (it is already half light)

Worth stating because it changes the size of the job in both directions.

`@custom-variant dark (&:where(.dark, .dark *))` is declared at
[app/globals.css:3](../../app/globals.css), but **the `dark` class is never applied**
— not on `<html>`, not on `<body>`, not by any script. The 25 `dark:` utilities in
five section files are dead. Those five sections are rendering their *light* branch
right now:

- [components/sections/AboutSection.tsx](../../components/sections/AboutSection.tsx)
- [components/sections/NewsSection.tsx](../../components/sections/NewsSection.tsx)
- [components/sections/VIPSection.tsx](../../components/sections/VIPSection.tsx)
- [components/sections/PartnersStrip.tsx](../../components/sections/PartnersStrip.tsx)
- [components/sections/TrustBar.tsx](../../components/sections/TrustBar.tsx)

So does most of `/pricing`, `/privacy-policy`, `/terms-of-use` and the light bands in
`/about` — 65 `ean-surface` sites and 44 `bg-white` sites. The 175 `ean-text-dark` /
`ean-muted-dark` sites are already correct ink-on-paper and mostly survive.

**This does not make the job smaller, and reading it that way is the trap.** Those
white sections are not a head start on a light theme. They are *contrast bands* —
they exist because there is ink on either side of them, and they do their entire job
by being the light thing between two dark things. Take the dark away and they stop
being sections at all. §9 is what has to be designed to replace them; without it the
homepage is eight white blocks in a row.

The dead `dark:` utilities are deleted as part of Job S1, not left to rot — they
would otherwise read as a working toggle to the next person.

---

## 4. The new token values

One file: [app/globals.css](../../app/globals.css), the `@theme` block, lines 5–240.

### 4.1 Naming

The names stay. `ean-navy` will not be navy, `ean-gold` will not be gold, and
`ean-black` will be paper. That is the third time the values have moved under these
names and the file already documents the precedent at lines 18–22 — renaming is a
900-plus-site churn with no visual effect, and it is a separate, purely mechanical
commit if anyone wants it. **Do not repoint values and rename in the same change.**

### 4.2 The ramp

```css
/* Paper — the surface ramp, replacing the ink ramp */
--color-ean-black:          #ffffff;   /* page ground */
--color-ean-black-pure:     #ffffff;
--color-ean-navy:           #f4f5f7;   /* raised: cards, panels */
--color-ean-navy-mid:       #f9fafb;
--color-ean-black-accent:   #f4f5f7;
--color-ean-surface:        #eaecf0;   /* recessed: bands, wells */
--color-ean-white:          #ffffff;

/* Obsidian + burgundy aliases — follow the paper ramp, as today */
--color-ean-obsidian:           #ffffff;
--color-ean-obsidian-raised:    #f4f5f7;
--color-ean-obsidian-elevated:  #eaecf0;
--color-ean-obsidian-highlight: #eaecf0;
--color-ean-burgundy:        #f4f5f7;
--color-ean-burgundy-mid:    #f4f5f7;
--color-ean-burgundy-deep:   #f9fafb;
--color-ean-burgundy-dark:   #ffffff;
--color-ean-burgundy-night:  #ffffff;
--color-ean-burgundy-rich:   #eaecf0;
--color-ean-burgundy-accent: #eaecf0;
--color-ean-burgundy-dusk:   #f4f5f7;

/* Accent — the brand blue, and it is the only one */
--color-ean-gold:        #2b0098;   /* 13.50:1 on paper */
--color-ean-gold-light:  #4a1fd0;   /*  8.76:1 on paper — hover/raised */
--color-ean-gold-muted:  rgba(43, 0, 152, 0.12);
--color-ean-indigo:      #2b0098;   /* collapsed onto the accent, 3 refs */
--color-ean-blue:        #2b0098;
--color-ean-blue-light:  #4a1fd0;
--color-ean-blue-muted:  rgba(43, 0, 152, 0.10);
--color-ean-blue-border: rgba(43, 0, 152, 0.30);

/* Neutrals — anchored on the given #969696 */
--color-ean-grey:       #969696;   /* NEW — the given value, hairlines only */
--color-ean-slate:      #6b6b6b;   /*  5.33:1 on paper — labels, captions */
--color-ean-slate-deep: #4a4a4a;   /*  8.86:1 on paper — Basis: lines */

/* Text — roles inverted */
--color-ean-text-light:  #1f1f23;  /* 16.43:1 on paper — primary copy */
--color-ean-muted-light: #4a4a4a;  /*  8.86:1 on paper — secondary copy */
--color-ean-text-dark:   #ffffff;  /* 13.50:1 on blue — label on a blue fill */
--color-ean-muted-dark:  #cfc6ee;  /*  8.33:1 on blue */

/* Borders — inverted, and the given grey lands here */
--color-ean-border-dark:  rgba(150, 150, 150, 0.45);
--color-ean-border-light: rgba(150, 150, 150, 0.30);

/* Status */
--color-ean-live:  #0f6b45;  /* 6.54:1 on paper */
--color-ean-error: #b91c1c;  /* 6.47:1 on paper */

/* Elevation — blue channel values, weaker than brass */
--shadow-ean-gold:        0 4px 20px rgba(43, 0, 152, 0.16);
--shadow-ean-gold-strong: 0 4px 30px rgba(43, 0, 152, 0.26);
--shadow-ean-blue:        0 0 16px rgba(43, 0, 152, 0.20);
```

`--color-ean-text-light` and `--color-ean-text-dark` swap meaning entirely: `-light`
becomes ink and `-dark` becomes white. This is deliberate and it is what makes the
588 `text-ean-text-light` / `text-ean-muted-light` sites resolve correctly on paper
without being touched. The ~96 of them that sit **over photography** are the exception
and are handled at the call site in Job S4 (§5.4).

### 4.3 Contrast — every text pairing in the new system

Nothing carrying text sits below 4.5:1.

| Foreground | Ground | Ratio | AA |
|---|---|---|---|
| `text-light` `#1f1f23` | paper `#ffffff` | 16.43 | ✓ |
| `text-light` `#1f1f23` | raised `#f4f5f7` | 15.06 | ✓ |
| `text-light` `#1f1f23` | recessed `#eaecf0` | 13.89 | ✓ |
| `muted-light` `#4a4a4a` | paper | 8.86 | ✓ |
| `muted-light` `#4a4a4a` | raised | 8.12 | ✓ |
| `muted-light` `#4a4a4a` | recessed | 7.49 | ✓ |
| `slate` `#6b6b6b` | paper | 5.33 | ✓ |
| `slate` `#6b6b6b` | raised | 4.89 | ✓ |
| `slate` `#6b6b6b` | recessed | 4.51 | ✓ (0.01 of margin — do not darken the recessed step) |
| `slate-deep` `#4a4a4a` | paper | 8.86 | ✓ |
| `gold` `#2b0098` | paper | 13.50 | ✓ |
| `gold` `#2b0098` | raised | 12.37 | ✓ |
| `gold-light` `#4a1fd0` | paper | 8.76 | ✓ |
| `text-dark` `#ffffff` | gold fill `#2b0098` | 13.50 | ✓ |
| `muted-dark` `#cfc6ee` | gold fill | 8.33 | ✓ |
| `error` `#b91c1c` | paper | 6.47 | ✓ |
| `live` `#0f6b45` | paper | 6.54 | ✓ |
| `grey` `#969696` | paper | 2.96 | **✗ — non-text only, by design** |

Unlike v7's ink ramp, `slate` is **not** surface-constrained: it clears 4.5:1 on all
three papers, so the `Basis:` evidence lines are no longer pinned to one background.
[components/shared/BasisLine.tsx](../../components/shared/BasisLine.tsx) lines 14–21
carry a comment saying otherwise — delete it with the swap.

---

## 5. The four splits — this is the actual work

Each split is mechanical, independently reviewable, and must land **before** §4.

### S1 — `ean-navy` / `ean-obsidian` / `ean-burgundy` used as text · 182 sites, 33 files

`text-ean-navy` (150), `text-ean-burgundy` (23), `text-ean-obsidian` (8),
`text-ean-black` (1). Every one is already dark ink on a light section and must stay
dark ink. Rewrite each to `text-ean-text-light`, which §4 points at `#1f1f23`.

Purely a find-and-replace of four utility prefixes, but check each hit is a `text-`
and not a `border-`/`fill-`/`stroke-` — the scan below is word-boundary exact.

| File | Sites |
|---|---|
| [components/pricing/PriceListDirectory.tsx](../../components/pricing/PriceListDirectory.tsx) | 24 |
| [app/privacy-policy/page.tsx](../../app/privacy-policy/page.tsx) | 20 |
| [components/sections/QuoteCalculator.tsx](../../components/sections/QuoteCalculator.tsx) | 15 |
| [app/terms-of-use/page.tsx](../../app/terms-of-use/page.tsx) | 14 |
| [components/pricing/ServiceOptions.tsx](../../components/pricing/ServiceOptions.tsx) | 12 |
| [app/blog/[slug]/page.tsx](../../app/blog/%5Bslug%5D/page.tsx) | 10 |
| [components/pricing/QuoteSummary.tsx](../../components/pricing/QuoteSummary.tsx) | 8 |
| [components/pricing/BuildYourQuoteCard.tsx](../../components/pricing/BuildYourQuoteCard.tsx) | 7 |
| [components/blog/ArticleBody.tsx](../../components/blog/ArticleBody.tsx) · [app/history/page.tsx](../../app/history/page.tsx) · [app/contact/page.tsx](../../app/contact/page.tsx) | 6 each |
| [components/sections/ServicesSection.tsx](../../components/sections/ServicesSection.tsx) | 5 |
| [components/sections/NewsSection.tsx](../../components/sections/NewsSection.tsx) · [components/pricing/AircraftSelector.tsx](../../components/pricing/AircraftSelector.tsx) · [app/about/page.tsx](../../app/about/page.tsx) | 4 each |
| [components/team/TeamGsapTimeline.tsx](../../components/team/TeamGsapTimeline.tsx) · [components/team/TeamDirectoryGrid.tsx](../../components/team/TeamDirectoryGrid.tsx) · [components/sections/PricingSection.tsx](../../components/sections/PricingSection.tsx) · [components/pricing/AddonsGrid.tsx](../../components/pricing/AddonsGrid.tsx) · [components/aeroplex/CampusFacilities.tsx](../../components/aeroplex/CampusFacilities.tsx) · [app/blog/page.tsx](../../app/blog/page.tsx) | 3 each |
| [components/team/TeamMemberModal.tsx](../../components/team/TeamMemberModal.tsx) · [components/sections/VIPSection.tsx](../../components/sections/VIPSection.tsx) · [components/sections/AboutSection.tsx](../../components/sections/AboutSection.tsx) · [components/pricing/LeadGate.tsx](../../components/pricing/LeadGate.tsx) · [app/services/[slug]/page.tsx](../../app/services/%5Bslug%5D/page.tsx) | 2 each |
| [components/team/CeoSpotlight.tsx](../../components/team/CeoSpotlight.tsx) · [components/layout/Footer.tsx](../../components/layout/Footer.tsx) · [components/history/TimelineEventModal.tsx](../../components/history/TimelineEventModal.tsx) · [components/aeroplex/ProgrammeTimeline.tsx](../../components/aeroplex/ProgrammeTimeline.tsx) · [components/about/InfrastructureShowcase.tsx](../../components/about/InfrastructureShowcase.tsx) · [app/services/page.tsx](../../app/services/page.tsx) · [app/error.tsx](../../app/error.tsx) | 1 each |

Also delete the 25 dead `dark:` utilities in the five files named in §3 while in
there — same files, same edit, and they are lies about a toggle that does not exist.

### S2 — the on-accent pair · 175 sites, 33 files

`ean-text-dark` (81) and `ean-muted-dark` (94) are doing two jobs. §4 points them at
white and lavender, correct for the **first** job and wrong for the second.

**Job A — label on a blue fill. Leave alone; §4 fixes them.** The primitives:

| File | Line | Today | After §4 |
|---|---|---|---|
| [components/shared/GoldButton.tsx](../../components/shared/GoldButton.tsx) | 20 | `bg-ean-gold text-ean-text-dark` | white on `#2b0098`, 13.50:1 |
| [components/shared/OutlineButton.tsx](../../components/shared/OutlineButton.tsx) | 28 | `hover:bg-ean-gold hover:text-ean-text-dark` | white on `#2b0098` |
| [components/shared/OutlineButton.tsx](../../components/shared/OutlineButton.tsx) | 29 | `border-ean-text-dark/30 text-ean-text-dark hover:bg-ean-text-dark hover:text-ean-text-light` | **broken both ways — rewrite by hand** |

Line 29 is the light-variant outline button and it inverts on hover. After the swap
it is white-on-white at rest and ink-on-ink on hover. Rewrite to
`border-ean-gold/40 text-ean-gold hover:bg-ean-gold hover:text-ean-text-dark`, which
makes both variants the same blue button and removes the reason the two branches
differ.

**Job B — body copy on a light section. Must be rewritten.** Every
`text-ean-text-dark` / `text-ean-muted-dark` that is *not* inside a `bg-ean-gold`
element becomes `text-ean-text-light` / `text-ean-muted-light`. Grep each file for
`bg-ean-gold` first; if the file has none, all its hits are Job B.

Files with no `bg-ean-gold` — convert wholesale:
[app/privacy-policy/page.tsx](../../app/privacy-policy/page.tsx) (11) ·
[app/terms-of-use/page.tsx](../../app/terms-of-use/page.tsx) (10) ·
[components/blog/ArticleBody.tsx](../../components/blog/ArticleBody.tsx) (5) ·
[components/pricing/QuoteLineItem.tsx](../../components/pricing/QuoteLineItem.tsx) (2) ·
[components/aeroplex/CampusOverview.tsx](../../components/aeroplex/CampusOverview.tsx) (1).

Files with both — read every hit:
[components/pricing/BuildYourQuoteCard.tsx](../../components/pricing/BuildYourQuoteCard.tsx) (**39 — the largest single block in the job**) ·
[components/pricing/PriceListDirectory.tsx](../../components/pricing/PriceListDirectory.tsx) (16) ·
[app/history/page.tsx](../../app/history/page.tsx) (7) ·
[app/about/page.tsx](../../app/about/page.tsx) (7) ·
[app/contact/page.tsx](../../app/contact/page.tsx) (6) ·
[app/blog/[slug]/page.tsx](../../app/blog/%5Bslug%5D/page.tsx) (6) ·
[components/pricing/ServiceOptions.tsx](../../components/pricing/ServiceOptions.tsx) (5) ·
[components/pricing/LeadGate.tsx](../../components/pricing/LeadGate.tsx) (5) ·
[components/pricing/AddonsGrid.tsx](../../components/pricing/AddonsGrid.tsx) (5) ·
[components/team/TeamMemberModal.tsx](../../components/team/TeamMemberModal.tsx) (4) ·
[components/team/TeamDirectoryGrid.tsx](../../components/team/TeamDirectoryGrid.tsx) (4) ·
[components/aeroplex/CampusFacilities.tsx](../../components/aeroplex/CampusFacilities.tsx) (4) ·
[app/blog/page.tsx](../../app/blog/page.tsx) (4) ·
[components/sections/VIPSection.tsx](../../components/sections/VIPSection.tsx) (3) ·
[components/sections/NewsSection.tsx](../../components/sections/NewsSection.tsx) (3) ·
[components/layout/Navbar.tsx](../../components/layout/Navbar.tsx) (3) ·
[components/sections/AboutSection.tsx](../../components/sections/AboutSection.tsx) (2) ·
[components/pricing/QuoteSummary.tsx](../../components/pricing/QuoteSummary.tsx) (2) ·
[components/pricing/QuoteActions.tsx](../../components/pricing/QuoteActions.tsx) (2) ·
[components/pricing/ModeToggle.tsx](../../components/pricing/ModeToggle.tsx) (2) ·
[components/pricing/AircraftSelector.tsx](../../components/pricing/AircraftSelector.tsx) (2) ·
[app/services/page.tsx](../../app/services/page.tsx) (2) ·
[components/shared/OutlineButton.tsx](../../components/shared/OutlineButton.tsx) (2, handled above) ·
[components/sections/PartnersStrip.tsx](../../components/sections/PartnersStrip.tsx) (1) ·
[components/shared/GoldButton.tsx](../../components/shared/GoldButton.tsx) (1, handled above) ·
[components/pricing/RequestOrderModal.tsx](../../components/pricing/RequestOrderModal.tsx) (1) ·
[components/pricing/PricingCalculator.tsx](../../components/pricing/PricingCalculator.tsx) (1) ·
[app/services/[slug]/page.tsx](../../app/services/%5Bslug%5D/page.tsx) (1).

### S3 — `ean-white` used as text · 1 site, 2 files

[components/layout/Preloader.tsx](../../components/layout/Preloader.tsx) line 92 —
the `E A N` wordmark is `text-ean-white` on a `bg-ean-navy` veil (line 40). After §4
both are near-white and the wordmark disappears for 2.6 seconds on every first load.

Set line 40 to `bg-ean-gold` (the blue) and leave the wordmark white — the opening
veil becomes a full-bleed brand blue with the jet drawing across it. The brass artwork
tokens then need to become white, or they vanish into the blue:

- line 66 `stroke-ean-gold-muted` → `stroke-white/25`
- line 97 `bg-ean-gold-muted` → `bg-white/25`
- line 83 `fill-ean-gold-light` → `fill-white`
- [app/globals.css](../../app/globals.css) lines ~525–540 — the three
  `.ean-preloader-stop-*` rules take `var(--color-ean-gold*)`; repoint to white.

The alternative — a white veil — was rejected: it is indistinguishable from an
unstyled loading page, and the veil's whole job is to read as brand before the hero
paints.

### S4 — light text over photography · ~96 sites, 27 files

`text-ean-text-light` / `text-ean-muted-light` / `text-ean-white` sitting on a
`next/image` fill must stay white after §4 points those tokens at ink. Convert each
to `text-white` / `text-white/70` — a literal, because there is no longer a token
whose job is "text on a photograph" and inventing one for 96 sites is not worth a
25th token.

The same pass covers the scrims: 200 alpha-on-surface-token utilities
(`bg-ean-black/70`, `bg-ean-navy/90`, `from-ean-obsidian/80` …). Every one of them is
currently darkening a photograph and after §4 becomes a white wash that erases it.
Each must become `bg-black/70`, `from-black/80` etc. **This is the riskiest part of
the job and the only part that cannot be verified by grep — it needs eyes on every
hero, card and modal.**

Files, ordered by light-text references over imagery:

| File | Refs |
|---|---|
| [components/layout/Footer.tsx](../../components/layout/Footer.tsx) | 25 |
| [app/contact/page.tsx](../../app/contact/page.tsx) | 24 |
| [app/services/page.tsx](../../app/services/page.tsx) | 20 |
| [app/blog/page.tsx](../../app/blog/page.tsx) | 16 |
| [components/about/InfrastructureShowcase.tsx](../../components/about/InfrastructureShowcase.tsx) | 12 |
| [components/history/TimelineEventModal.tsx](../../components/history/TimelineEventModal.tsx) · [components/team/TeamGsapTimeline.tsx](../../components/team/TeamGsapTimeline.tsx) | 10 each |
| [app/about/page.tsx](../../app/about/page.tsx) · [app/services/[slug]/page.tsx](../../app/services/%5Bslug%5D/page.tsx) | 9 each |
| [app/blog/[slug]/page.tsx](../../app/blog/%5Bslug%5D/page.tsx) · [components/aeroplex/SiteGallery.tsx](../../components/aeroplex/SiteGallery.tsx) | 8 each |
| [app/team/page.tsx](../../app/team/page.tsx) · [components/sections/NewsSection.tsx](../../components/sections/NewsSection.tsx) | 7 each |
| [app/history/page.tsx](../../app/history/page.tsx) · [components/team/CeoSpotlight.tsx](../../components/team/CeoSpotlight.tsx) | 6 each |
| [components/aeroplex/AeroplexHero.tsx](../../components/aeroplex/AeroplexHero.tsx) · [components/sections/VIPSection.tsx](../../components/sections/VIPSection.tsx) | 5 each |
| [components/aeroplex/CampusOverview.tsx](../../components/aeroplex/CampusOverview.tsx) · [components/sections/AboutSection.tsx](../../components/sections/AboutSection.tsx) | 4 each |
| [app/charter/page.tsx](../../app/charter/page.tsx) · [components/sections/CharterSection.tsx](../../components/sections/CharterSection.tsx) · [components/sections/ContactSection.tsx](../../components/sections/ContactSection.tsx) · [components/sections/HeroSection.tsx](../../components/sections/HeroSection.tsx) · [components/sections/ServicesSection.tsx](../../components/sections/ServicesSection.tsx) · [components/team/TeamDirectoryGrid.tsx](../../components/team/TeamDirectoryGrid.tsx) · [components/team/TeamMemberModal.tsx](../../components/team/TeamMemberModal.tsx) | 2 each |

---

## 6. Off-token colour that the swap will not reach

### 6.1 `app/layout.tsx` line 118

`<body className="… bg-ean-navy text-ean-text-light …">` — resolves correctly after
§4 (paper ground, ink text) but should move to `bg-ean-black` so the page ground is
the ramp's true white rather than the raised step. One line.

`@layer base` in [app/globals.css:310](../../app/globals.css) sets
`@apply bg-ean-black text-ean-text-light` — already correct, no change.

### 6.2 `app/global-error.tsx` — 6 hardcoded hex, lines 34–87

This route replaces the root layout, so it cannot use Tailwind and hardcodes the
palette inline. It will keep rendering the old ink/brass scheme after every other
page has changed.

| Line | Today | New |
|---|---|---|
| 34 | `backgroundColor: '#0e1214'` | `'#ffffff'` |
| 35 | `color: '#f5f2ea'` | `'#1f1f23'` |
| 49 | `color: '#a9895a'` | `'#2b0098'` |
| 76 | `color: '#a9895a'` | `'#2b0098'` |
| 86 | `backgroundColor: '#a9895a'` | `'#2b0098'` |
| 87 | `color: '#0e1214'` | `'#ffffff'` |

### 6.3 Raw Tailwind colour utilities · ~200 sites, 32 files

`bg-white` (44), `bg-white/5` (40), `text-slate-900` (17), `bg-gray-50` (11),
`text-slate-600` (10), `border-slate-200` (10), and a long tail.

Two behaviours, and they must be separated:

- **`bg-white/5`, `bg-white/10`, `from-white/15`, `placeholder-white/50` (≈55 sites)** —
  these are *lightening* washes over dark surfaces. On paper they vanish. Each becomes
  a dark wash (`bg-black/5`) or is deleted. Concentrated in
  [components/sections/QuoteCalculator.tsx](../../components/sections/QuoteCalculator.tsx),
  [components/pricing/BuildYourQuoteCard.tsx](../../components/pricing/BuildYourQuoteCard.tsx),
  and [components/team/CeoSpotlight.tsx](../../components/team/CeoSpotlight.tsx) line 84.
- **`text-slate-*`, `bg-gray-*`, `border-slate-200` (≈100 sites)** — already
  ink-on-paper and already correct. Convert to tokens for consistency, but this is
  tidying, not a fix. It can ship after launch.

Full file list, by raw-utility count:
[components/sections/QuoteCalculator.tsx](../../components/sections/QuoteCalculator.tsx) 36 ·
[components/pricing/BuildYourQuoteCard.tsx](../../components/pricing/BuildYourQuoteCard.tsx) 24 ·
[app/terms-of-use/page.tsx](../../app/terms-of-use/page.tsx) 19 ·
[app/services/[slug]/page.tsx](../../app/services/%5Bslug%5D/page.tsx) 17 ·
[components/pricing/PriceListDirectory.tsx](../../components/pricing/PriceListDirectory.tsx) 15 ·
[components/sections/ServicesSection.tsx](../../components/sections/ServicesSection.tsx) 13 ·
[components/pricing/AircraftSelector.tsx](../../components/pricing/AircraftSelector.tsx) 13 ·
[components/team/TeamMemberModal.tsx](../../components/team/TeamMemberModal.tsx) 12 ·
[app/contact/page.tsx](../../app/contact/page.tsx) 11 ·
[components/pricing/ServiceOptions.tsx](../../components/pricing/ServiceOptions.tsx) 9 ·
[app/privacy-policy/page.tsx](../../app/privacy-policy/page.tsx) 9 ·
[components/layout/Footer.tsx](../../components/layout/Footer.tsx) 6 ·
[components/pricing/LeadGate.tsx](../../components/pricing/LeadGate.tsx) 5 ·
[components/pricing/QuoteSummary.tsx](../../components/pricing/QuoteSummary.tsx) 4 ·
[components/pricing/QuoteLineItem.tsx](../../components/pricing/QuoteLineItem.tsx) 4 ·
[app/blog/page.tsx](../../app/blog/page.tsx) 4 ·
[app/history/page.tsx](../../app/history/page.tsx) 3 ·
plus 15 files with 1–2 each.

**Keep as-is:** `bg-[#25D366]` in
[components/pricing/QuoteActions.tsx](../../components/pricing/QuoteActions.tsx) line 91
and [components/sections/QuoteCalculator.tsx](../../components/sections/QuoteCalculator.tsx)
line 1009 — WhatsApp brand green, not ours to retheme.

### 6.4 `components/layout/Navbar.tsx` line 153

`bg-ean-black/95 backdrop-blur-md` is the scrolled state. It resolves to white/95 and
works, but the nav sits over the hero photograph in its *unscrolled* state, where the
links are `text-ean-text-light` → ink on a dark photo. Covered by S4, but call it out
separately: **it is the first thing anyone sees and the only element that changes
ground mid-scroll.**

### 6.5 Documentation that describes the palette

`AGENTS.md` requires that a change to something it documents lands in the same commit.
Three files describe the ink/brass system and become wrong the moment P ships:

| File | What changes |
|---|---|
| [AGENTS.md](../../AGENTS.md) §5 | The whole token block, the "brass is an accent only" rule (it is not — the blue is a *surface*, §9.2), and the `ean-indigo` warning, which stops applying once indigo *is* the accent |
| [docs/specs/2026-08-31-v7-ink-brass-redesign.md](./2026-08-31-v7-ink-brass-redesign.md) | Status header → superseded by this document for Job P |
| [.agents/skills/develop/ui/generate.md](../../.agents/skills/develop/ui/generate.md) | Generic, no EAN values hardcoded — verify only |

`AGENTS.md` §5 also still points readers at `2026-08-31-blue-gold-dark-theme.md` and
says "the site is not yet dark-themed". After this work it never will be. Repoint that
line here.

---

## 7. Admin — verified out of scope, no work required

`.admin-theme` ([app/globals.css:265](../../app/globals.css)) pins 20 colour tokens
outside `@theme`, and `app/admin/layout.tsx` line 47 puts the class on the div that
wraps every admin route. Custom properties inherit and an unlayered rule beats a
layered one, so all 931 admin token references redirect without touching an admin
file.

17 `@theme` tokens are **not** pinned: `ean-blue*` (5), `ean-burgundy*` (8),
`ean-error`, `ean-indigo`, `ean-live`, `ean-slate`, `ean-slate-deep`. A scan of
`app/admin/` and `components/admin/` returns **zero references to any of them**, so
the gap is theoretical. `--shadow-ean-gold*` is likewise unpinned and likewise unused
in admin (0 references; all 4 are public).

**Action: none.** Add the 17 tokens to the pin block anyway if admin ever adopts one —
the failure mode is silent, and the block is the place it is documented.

---

## 8. Order of work

Two tracks. The engineering track (S/P/X) makes the site legible on paper; the design
track (D/R) makes it a design. They run in parallel and meet at the flip.

### Engineering track

| | Job | Scope | Files | Risk |
|---|---|---|---|---|
| **S1** | Split surface-as-text | 182 sites + 25 dead `dark:` | 33 | Very low — mechanical, no visual change |
| **S2** | Split the on-accent pair | 175 sites | 33 | Low — one hand-written fix (OutlineButton:29) |
| **S3** | Preloader veil | 1 component + 3 CSS rules | 2 | Very low |
| **P** | **Palette swap** | 40 token values | **1** | Low — provable per-pairing (§4.3) |
| **S4** | Photography scrims + light text over images | ≈96 text + 200 scrim | 27 | **High — visual review, section by section** |
| **X** | Off-token cleanup | ≈206 raw utilities + global-error | 33 | Medium |

### Design track

| | Job | Scope | Files | Risk |
|---|---|---|---|---|
| **D** | **Comps: homepage, `/the-aeroplex`, `/pricing`** | 3 pages, no code | 0 | **Blocks R. Nothing else in this document waits on it** |
| **R1** | Strip the dark-only devices | 26 glows + 42 shadows + 87 gradients | ≈35 | Medium — deletion, mostly |
| **R2** | Rebuild the band rhythm per the comps | ≈14 sections across 6 pages | ≈20 | **High — real design work** |
| **R3** | QuoteCalculator on paper | 1,465 lines, 215 refs | 1 | **High — the single largest component** |

### Sequencing

**S1, S2 and S3 are invisible on the current dark site** — they change which token a
call site names, not what colour it resolves to. They can ship, be reviewed and sit in
production for as long as needed before P flips anything. **Start them today; they do
not wait on D.**

**D starts now, in parallel.** It is the long pole and it is the only item here that
cannot be derived from the repo.

**P + S4 + R1 ship as one commit.** Between them the site has ink text on dark
photographs and 26 blue smudges on white, neither of which anyone should see.

**R2 and R3 ship page by page after the flip**, each behind its own review. The site
is legible and coherent-if-plain from the moment P lands; R2 is what makes it good.

**X can ship after launch** except for `global-error.tsx` (§6.2) and the ≈55
`bg-white/N` washes (§6.3), which belong with P.

---

## 9. The redesign — what the palette swap does not fix

Everything above makes the site *legible* on paper. None of it makes the site *work*
on paper. This section is the design brief.

### 9.1 The site gets 100% of its hierarchy from surface luminance

Measured separation between adjacent surfaces:

| Adjacent pair | Ratio | Reads as a different section? |
|---|---|---|
| white ‖ old ink band — **today** | **18.83** | Unmistakably |
| white ‖ raised `#f4f5f7` | 1.09 | No |
| white ‖ recessed `#eaecf0` | 1.18 | Barely — a whisper, useful for grouping only |
| raised ‖ recessed | 1.08 | No |
| **white ‖ blue `#2b0098`** | **13.50** | **Unmistakably** |

The homepage rhythm today, in order — every white section is defined by the ink on
both sides of it:

| # | Section | Surface today |
|---|---|---|
| 1 | [HeroSection](../../components/sections/HeroSection.tsx) | photo, full bleed, dark |
| 2 | [TrustBar](../../components/sections/TrustBar.tsx) | ink band |
| 3 | [AboutSection](../../components/sections/AboutSection.tsx) | **white** |
| 4 | [ServicesSection](../../components/sections/ServicesSection.tsx) | ink, with a white card inset (line 171) |
| 5 | [VIPSection](../../components/sections/VIPSection.tsx) | **white** |
| 6 | [CharterSection](../../components/sections/CharterSection.tsx) | photo + `bg-ean-black/75` |
| 7 | [PartnersStrip](../../components/sections/PartnersStrip.tsx) | **pale grey** |
| 8 | [ContactSection](../../components/sections/ContactSection.tsx) | photo + `bg-ean-black/70` |

A perfect ABAB. Recolour it and you get white, white, white, white, white, white,
pale-grey, white — one continuous scroll with no landmarks, and 3, 5 and 7 lose the
only reason they are separate sections.

### 9.2 The answer: the blue is a surface, not an accent

`#2b0098` has a relative luminance of **0.0278**. For comparison:

| | Luminance |
|---|---|
| ink `#0e1214` (today's ground) | 0.0058 |
| ink2 `#161c1f` | 0.0110 |
| ink3 `#1d2529` (today's top step) | 0.0174 |
| **blue `#2b0098`** | **0.0278** |
| blue-light `#4a1fd0` | 0.0699 |
| grey `#969696` | 0.3050 |
| recessed `#eaecf0` | 0.8377 |

The brand blue is a *dark surface that happens to be chromatic*. It sits one step
above the ink ramp's top step and nowhere near the papers. **It is the only value in
the new palette that can do what the ink bands did**, and using it only as a link and
a button colour wastes it.

So the new system has three surfaces and a photograph, not two papers:

| Surface | Value | Role | Type on it |
|---|---|---|---|
| **Paper** | `#ffffff` | The default. Most sections. | ink `#1f1f23` |
| **Recessed** | `#eaecf0` | Grouping only — a table, a well, a strip. Never rhythm. | ink `#1f1f23` |
| **Blue band** | `#2b0098` | The statement section. Carries the rhythm. | white / `#cfc6ee` |
| **Photograph** | — | Full-bleed, `bg-black/70` scrim | white |

**Composition rule: no more than two consecutive sections on paper.** A blue band or
a photograph every third section, minimum. That rule is what replaces ABAB, and it is
the single thing to check any redesigned page against.

The grey `#969696` gets the job it can actually hold at 2.96:1: it is the **structure**
colour. Hairlines, dividers, table rules, input outlines against a filled ground, the
1px gaps between grid cells. In a system with no dark surfaces the rule weight is
doing much more work than it was, and the given grey is exactly right for it.

### 9.3 Four decorative devices that are dark-only and have to be replaced, not recoloured

| Device | Sites | Files | What happens on paper | Replace with |
|---|---|---|---|---|
| **Radial glow blobs** — `rounded-full bg-ean-gold/10 blur-[120px]` | **26** | 22 | A blurred blue bloom at 5–10% on white is either invisible or reads as a smudge on the print | Delete. Where the section genuinely needs interest, a flat `#eaecf0` block or a blue band |
| **`shadow-2xl` / `shadow-xl`** | **42** | — | On ink these read as a lift; on white a 2xl shadow reads as a heavy, dated drop shadow | 1px `--color-ean-grey` hairline, or a `#eaecf0` fill. The v7 rule already says one weight, one hairline |
| **`bg-linear-to-*` gradients** | **87** | — | Most run dark-to-darker. White→`#f4f5f7` is a 1.09 ramp — it compresses to a flat fill | Audit each: most become a flat surface; the photo scrims stay as `from-black/80` |
| **Tinted glass** — `backdrop-blur` + `bg-ean-navy/80` | **42** | — | Inverts to white glass. Works over photography, does nothing over paper | Keep over photography (as white or black glass, per image); delete over paper |

The glow blobs are the one to be firm about. They are the signature of a dark UI and
there is no light-theme equivalent — every attempt at one looks like a rendering
artefact. 22 files, one deletion each.

### 9.4 Per-page redesign assignments

Rated by how much is genuine design work versus recolouring.

| Page | Surfaces today | Redesign |
|---|---|---|
| **Homepage** [app/page.tsx](../../app/page.tsx) | 3 ink, 3 white, 1 grey, 2 photo | **Heavy.** Rebuild the rhythm per §9.2. Suggested: hero photo → TrustBar as a **blue band** → About paper → Services paper → VIP **blue band** → Charter photo → Partners recessed → Contact photo. That restores an eight-beat alternation using blue and photography as the dark beats |
| **`/about`** [app/about/page.tsx](../../app/about/page.tsx) | 1 ink hero, 3 `ean-surface`, 1 glow | **Heavy.** Three consecutive `ean-surface` bands (lines 192, 268, 308) currently read as distinct because ink sits between them. They will merge into one 1,400px block. Needs one converted to a blue band and one to a photo band |
| **`/services`** [app/services/page.tsx](../../app/services/page.tsx) | 1 ink, 1 surface, 3 glows | **Heavy.** Also carries [ServicesSection](../../components/sections/ServicesSection.tsx) line 171 — a white card on ink with `shadow-2xl`. On paper it is a white card on white with a heavy shadow. Rebuild as hairline-bordered |
| **`/the-aeroplex`** | all component-level | **Medium.** [AeroplexHero](../../components/aeroplex/AeroplexHero.tsx), [CampusOverview](../../components/aeroplex/CampusOverview.tsx), [CampusFacilities](../../components/aeroplex/CampusFacilities.tsx), [ProgrammeTimeline](../../components/aeroplex/ProgrammeTimeline.tsx), [SiteGallery](../../components/aeroplex/SiteGallery.tsx), [PartnerRequest](../../components/aeroplex/PartnerRequest.tsx) — six sections, no surface variation at all today. Needs a rhythm inventing, not converting |
| **`/pricing`** | already light | **Low.** [QuoteCalculator](../../components/sections/QuoteCalculator.tsx) is the exception — 1,465 lines, 215 token refs, 36 raw utilities, 2 glows, and its panels are all dark gradients on ink. This one component is the largest single piece of design work on the site |
| **`/team`** [app/team/page.tsx](../../app/team/page.tsx) | 1 ink, 1 glow | **Medium.** [CeoSpotlight](../../components/team/CeoSpotlight.tsx) line 84 is a `from-white/15 via-white/5` glass panel over a portrait — inverts to nothing. [TeamGsapTimeline](../../components/team/TeamGsapTimeline.tsx) and [TeamDirectoryGrid](../../components/team/TeamDirectoryGrid.tsx) use `bg-ean-navy/80` badges over portraits, which need to stay dark |
| **`/history`** [app/history/page.tsx](../../app/history/page.tsx) | 2 ink, 2 surface, 1 white, 1 glow | **Medium.** The timeline spine is a hairline today and survives; the event cards need the shadow→hairline treatment |
| **`/contact`** [app/contact/page.tsx](../../app/contact/page.tsx) | 1 white, 1 surface, 1 navy, 1 obsidian | **Medium.** Already alternating; the ink band becomes the blue band. The form is the highest-value thing on the site — its input borders are the one place `#969696` at 2.96:1 is not good enough (§2.2), so inputs get a `#6b6b6b` outline |
| **`/blog`, `/blog/[slug]`** | 1 navy, 1 white, 1 glow each | **Low–medium.** [ArticleBody](../../components/blog/ArticleBody.tsx) is prose and mostly survives; the article hero is a photo band |
| **`/charter`** [app/charter/page.tsx](../../app/charter/page.tsx) | 1 ink | **Low.** Charter and catering copy is unaffected |
| **Legal** `/privacy-policy`, `/terms-of-use` | already light, 1 glow each | **Low.** Delete the glow, convert the raw slate utilities |
| **[Footer](../../components/layout/Footer.tsx)** | ink, gradient band, 1 glow, 25 light-text refs | **Medium.** A white footer under a white last section has no edge. Make the footer the site's permanent **blue band** — it closes every page and gives the blue a fixed home |
| **[Navbar](../../components/layout/Navbar.tsx)** | transparent → `bg-ean-black/95` on scroll | **Medium, high visibility.** Two grounds in one component (§6.4) |
| **[Preloader](../../components/layout/Preloader.tsx)** | ink veil, brass artwork | Covered by S3 — becomes the blue veil |

### 9.5 What does not change

Worth stating so the redesign does not sprawl. The v7 system's non-colour decisions
all hold on paper and are not reopened:

- **Geometry** — square corners, one 1px rule weight, 1px grid gaps over a
  hairline-coloured ground rather than a border per card. This carries *more* of the
  design now, not less.
- **Typography** — Fraunces / Archivo / IBM Plex Mono, the stepped-down display
  scale, `h1–h3` at weight 300 with tight leading.
- **Measure** — `--container-ean: 1160px`.
- **Mono eyebrows, stat labels, `Basis:` lines** — the evidence-carrying pattern is
  the argument of the homepage and is unaffected.
- **Motion** — the preloader timeline, `ean-rise`, the enter/exit pairs, the sliding
  indicator. Only the preloader's colours move (S3).

### 9.6 Sequencing the design work

§9 cannot be specced further from the repo alone — §9.4 says *which* sections need
rebuilding and *why*, but what replaces them is a design decision, not a measurement.
The next step is comps for three pages, not code:

1. **Homepage** — settles the band rhythm and the blue-band treatment for the whole site.
2. **`/the-aeroplex`** — the hardest case: six sections with no surface variation today.
3. **`/pricing` + QuoteCalculator** — settles how a dense data UI works on paper.

Everything else follows those three. Nothing in §9 should start before the homepage
comp is signed off, and **§9 does not block §1–§9** — S1, S2 and S3 are invisible
token renames that can ship while the comps are being drawn.

---

## 10. Totals

### 10.1 Engineering

- **64 public files** reference a colour token or raw colour utility
- **1 file** carries the palette itself
- **≈660 call sites** rewritten across S1–S4
- **≈1,900 references** follow the token swap for free
- **0 admin files** change

### 10.2 Design

- **≈14 sections across 6 pages** need rebuilding, not recolouring (§9.4)
- **155 dark-only decorative uses** deleted or replaced — 26 glows, 42 shadows,
  87 gradients (§9.3)
- **3 comps** gate the rest: homepage, `/the-aeroplex`, `/pricing` (§9.6)
- **1 component**, [QuoteCalculator](../../components/sections/QuoteCalculator.tsx),
  is a design job on its own

### 10.3 Open decisions — both need answering before build

1. **§2.2 — `#969696` cannot carry text at any size on any paper in this ramp**
   (2.96:1). Confirm the derived `#6b6b6b` for muted copy, with the given grey kept
   verbatim as the hairline/structure colour.
2. **§9.2 — the blue becomes a surface, not just an accent.** Full-bleed `#2b0098`
   bands are what replace the ink bands and carry the page rhythm. This is a bigger
   presence for the brand blue than "light theme with blue accents" implies, and it is
   the one thing to put in front of the CEO before comps are drawn.

---

## 11. Build record — 1 September 2026

The engineering track shipped as specced except where noted. `npm run lint` is at
zero errors and zero warnings, `tsc --noEmit` is clean, and `npm run build`
prerenders every route it prerendered before.

### 11.1 What shipped

| Job | Result |
|---|---|
| **S1** | 182 sites → `text-ean-text-light` across 33 files, exactly the counts in §5. 25 dead `dark:` lines deleted from the five files in §3; two `className=""` props left behind were removed with them |
| **S2** | 145 sites converted (Job B), 24 left on a solid fill (Job A). `OutlineButton:29` rewritten by hand as specced |
| **S2b** | **Not in this document — see §11.2.1.** 31 further sites fixed |
| **S3** | Preloader veil → `bg-ean-gold`, artwork → white, the three `.ean-preloader-stop-*` rules repointed |
| **P** | 40 token values in `app/globals.css`, plus the new `--color-ean-grey`. Every ratio in §4.3 was re-measured before the write; all 19 pairings and all four surface separations match this document to 0.01 |
| **S4** | 44 scrims/backdrops → literal `black`; 45 lines of type → literal `white`, across 11 photo regions. **Not the ~200/~96 this document estimates — see §11.2.3** |
| **§6.1** | `app/layout.tsx:118` → `bg-ean-black` |
| **§6.2** | `app/global-error.tsx` — **8** literals, not the 6 tabulated. See §11.2.2 |
| **§6.3** | The 58 lightening washes inverted to dark washes (49 raw `white/N`, 9 token-based). The `text-slate-*` / `bg-gray-*` tidy is deferred as this document allows |
| **§6.5** | `AGENTS.md` §5 rewritten; the v7 spec's status header updated; `.agents/skills/develop/ui/generate.md` verified to carry no EAN values (it does not); `BasisLine.tsx` and `Navbar.tsx` docblocks corrected |
| **§7** | Confirmed by measurement, not assumption: the pin holds 20 tokens, and `app/admin/` + `components/admin/` contain **zero** references to any of the 18 unpinned ones (17 listed here, plus the new `ean-grey`). No admin file changed. Action remains: none |
| **R1 (part)** | 26 glow blobs deleted from 19 files. 42 `shadow-2xl`/`shadow-xl` stripped — 41 of the 42 elements already carried a 1px rule, so the hairline was already there; the one that did not got `border-ean-grey/50` |

### 11.2 Where the build departed from this document

#### 11.2.1 S2 has an inverse, and S1 as written creates it

This document splits the four families that are background **and** text. It does
not cover the fifth case: a solid accent fill carrying `text-ean-text-light`.
There were **31** of them — 30 on `bg-ean-gold` and one on `bg-ean-blue`, which
§4 points at the same `#2b0098`. §4 turns that into ink `#1f1f23` on `#2b0098` —
**1.22:1**, the blank button §1 warns about, arrived at from the other direction.

Three were manufactured by S1 itself. `hover:bg-ean-gold hover:text-ean-navy` is
a gold fill carrying dark type, so S1's rule — "every one is dark ink on a light
section and must stay dark ink" — rewrites it to `hover:text-ean-text-light` and
breaks it. S1 is safe only if the on-fill hover states are excluded, which this
document does not say.

The other 28 were **already failing**: ivory on brass measures ~1.47:1, so these
controls have been unreadable on the live ink/brass site. All 31 now use
`text-ean-text-dark` → white on blue, 13.50:1.

Fixed in: `error.tsx`, `privacy-policy`, `services/[slug]` ×2, `terms-of-use` ×2,
`InfrastructureShowcase`, `ProgrammeTimeline`, `TimelineEventModal`, `Footer`,
`AboutSection`, `PricingSection` ×3, `QuoteCalculator` ×13, `TeamGsapTimeline` ×3,
and `contact/page.tsx:540` — the checked service checkbox, which uses
`bg-ean-blue` rather than `bg-ean-gold` and so escapes any grep written around
the accent's usual name. Search both.

#### 11.2.2 `global-error.tsx` has 8 colour literals, not 6

§6.2 tabulates six. Lines 71 and 107 also carry `rgba(245,242,234,0.72)` and
`rgba(245,242,234,0.4)` — ivory at alpha, which on the new white ground is
invisible rather than merely low-contrast. They are now `#4a4a4a` (8.86:1) and
`#6b6b6b` (5.33:1). This route replaces the root layout, so nothing else would
have caught it.

#### 11.2.3 The S4 estimates are high, and the file table is a priority list

The prose says "≈96 sites" of light text over imagery and "200 alpha-on-surface
utilities" all "currently darkening a photograph". Measured:

- **194** alpha-on-surface-token utilities exist. **44** are scrims, photo
  dimmers, image placeholders or modal backdrops. The rest are panel fills,
  glass badges, and QuoteCalculator chrome that resolve to white panels on paper
  and are correct untouched.
- **45 lines** of type actually sit over photography, in **11 regions**, not ~96
  sites in 27 files. The §5.4 table sums to ~209, which is every light-text
  reference in those files rather than only the ones over imagery.

`Footer` is the clearest case: this document ranks it first at 25 refs, and it
contains **no photography at all**. Its 25 references are light type on the ink
gradient band, and they resolve to ink on white correctly with no edit. What the
footer needs is §9.4's blue band, which is R2.

#### 11.2.4 Glass badges over photography were left as tokens, deliberately

§9.3 says tinted glass should be kept over photography "as white or black glass,
per image". Applied consistently, that decides most of the 194: a badge whose own
type is `text-ean-gold` or `text-ean-text-light` becomes **white glass carrying
blue or ink type** when its token background is left alone, which reads correctly
over a photograph. Converting those to black would have required converting their
type too, for no gain. So:

- **full-inset gradient/solid overlays** inside an image container → literal black
- **modal and lightbox backdrops** → literal black
- **bordered, blurred badges and bars** → left as tokens (white glass)
- **low-alpha washes** on any surface → literal black at the same alpha

#### 11.2.5 The accent cannot be used over a dark scrim

Not raised anywhere in this document, and it affects every photo band. Brass
(`#a9895a`, L 0.29) read comfortably on a scrimmed photograph; `#2b0098` (L 0.028)
does not — it is a *dark* colour, which is exactly the §9.2 argument for using it
as a surface. Every hero eyebrow, icon, chevron, rule and border inside a photo
band was `ean-gold` and would have gone invisible.

Inside the 11 photo regions the accent is now white: eyebrows and icons
`text-white/70`, headlines `text-white`, ledes `text-white/80`, scroll hints
`text-white/60`. The homepage hero's active slide dot went `bg-ean-gold` →
`bg-white`, and its scroll-indicator ring `border-ean-gold/30` → `border-white/30`.

**This flattens the accent out of every hero, and it is a placeholder, not a
design.** R2 should decide what carries brand in a photo band — most likely a
white or blue chip behind a blue eyebrow. Listed in §11.4.

#### 11.2.6 §6.4 Navbar — resolved by making the resting bar opaque

The unscrolled bar is transparent, and after the swap its links are ink. Eight
routes put a full-bleed photograph behind it (home, `/about`, `/contact`,
`/history`, `/team`, `/charter`, `/services/[slug]`, `/the-aeroplex`) where ink is
invisible; the remaining routes put a white section behind it, where white would
be. One transparent bar cannot serve both.

The resting state is now `bg-ean-black` — the page ground, opaque — instead of
`bg-transparent`. The ops strip above it was already opaque, so the bar reads as
one white header that gains its hairline and blur on scroll. Per-route knowledge
of which heroes are photographs is real design work and belongs with §9.4's
navbar item.

#### 11.2.7 Two raw-utility sites are swap-caused, not pre-existing

§6.3 files the whole `text-slate-*` / `bg-gray-*` group as post-launch tidy on the
grounds that it is "already ink-on-paper and already correct". Two are not:
`CampusOverview.tsx:29` (`text-zinc-300`) and `ServicesSection.tsx:156`
(`text-zinc-400`) were light type on ink surfaces and land at ~1.6:1 and ~2.2:1 on
paper. Both are now `text-ean-muted-light`. The remaining ~100 are genuinely
already correct and are deferred.

#### 11.2.8 23 hardcoded old-palette shadow literals

Not named in §6.3. Twenty-one `rgba(169,137,90,…)` brass shadows and two
`rgba(145,116,220,…)` old-blue ones sit in arbitrary `shadow-[…]` utilities, which
no token swap reaches. On paper they would have rendered as brass and lilac
smudges. All repointed to `rgba(43,0,152,…)`.

### 11.3 Both open decisions from §10.3

1. **`#969696` cannot carry text (§2.2)** — built as this document specifies:
   the given grey is kept verbatim as `--color-ean-grey` and confined to
   hairlines, dividers and rules; `--color-ean-slate` is `#6b6b6b` (5.33:1) and
   carries muted type. **Still needs putting to the CEO**, because it is a
   departure from "grey text" as literally briefed. Nothing blocks on it — if the
   answer is different, it is one token value.
2. **The blue as a surface (§9.2)** — **not exercised.** No blue band was
   introduced. The blue is currently an accent, a CTA fill and the preloader veil.
   Every page therefore reads as an unbroken paper scroll, exactly as §9.1
   predicts. This is the decision to put in front of the CEO before comps.

### 11.4 What is left

Engineering:

- The **87 gradients** of §9.3. `bg-linear-to-*` is not mechanical — most should
  become a flat surface, the photo scrims must stay — and §9.6 says the audit
  should not start before the homepage comp. Untouched.
- `shadow-md` (39) and `shadow-lg` (17). Milder than the 42 that were stripped and
  not called out in §9.3; they should go the same way once the comps set the
  elevation rule.
- The ~100 `text-slate-*` / `bg-gray-*` conversions of §6.3, minus the two in
  §11.2.7.
- **`ean-grey` is defined and documented but has no call sites yet.** It is the
  structure colour of §9.2, and the borders currently resolve through
  `ean-border-dark` / `-light`, which are already tinted from it. R2 is where the
  grid gaps and table rules start naming it directly.

Design — all of §9, unchanged and unstarted:

- **D** — the three comps (§9.6). Nothing below should begin before the homepage
  comp is signed off.
- **R2** — the band rhythm. Right now nothing on the site obeys §9.2's
  "no more than two consecutive sections on paper".
- **R3** — QuoteCalculator. Its 51 alpha-on-surface utilities are all still panel
  chrome designed for ink; they resolve to legible white-on-white panels held
  apart only by their blue hairlines.
- Known-flat until R2, all legible, none blocking: `TrustBar` (was the ink band,
  now a raised paper strip), `Footer` (was ink, now a white gradient — §9.4 wants
  it as the permanent blue band), `ProgrammeTimeline`'s three card tiers (were
  `bg-ean-navy` at 50/40/25, now three near-identical near-whites), and the
  `blog/page.tsx` card hover states, whose base and hover colours both resolve to
  ink so the transition is now a no-op.
