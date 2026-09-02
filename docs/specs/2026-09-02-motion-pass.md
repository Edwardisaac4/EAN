# Motion Pass — Sequencing the Reveal, and Page Transitions

**Date:** 2 September 2026
**Instruction:** Adesoji — the site is too static and lacks the animation that
would make it feel alive on scroll and when entering different pages.
**Status:** **Plan only. Nothing implemented.** No file named in this document
has been touched.

**Scope: the public site only.** The admin console is out of scope. `/admin`
carries no scroll animation today and does not need any — it is a triage tool.

All counts below were measured against the repo on 2 September 2026. Method:
`grep` over the `.tsx` files under `app/` and `components/`, with `admin/` swept
but excluded from every figure quoted; CSS families counted against
`app/globals.css`. Call-site counts are of opening tags (`<SectionReveal`), not
imports.

---

## 1. The finding: the motion is uniform, not absent

The instruction assumes animation is missing. It is not. The measured position is
that **one animation plays 41 times**, which produces the same subjective result
by a different mechanism — and points at a different fix.

`components/shared/SectionReveal.tsx` is wrapped around nearly every section of
the public site: **41 call sites across 22 files.** Every one of them plays the
identical tween, with no parameters:

```
fromTo { opacity: 0, y: 32 } -> { opacity: 1, y: 0 }
duration 0.9 · ease power2.out
scrollTrigger.start 'top 85%' · toggleActions 'play none none none'
```

| File | Call sites |
|---|---|
| `app/contact/page.tsx` | 5 |
| `app/about/page.tsx` | 4 |
| `app/services/page.tsx` | 3 |
| `app/blog/page.tsx` · `app/privacy-policy/page.tsx` · `app/terms-of-use/page.tsx` · `app/services/[slug]/page.tsx` | 2 each |
| `components/aeroplex/` — `CampusOverview` · `CampusFacilities` · `ProgrammeTimeline` · `SiteGallery` · `PartnerRequest` | 2 each |
| `components/team/TeamDirectoryGrid.tsx` | 2 |
| `components/sections/` — `AboutSection` · `TrustBar` · `VIPSection` · `CharterSection` · `ContactSection` · `NewsSection` · `QuoteCalculator` | 1 each |
| `components/services/ServiceFeatureRow.tsx` · `components/about/InfrastructureShowcase.tsx` | 1 each |
| **Total** | **41** |

Two consequences, and together they are what "static" describes:

**1.1 It is one note.** Same travel distance, same duration, same easing, same
trigger point, at every one of the 41 sites. A motion the eye has already
resolved forty times stops registering as motion. Variety is not decoration
here — it is the mechanism by which sequence reads as life.

**1.2 It animates the container as one slab.** A heading, its body copy and a
six-card grid fade up locked together, because the tween targets
`containerRef.current` — the wrapper — and never its contents. Nothing resolves
*within* a section. Internal sequence is most of what "alive" actually is, and
the site has almost none of it: **only 2 files pass a real GSAP `stagger:`** —
`components/sections/ServicesSection.tsx` and
`components/team/TeamGsapTimeline.tsx`.

> `components/services/ServiceCard.tsx` carries a header comment claiming "the
> features stagger in rather than fading as one block, on a per-item" basis. The
> implementation is a single CSS `transition-opacity delay-100 duration-500` on a
> group — one transition, not a per-item stagger. The comment describes an intent
> that was not built. Either correct the comment or build the stagger; do not
> leave both standing.

## 2. What is already covered — do not spend effort here

Two things a motion brief would normally target are already dense, and were
measured before being assumed missing.

| Surface | Measured | Verdict |
|---|---|---|
| Hover / micro-interaction | **123** `group-hover:` sites · `transition-` in **69** files | Well covered. Leave alone. |
| Scroll-linked parallax | `scrub` at **11** call sites (`HeroSection`, `VIPSection`, `CharterSection`, `ContactSection`, `AeroplexHero`, and the `/about` `/contact` `/history` `/team` page bodies) | Present. Extend, do not rebuild. |
| Continuous motion | `animate-marquee` on `PartnersStrip`, paused on hover | Present, but see §7. |
| Preloader | `Preloader.tsx`, 2.6s CSS timeline, zero JS | Do not touch. AGENTS.md §8 governs it. |

**16 files** use `useGSAP`, and every one of them routes through
`withReducedMotion`. The gate has no GSAP-side holes.

## 3. What is genuinely absent

**3.1 Page transitions do not exist.** No `app/template.tsx`. No `ViewTransition`
or `unstable_ViewTransition` anywhere in `app/`, `components/` or
`next.config.ts`. Route changes are instant hard swaps. This is the entire second
half of the instruction and it is at zero — the highest-value gap in this
document.

**3.2 Four public surfaces have no scroll motion at all.**

| Surface | Rendered by | Note |
|---|---|---|
| `/blog/[slug]` | `components/blog/ArticleBody.tsx` | The worst of the four. This is where a reader spends the most time on the site, and no body block has a reveal. |
| `/pricing` | `components/pricing/PricingCalculator.tsx` | Also `components/sections/PricingSection.tsx`. |
| `/charter` | `components/charter/CharterRequestForm.tsx` | |
| `PartnersStrip` | — | Has the marquee, so not motionless, but no entrance. |

