# Blog photography — source resolution audit

Every image in this folder is served through `next/image`. **The optimizer never
upscales.** A request for `w=1664` against a 624px-wide file returns 624px, with
no error and no warning — the browser then stretches it to fill the box. That is
the single largest cause of a soft-looking blog page, and no `quality`, `sizes`
or `formats` change in `next.config.ts` can fix it. Only re-exporting the asset
can.

## How the target widths are derived

Two layouts consume these files.

**Covers** — `ARTICLES_DATABASE[].image` in `lib/constants.ts`. Each cover is
used twice:

- the article-card grid on `/blog`, at 365–381 CSS px, and
- the article hero on `/blog/[slug]`, at **832 CSS px x 420** (`max-w-4xl`
  minus `px-8`, height `sm:h-105`).

The hero is the binding one, and `object-cover` crops there, so both axes
matter: **1664x840** for a 2x screen.

**Body images** — the `image` blocks in `lib/blog-content.ts`. These render
intrinsically at the full **896 CSS px** article column with no crop, so only
width binds: **1792 wide** for a 2x screen.

Both targets are 2x. A 3x phone is not the case to design for — those viewports
are narrow, so the CSS box is small and the pixel demand is lower than desktop
2x.

## Undersized — needs re-export (21 of 32)

| File | Role | Current | Needed at 2x | Shortfall |
| --- | --- | --- | --- | --- |
| `business-aviation-acquisition.jpg` | body | 916x572 (60 KB) | 1792 wide | 2.0x |
| `business-aviation-definition.jpg` | cover | 1248x832 (106 KB) | 1664x840 | 1.3x |
| `business-aviation-falcon-tow.jpg` | body | 1364x768 (154 KB) | 1792 wide | 1.3x |
| `business-aviation-hangar.jpg` | body | 873x582 (73 KB) | 1792 wide | 2.1x |
| `business-aviation-who-it-fits.jpg` | body | 1364x768 (183 KB) | 1792 wide | 1.3x |
| `ciq-guest-entrance.jpg` | body | 1408x768 (195 KB) | 1792 wide | 1.3x |
| `ciq-passport-desk.jpg` | body | 1408x768 (200 KB) | 1792 wide | 1.3x |
| `ciq-passport-review.jpg` | body | 1408x768 (209 KB) | 1792 wide | 1.3x |
| `ciq-process.jpg` | body | 1408x768 (210 KB) | 1792 wide | 1.3x |
| `ciq-vip-process.jpg` | body | 896x421 (89 KB) | 1792 wide | 2.0x |
| `fbo-first-class-comparison.jpg` | body | 1024x559 (169 KB) | 1792 wide | 1.8x |
| `fbo-ground-handling.jpg` | body | 1408x768 (184 KB) | 1792 wide | 1.3x |
| `ownership-decision.jpg` | body | 624x468 (67 KB) | 1792 wide | 2.9x |
| `ownership-fractional.jpg` | body | 624x416 (43 KB) | 1792 wide | 2.9x |
| `ownership-opening.jpg` | body | 624x416 (35 KB) | 1792 wide | 2.9x |
| `ownership-west-africa.jpg` | body | 624x351 (62 KB) | 1792 wide | 2.9x |
| `ownership-whole.jpg` | cover | 624x416 (37 KB) | 1664x840 | 2.7x |
| `safety-innovations.jpg` | cover | 1600x649 (224 KB) | 1664x840 | 1.3x |
| `tayo-aiyetan-collaboration.jpg` | body | 1512x1080 (358 KB) | 1792 wide | 1.2x |
| `tayo-aiyetan-private-jet.jpg` | body | 810x516 (77 KB) | 1792 wide | 2.2x |
| `tayo-aiyetan-tribute.jpg` | body | 1620x1080 (179 KB) | 1792 wide | 1.1x |

