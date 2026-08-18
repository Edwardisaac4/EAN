# Content sign-off brief — 8 unverified claims

**Date:** 18 August 2026
**Status:** all eight claims are **live on the production site right now**.
**Ask:** confirm, correct, or withdraw each one. Anything not cleared should come
down before launch.

Each item below gives the exact published wording, where it lives in the
codebase, and what evidence would clear it. Line numbers are as of this date.

---

## C45 — Timeline milestone claims · owner: Okey

All in `lib/constants.ts`, `TIMELINE_EVENTS` (lines 541–776), rendered on
`/history`.

### 45.1 Gulfstream exclusivity — 2013 (highest risk)

> "First **Exclusive** Gulfstream Representative" (title, `:616`)
> "appointed as the first exclusive sales representative for Gulfstream
> Aerospace in West Africa" (`:620`, `:622`)
> "Appointed exclusive Gulfstream Aerospace sales representative in West
> Africa." (`:627`)

An unqualified exclusivity claim about a third party's commercial arrangement,
with no date scoping — no "as of", no end date. If the arrangement has lapsed,
the site is asserting a current exclusivity that does not exist.

**To clear:** the appointment letter or dealer agreement, plus its current
status. If it has ended, the claim needs past tense and a date range.

### 45.2 Airbus Helicopters distributorship — 2021 (second highest)

> "First **Exclusive** Airbus Helicopter **Distributors** in **Africa**" (`:706`)
> "ROTARY-WING **DISTRIBUTORSHIP**" (`:707`)
> "Appointed as **exclusive distributors** for Airbus Helicopters" (`:710`)
> "**exclusive distributor** for Airbus Helicopters in **West Africa**" (`:712`)
> "factory warranties" (`:714`)
> "**Exclusive** Airbus Helicopters **dealership** for West Africa." (`:717`)

Four separate problems:

1. **The territory contradicts itself** — the title says *Africa*, the body says
   *West Africa*.
2. **Three different words for the relationship** — "distributor", "dealership",
   and (at `:1154`, in a team bio) "**authorized** Airbus Helicopters
   distributor". These are not interchangeable in OEM contracts.
3. **"Factory warranties"** asserts a contractual commitment on Airbus's behalf.
4. `lib/seo.ts:127` repeats "an Airbus Helicopters distributorship" in the
   `/history` page meta description, so it reaches search results too.

**To clear:** the distribution agreement, the exact territory, the correct legal
term, and confirmation that EAN may state warranty terms on Airbus's behalf.

### 45.3 NATA Safety 1st — 2016

> "first FBO in Africa to be featured on the National Air Transportation
> Association (NATA) Safety 1st Map" (`:652`, `:656`, `:658`, `:663`)
> "**zero-accident** safety culture" (`:659`)

NATA Safety 1st is a **lapsing registration**, not a permanent award; nothing in
the copy scopes it to a period. And "zero-accident" is the same category of
absolute claim that was already removed from the homepage and the History
metrics strip — it survived here because it sits inside body prose.

**To clear:** current registration status with dates. **The "zero-accident"
phrase should come out regardless** — it cannot be substantiated and is
falsified by a single event.

### 45.4 IS-BAO Stage 2 — 2019, and the missing IS-BAH

> "**achieved** IS-BAO Stage 2 certification" (`:688`, `:692`, `:694`, `:699`)

But `lib/constants.ts:344` hedges the same standard to "IS-BAO Stage II
**Aligned**", and `components/sections/QuoteCalculator.tsx:1155` says "operating
under NCAA and IS-BAO international aviation standards". **"Achieved",
"aligned" and "operating under" are three different assertions** about the same
registration, published simultaneously.

Separately: **IS-BAH appears nowhere in the timeline.** Its only mention on the
site is a team bio (`:1089`). IS-BAH is the *ground handling* standard — the one
an FBO would normally cite — while IS-BAO covers *flight operations*. Worth
confirming which one EAN actually holds.

**To clear:** the IS-BAO registration certificate and stage, and whether IS-BAH
is held. Then one wording, used everywhere.

### 45.5 Heliconia JV — 2023 · 45.6 Archer / Banyan — 2024

Heliconia named at `:724`, `:728`, `:730`, `:731`, `:735`. Archer and Banyan at
`:742`, `:746`, `:748`, `:749`, `:754`.

Archer Aviation is a publicly listed US company (NYSE: ACHR). "Partnered with
Archer Aviation to introduce eVTOL" asserts considerably more than a memorandum
of understanding would support.

**To clear:** confirm each arrangement is live, the partner names and branding
are correct, and that naming them publicly is permitted under the agreements.

---

## C50 — Published service levels · owner: Okey

`lib/constants.ts:521`, rendered in the FAQ accordion on `/contact`:

> "For domestic flights within Nigeria, we can coordinate departures in **4 to 6
> hours**. For international routes, we recommend **24 to 48 hours** to secure
> optimal slots, clearances, and custom approvals."

The known constraint: **the CAA permit desk runs 0800–1500Z weekdays only.** A
4–6 hour domestic commitment cannot hold for a Friday-evening or weekend
request, and the copy carries no such caveat.