**3.3 Headline treatment.** `SplitText.js`, `Flip.js` and `ScrollSmoother.js` are
all present in `node_modules/gsap/` — GSAP 3.13+ released the bonus plugins free
and this repo is on 3.15. **All three are unused.** Per-line or per-word headline
reveals are the largest perceived change available per line of code written.

## 4. The work

Five jobs. S and P are the two that answer the instruction; the rest are smaller
and can be dropped without invalidating them.

### Job S — sequence the reveal (the core change)

Give `SectionReveal` the ability to sequence its contents, then vary its
parameters by section role so the motion stops being one note.

**The API decision matters, and the naive version is wrong.** "Stagger the direct
children" fails on this codebase: a large share of the 41 sites wrap a single
element (`<SectionReveal><div>…</div></SectionReveal>`), where direct-child
targeting is a silent no-op, while on the multi-child sites it would change the
look of pages nobody asked to change. Both failure modes are invisible in review.

Proposed instead:

```tsx
interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Sequence descendants marked `data-reveal`. Falls back to the whole-block
   *  tween when the subtree marks none. */
  stagger?: number | boolean;
  distance?: number;   // default 32
  duration?: number;   // default 0.9
  ease?: string;       // default 'power2.out'
}
```

- Targets `[data-reveal]` descendants, opt-in per site.
- **When the subtree marks nothing, behaviour is byte-for-byte today's.** That is
  what makes this safe to land across 41 sites in one commit and then convert
  them one at a time.
- `distance` / `duration` / `ease` are what break the uniformity. Headline blocks
  should travel further and slower than card grids; a full-bleed blue band should
  not arrive on the same curve as a legal clause.

Convert in tiers, judging the feel before widening: **T1** homepage
(`AboutSection`, `TrustBar`, `VIPSection`, `CharterSection`, `ContactSection`) →
**T2** `/about`, `/services`, `/team` → **T3** `/blog`, `/contact`, the aeroplex
components → **T4** the two legal pages, which should stay the most restrained
surfaces on the site (see §9.3).

### Job G — fix the grids (8 sites)

**8 of the 41 call sites sit inside a `.map()`**, one `SectionReveal` per item:

`app/about/page.tsx:249` · `app/blog/page.tsx:335` · `app/contact/page.tsx:651` ·
`app/privacy-policy/page.tsx:393` · `app/services/page.tsx:235` ·
`app/terms-of-use/page.tsx:424` · `components/aeroplex/CampusFacilities.tsx:52` ·
`components/team/TeamDirectoryGrid.tsx:37`

This looks like a stagger and is not one. Each card owns a private ScrollTrigger
at `top 85%`, so **every card in a row crosses the line on the same frame and
fires simultaneously** — the grid arrives one whole row at a time. It also
creates N ScrollTriggers where one would do, on the two legal pages once per
clause.

Replace with a single trigger on the grid container plus a grid-aware stagger:

```ts
stagger: { each: 0.06, from: 'start', grid: 'auto' }
```

Row-by-row slabs become a diagonal sweep, and the ScrollTrigger count on
`/privacy-policy` and `/terms-of-use` drops to one each.

### Job P — page transitions (currently zero)

Add `app/template.tsx`. A `template` re-mounts on every navigation, which is
exactly the hook needed, and the `ean-enter-*` keyframe families already exist in
`globals.css` — so this can be **CSS-only, no JS**, which is what keeps it inside
AGENTS.md §8.

**The cost is real and must be measured, not assumed.** A transition opening from
`opacity: 0` puts a beat in front of LCP on *every* navigation, and §8 is explicit
both that content must paint without JS and that the opaque phase is the expensive
one. Mitigations, in order of preference:

1. Weight the transition toward `transform`, keeping the opacity floor well above
   zero (e.g. `0.6`), so no frame is ever fully blank.
2. Keep it short — 0.25–0.35s. §8's finding that "lengthening the beat is free,
   lengthening the opaque phase is not" applies directly.
3. Exit animations are **out of scope.** The App Router has no exit hook without
   holding the outgoing route mounted, and `components/shared/Presence.tsx` is a
   component-level tool, not a route-level one. Entrance only.

**Gate: a production Lighthouse run before and after, desktop preset, four runs**
— the protocol §8 records for the preloader, because the noise band there swung
TBT 10–60ms between identical builds. A single run proves nothing.

### Job H — headline reveals with SplitText

Scope strictly to hero and section headlines. Two cautions:

- SplitText rewrites the element's DOM into per-line or per-word spans. On a
  headline that is the page's LCP element this can move LCP, so the hero is the
  one place to measure rather than assume.
- It must not introduce markup whose only path to visibility is JS — §8. Split on
  the client *after* paint, animating from a state GSAP sets at runtime, exactly
  as `SectionReveal` already does.

### Job R — close the reduced-motion gaps found while measuring