`ownership-*.jpg` is the worst set: at 624px wide these are below 1x for the
832px hero box, so the fractional-ownership article is upscaling its cover even
on a non-Retina laptop. `ownership-whole.jpg` is now the only undersized file
that is also an article cover, which means it is soft in the card grid *and* in
the hero. `ciq-passenger-arrival.jpg` used to be the other; it is no longer a
cover — see the note under Adequate.

`safety-innovations.jpg` is the one to read carefully: 1600px wide is nearly
enough, but at 649px tall it is well short on the vertical axis, and
`object-cover` on a 1.98:1 box scales to the *height*. Width alone is not the
test for a cover.

## Adequate — leave alone / no longer used (11 of 32)

| File | Role | Current | Needed at 2x | Shortfall |
| --- | --- | --- | --- | --- |
| `africa-growth-cover.jpg` | cover | 1920x1047 (262 KB) | 1664x840 | — |
| `africa-growth-tourism.jpg` | body | 1920x1192 (178 KB) | 1792 wide | — |
| `business-aviation-brake-shop.jpg` | body | 1920x1080 (279 KB) | 1792 wide | — |
| `business-aviation-operations-desk.jpg` | body | 1920x1080 (275 KB) | 1792 wide | — |
| `business-aviation-vip-lounge.jpg` | body | 1920x1440 (402 KB) | 1792 wide | — |
| `ciq-fbo-lounge.jpg` | cover | 1920x895 (232 KB) | 1664x840 | — |
| `ciq-passenger-arrival.jpg` | unused | 933x768 (127 KB) | — | — |
| `fbo-hondajet-departure.jpg` | unused | 1920x1047 (267 KB) | — | — |
| `fbo-hondajet-experience.jpg` | body | 1920x1047 (210 KB) | 1792 wide | — |
| `fbo-ramp-turnaround.jpg` | cover | 1920x1080 (232 KB) | 1664x840 | — |
| `tayo-aiyetan-cover.jpg` | cover | 1920x1029 (167 KB) | 1664x840 | — |

Two covers were swapped for real EAN photography in September 2026, because the
files they replaced were generated images: the CIQ article now leads with
`ciq-fbo-lounge.jpg` (the MMIA lounge, copied from `/images/vip-lounge.jpg`) and
the first-class comparison with `fbo-ramp-turnaround.jpg` (the ramp shot the FBO
service page leads with, copied from
`/images/services/fbo-ground-handling.jpg`). Both are copies, not references —
every cover belongs in this folder so this audit stays complete.

`ciq-passenger-arrival.jpg` and `fbo-hondajet-departure.jpg` are left in place
but are now referenced by nothing. Do not re-export them; delete them if the
generated-imagery sweep reaches the body images too.

## Re-export settings

- **Covers:** at least 1700x900. 1920x1080 is the convenient stop and is what
  the adequate files already use.
- **Body images:** at least 1800 wide. Keep the native aspect ratio — the
  renderer in `components/blog/ArticleBody.tsx` sizes intrinsically and does not
  crop, which is deliberate (these came from WordPress at ratios from 4:3 to
  panoramic).
- **JPEG quality 85-90, no chroma subsampling** if the tool exposes it. The file
  here is a master that `next/image` re-encodes to AVIF/WebP; a source that is
  already compressed twice compounds. Do not hand-optimise these for size.
- **Progressive/baseline is irrelevant** — nothing ships this file to a browser.

## Two things to update alongside a re-export

1. `lib/blog-content.ts` carries a literal `width`/`height` for every body
   image, and they currently match the files exactly. Change the file, change
   the pair, or the intrinsic layout ratio goes wrong.
2. `next.config.ts` -> `images.deviceSizes` stops at `1920`, with a comment
   saying no source is wider than that. If a re-export goes past 1920, add
   `2560` — otherwise the extra source pixels are never requested and the
   re-export buys nothing.

## Filename rule

**Never put a comma in a filename here.** The optimizer rejects it with "The
requested resource isn't a valid image." Spaces and parentheses are fine.