Two further commitments in the same class, not on the original audit list:

| Where | Claim |
|---|---|
| `app/contact/page.tsx:549` | Post-submission success panel: "will review your parameters and follow up **within 2 hours**" |
| `lib/services/lead-notifications.ts:110` | Internal lead email: "Urgent leads require response **within 1 hour**" |

**To clear:** confirm each number, or supply the correct ones with the operating
-hours caveat attached. Anything not confirmed comes out.

---

## C24 — Pricing portal · owner: Vivian

The published rate card is `lib/pricing/bands.ts`, rendered on `/pricing`.

**Currently published (all USD unless stated):**

| Item | Rate |
|---|---|
| Lagos ground handling, Band A ≤5,700 kg | 850 floor / 1,200 standard |
| Band B 5,701–15,000 kg | 1,200 / 1,600 |
| Band C 15,001–30,000 kg | 1,600 / 2,400 |
| Band D 30,001–80,000 kg | 2,400 / 3,200 |
| Band E >80,000 kg | 4,500 flat |
| Abuja handling | 850 flat |
| International terminal fee | 850 |
| CIQ | 350 |
| Overnight parking | 100 / night |
| Passenger service charge | 35 intl · ₦8,500 domestic |
| VIP lounge, local operators | ₦85,000 |
| Jet A-1 fuel | Platts-based daily rate + **15% disbursement fee** |

Plus 15 add-ons at `bands.ts:62-77` (CIQ 600, apron parking 200, hangarage 300,
external wash 900 intl / 450 local, interior clean 150, toilet 150, water 150,
towing 250, GPU 100, pushback 100, baggage 100 per 10 bags, crew transfer 500,
laundry 50, ambulance pass 250).

**Three things to resolve:**

1. **Missing entirely** — there is **no landing permit fee and no supervisory
   fee** anywhere in the app. Neither term appears in the codebase. If dispatch
   quotes them, the portal is under-quoting every client.
2. **CIQ is priced twice** — `CIQ_USD = 350` (`bands.ts:47`) against a `ciq`
   add-on at **600** (`:63`). `lib/pricing/calculations.ts:58-60` charges the 350
   only when the 600 add-on is *not* selected, so the same service quotes at two
   different prices depending on the path a client takes through the form. One
   of these numbers is wrong.
3. **Reconciliation** — every figure above needs to match what schedule dispatch
   actually quotes.

**To clear:** Vivian's approval of the full table, the two missing fees, and a
decision on the CIQ price.

---

## C28 — CFO academic credentials · owner: unassigned

`lib/constants.ts`, Ahmed Kazeem (`:1122`):

> "Harvard Business School & MIT Alumnus" (credential badge, `:1137`)
> "His academic pedigree spans top institutions: Ahmadu Bello University,
> University of Lagos, Harvard Business School, MIT, and the New York Institute
> of Finance…" (`:1132`)

"Alumnus" of Harvard Business School and MIT is a specific, checkable claim. An
executive-education certificate is not the same thing as a degree, and stating
it as alumnus status is the kind of error that gets picked up publicly.

**Also not on the audit list:** `:1044` publishes "**PMI & MIT Certified**" on a
different team member. Same evidence standard applies.

**To clear:** documentary evidence for both — the programme name, the year, and
the credential type awarded.

---

## C29 — CEO memberships · owner: unassigned

`lib/constants.ts:857`, Segun Demuren (CEO, `:839`):

> "NBAA & AfBAA Member"

AfBAA is corroborated by EAN's own 2012 co-founding entry in the timeline. **NBAA
is not corroborated anywhere**, and membership is annual — it lapses.

**To clear:** confirm both memberships are current for 2026.

---

## C39 — NDPA consent on forms · owner: unassigned

**The policies themselves are fine.** Both pages exist with real, Nigeria-specific
NDPA 2023 text: `lib/legal-constants.ts` (586 lines — 13 privacy sections, 17
terms sections), `app/privacy-policy/page.tsx` (752 lines, including a working
data-subject-request form), `app/terms-of-use/page.tsx` (735 lines). Footer links
are correct. Nine NDPA data-subject rights are enumerated, the NDPC complaint
route is named, and a 30-day DSAR response is committed to.

**The gap is at the point of collection. Not one form in the app carries a
consent checkbox** — four of them collect name, email and phone and write to the
database plus an email alert:

| Form | File |
|---|---|
| Main contact / inquiry | `app/contact/page.tsx:347` |
| Pricing lead gate | `components/pricing/LeadGate.tsx:141` |
| Data-subject request | `app/privacy-policy/page.tsx:645` |
| Legal notice | `app/terms-of-use/page.tsx:637` |