See §7. Small, independent of everything else, and should land first because it is
a correctness fix rather than a design change.

### Job D — correct `GSAP.md`

See §6.

## 5. Constraints that bound every job

- **`prefers-reduced-motion`, via `withReducedMotion` from `lib/gsap-motion.ts`,
  with a real `settle` branch.** Not optional: these tweens animate *from*
  `opacity: 0`, so a settle branch that merely skips the tween leaves content
  permanently invisible. Job S sharpens this — once `SectionReveal` targets
  descendants, the settle branch must clear **every marked descendant**, not just
  the container. A settle branch that still only resets the wrapper would blank
  the contents of all 41 sections for reduced-motion visitors. This is the single
  most likely way to break this work.
- **Content must paint without JS** (AGENTS.md §8). No `opacity-0` in markup that
  JS later removes. GSAP sets the start state at runtime; keep it that way.
- **No Framer Motion** (AGENTS.md §7). Nothing in this plan needs it.
- **`npm run lint` at zero errors and zero warnings.**
- **Do not widen `proxy.ts`**, and do not make a static page dynamic.

## 6. Doc debt — `GSAP.md` is stale and points at a banned library

`GSAP.md` is the house animation doc and is **actively misleading on exactly this
task**:

- Header reads **"Stack: Next.js 15"**. The repo is on Next 16.3.
- **§9.4 "Page Transition (Framer Motion — NOT GSAP)"** — the precise thing Job P
  builds, and the doc prescribes the library AGENTS.md §7 bans outright.
- §9.5 "Card Hover", §9.6 "Mobile Menu Open/Close" and the §10 "GSAP vs Framer
  Motion" decision table carry the same defect.

Anyone following the house doc to add page transitions is routed straight into the
forbidden dependency. §9.4–§9.6 and §10 should be rewritten against
`Presence.tsx` and the `ean-enter-*` / `ean-exit-*` CSS families, which are what
the codebase actually uses. §12's quick-reference values are accurate and match
`SectionReveal` as built — keep them, and extend them with whatever variants
Job S settles on.

## 7. Pre-existing reduced-motion gaps (found while measuring; not introduced here)

The `@media (prefers-reduced-motion: reduce)` block in `globals.css` (from line
856) covers **four families**: `.ean-rise`, `.animate-hero-progress`, the nine
`.ean-preloader*` layers, and `.ean-indicator`.

It does **not** cover:

- **`animate-marquee`** — an *infinite* continuous animation on `PartnersStrip`,
  which is the category `prefers-reduced-motion` most exists to stop. Hover pauses
  it; a motion preference does not.
- **The `ean-enter-*` / `ean-exit-*` / `ean-modal-*` families** — fade, up, down,
  dropdown, scale and modal. AGENTS.md §7 lists these as the CSS half of the
  animation system and states the media block reaches "the CSS utility classes",
  which is true of the four it names and not of these.

Neither is a regression from this work. Both should be fixed as Job R, and
AGENTS.md §7's claim tightened to say which classes are actually gated.

## 8. What not to do

**Do not adopt ScrollSmoother**, despite it being present and free. It takes
ownership of the scroll container, and this site has a fixed navbar running its
own plain scroll listener that also drives the React state behind the colour swap
(`Navbar.tsx`, per GSAP.md §6.6 — deliberately *not* ScrollTrigger), plus 11
`scrub` triggers and a `fixed`/`inset-0` preloader layer that sits over live
content for three quarters of its life. The interaction surface is large, the
failure mode is a broken navbar or a CLS regression on every page, and the payoff
is a smoothness effect a fair number of visitors actively dislike. Bad
risk-to-reward.

**Do not animate `/admin`.**

**Do not add entrance animation to the hero or the preloader.** Both are
CSS-driven specifically to keep FCP and LCP off the JS bundle (§8). They are not
oversights.

## 9. Open decisions

**9.1 Replay on scroll-back.** All 41 sites use `toggleActions: 'play none none
none'` — reveals fire once and never again, so scrolling back up a page gives
nothing. Replaying would add motion on every upward scroll. That is plausibly
part of what "feels alive" means here, and it is also the most common way a site
becomes irritating to use. Recommend keeping play-once and revisiting once Jobs S
and G are in and can be judged.

**9.2 How much LCP to spend on Job P.** Job P assumes a short,
transform-weighted transition with a non-zero opacity floor. A designed
transition — a blue wipe, a crossfade against the brand band — would read as far
more deliberate and costs meaningfully more. Needs a call once the measurement
from Job P's gate exists.

**9.3 Whether the two legal pages animate at all.** `/privacy-policy` and
`/terms-of-use` hold 2 call sites each, one of them per-clause. Motion on a legal
document is arguably wrong regardless of how good it looks. Recommend T4 stays
minimal or is dropped entirely.

---

*Written 2 September 2026 from a measured sweep of the repo. Nothing in it has
been implemented. When any job lands, record what changed against this document
in the same commit, and update AGENTS.md §7 and `GSAP.md` alongside — §6 and §7
of this document are both about those two files already being out of step with
the code.*