The policy at `legal-constants.ts:30` leans on implied consent ("given by you
through your continuous use of the Services and the Sites") while naming
"ticking a consent box" as the standard mechanism — which the forms do not
implement.

**Two more gaps found while checking:**

1. **No cookie banner anywhere**, and no footer link to the Cookies Policy
   section that already exists at `legal-constants.ts:238`.
2. **The newsletter form collects an email and discards it.**
   `app/blog/page.tsx:408` — `handleSubscribe` (`:134`) is a 1.5-second
   `setTimeout` followed by a success message (`:147-151`, `:453`). Nothing is
   stored and nothing is sent. A form that takes an email address, throws it
   away, and tells the user "Subscription successful" is a worse problem than
   the missing checkbox.

**To clear:** a decision on consent wording, then a checkbox plus an inline
privacy-notice link on all four lead forms — and either wire up or remove the
newsletter form.

---

## C41 — Partner logos · owner: unassigned

`lib/constants.ts:278-290`, rendered by `components/sections/PartnersStrip.tsx`
on the homepage under the heading **"Trusted By Industry Leaders & Global
Aviation Partners"**.

Eleven logos. **Four are named; seven are not:**

| Named | Unnamed — alt text is a placeholder |
|---|---|
| NACC · NCBA · NGCC · CFN Aviation | `cc1.jpg` – `cc7.jpg`, published as "Corporate Partner 1" … "Corporate Partner 7" |

The placeholder strings are used directly as the `alt` attribute
(`PartnersStrip.tsx:30`), so a screen-reader user hears "Corporate Partner 4"
and the "Trusted By" claim cannot be verified from the markup by anyone.

**Also:** `PartnersStrip.tsx:6` duplicates the array for the marquee loop, so 22
images render and **every alt string is announced twice**, with no `aria-hidden`
on the duplicate set.

**To clear:** name each of the seven and confirm the relationship is real and
current, or cut them. Note that "Trusted By" over a membership logo is a
different claim from "Trusted By" over a client logo — confirm which each one is.

---

## C47 — Phone numbers · owner: unassigned

The audit found two numbers. **There are four**, and three of them are visible
on `/contact` at the same time.

| Number | Where | Notes |
|---|---|---|
| **+234 (0) 1 460 7310** | `lib/constants.ts:532` (`LAGOS_HQ`), `app/global-error.tsx:76-77` | Shown in the contact page body. **The only number that reaches the LocalBusiness structured data** search engines read |
| **+234 (0) 805 033 3410** | `components/layout/Footer.tsx:109,231`, `app/services/[slug]/page.tsx:236-240` | In the footer of every page, so it appears on `/contact` too |
| **+234 (0) 1295 0960** | `lib/legal-constants.ts:578`, `app/privacy-policy/page.tsx:588`, `app/terms-of-use/page.tsx:580` | The DPO / legal line |
| **+234 1 291 1000** | `components/pricing/QuoteActions.tsx:71` | Printed into every quote document emailed to a client |

**Plus a fake number in a publishable template:** `lib/blog-templates.ts:99`
carries "+234 (0) 1 234 5678" in the press-release starter. Any post authored
from that template ships the invented number unless the author notices. The same
template also pre-fills "100% On-Time Departure" and "Flawless Client
Satisfaction" (`:178-180`).

**To clear:** decide the single public number, which one is the DPO line, and
which belongs on quotes. Then `LAGOS_HQ.phone` should be the single source —
`app/global-error.tsx` and `QuoteActions.tsx` currently hardcode their own.

---

## Related items already fixed — no action needed

For completeness, four audit items were already resolved in the codebase before
this pass:

- **C6** — the homepage "100% Flight Safety Record" stat is now "24/7 ·
  Operations, Lagos & Abuja".
- **C19** — the History metrics strip now reads "NCAA · Licensed & Audited —
  ICAO Standards".
- **C32** — `/charter` was never linked; all charter CTAs go to
  `/contact?service=charter`. The hero buttons were ignoring their configured
  destinations entirely; that was fixed in this pass.
- **C38** — the placeholder blog posts were removed. Three real migrated
  articles remain.

**Fixed in this pass:** C62 (the Hangar Manager is Alexey "Alyosha" Saliu-Lawal)
and C20 ("Nigeria's first", now consistent across all eight live locations).

**Still open, needs a decision rather than evidence:** C44, the founding year.
The timeline runs 2009 → 2010 → 2011. Dating the founding to 2011 would put the
2010 Wings™ catering launch before the company existed, and 2011 already holds
the NCAA AMO milestone. Either the early milestone dates need correcting, or
2009 is the operational founding and 2011 means something else.

---

## Four unverified claims that were not on the audit list

Same category as C6 and C19 — absolute figures with no citable basis. All four
render on `/team`:

| Claim | Location |
|---|---|
| "Fueling Operational Audits: **100% Passed**" | `lib/constants.ts:887` |
| "Operational Safety Audit Score: **100%**" | `lib/constants.ts:1047` |
| "Governance Compliance: **100%**" | `lib/constants.ts:1073` |
| "Ramp Safety Record: **100%**" | `lib/constants.ts:1185` |

And one in a published article: `lib/blog-content.ts:293-295` states "3.5 hours"
average time lost per commercial flight, "40%" of high-net-worth individuals
preferring private aviation, and "200+" airports served — **with no sources**.
This is the same failure mode that got the six placeholder posts deleted.
