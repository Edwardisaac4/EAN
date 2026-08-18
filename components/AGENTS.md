# components/ — conventions and the animation system

Read alongside the root `AGENTS.md`.

```
layout/     Navbar · Footer · PublicShell · Preloader
sections/   homepage + page sections (Hero, TrustBar, About, Services, VIP,
            Charter, Partners, Contact, News, Pricing, QuoteCalculator)
shared/     GoldButton · OutlineButton · SectionReveal · StatCounter · Presence
pricing/    quote builder UI
team/ history/ about/   page-specific components
admin/      → see app/admin/AGENTS.md
```

`PublicShell` is a client component that reads `usePathname()` to skip the
Preloader and Footer on `/admin`. Its own module and everything it imports
directly land in the client bundle, so keep it thin. Server components passed
*through* it as `children` are unaffected — they are rendered on the server and
arrive as an already-serialised tree, so wrapping a page in `PublicShell` does
not pull that page into the client bundle.

## Server vs client

Server Components are the default. Add `'use client'` only for React hooks,
GSAP, or browser APIs. `AboutSection`, `VIPSection`, `PartnersStrip` and
`TrustBar` are server components — keep them that way.

## Animation

There is no animation library beyond GSAP. Framer Motion was removed
deliberately; do not reintroduce it or add a replacement.

**GSAP** — scroll-driven work only: parallax, `SectionReveal`, `StatCounter`.
Always `useGSAP` from `@gsap/react`. Register plugins at file level, outside the
component. Never a raw `useEffect` with gsap inside.

**Every GSAP animation must also be wrapped in `withReducedMotion` from
`lib/gsap-motion.ts`, including its second callback.** The
`@media (prefers-reduced-motion)` block in `globals.css` reaches the CSS utility
classes only — it has no effect on a tween. Because these animations tween *from*
`opacity: 0`, omitting the second `settle` callback leaves the content
permanently invisible for those users; that callback is where the final state is
applied directly. See root `AGENTS.md` §7 for the shape.

**CSS keyframes in `app/globals.css`** — everything else:

| Class | Use |
|---|---|
| `ean-rise` (+ `-delay-1..4`) | Hero entrance stagger |
| `ean-enter-fade` / `ean-exit-fade` | Backdrops, simple swaps |
| `ean-enter-up` / `ean-exit-up` | Content swapping on a keyed element |
| `ean-enter-down` / `ean-exit-down` | Mobile menu drawer |
| `ean-enter-dropdown` / `ean-exit-dropdown` | Nav dropdown (centres via translateX) |
| `ean-enter-scale` / `ean-exit-scale` | Small panels, success states |
| `ean-enter-modal` / `ean-exit-modal` | Modal cards |
| `ean-indicator` | The sliding-indicator transition |

**Hover states are CSS.** `hover:-translate-y-1.5` with an explicit
`transition-[…]` listing the properties. Do not animate `all` on a large card.

**`shared/Presence.tsx`** replaces `AnimatePresence` for the single-child case.
It keeps a child mounted for `durationMs` after `show` flips false so a CSS exit
animation can play, and renders **no wrapper element** — the child keeps its own
positioning classes. Pass `durationMs` equal to the CSS animation duration.

```tsx
<Presence show={isOpen} durationMs={350}>
  {(state) => (
    <div className={state === 'open' ? 'ean-enter-modal' : 'ean-exit-modal'}>…</div>
  )}
</Presence>
```

**Accordions / height transitions** use the grid technique —
`grid-rows-[0fr]` → `grid-rows-[1fr]` with an `overflow-hidden` child. It
animates to intrinsic height with no JS measurement. See the FAQ on
`app/contact/page.tsx` and the mobile nav dropdown.

**Sliding indicators** replace framer's `layoutId` morph. One absolutely
positioned element per group, measured via `offsetLeft`/`offsetWidth`, moved by
transform. Requirements, all of which exist for a reason:

- a `ResizeObserver` on the container, so it stays attached while the header
  shrinks on scroll
- `document.fonts.ready` re-measure, because web fonts change item widths
- the transition class withheld until one `requestAnimationFrame` after the
  first measure, so it appears in place instead of gliding in from x=0 on load

`components/layout/Navbar.tsx` is the reference implementation;
`ServicesSection` and `app/blog/page.tsx` follow it.

Every animation respects `prefers-reduced-motion` — the guard is already in
`globals.css`; keep new keyframes inside it.

## Rendering rules that protect performance

**Never gate content behind JS.** No element whose only route to visibility is
a GSAP tween or a class removed on hydration. That pattern pushes FCP and LCP
behind the whole bundle. If an entrance animation is wanted, use a CSS
keyframe, which paints on the first frame.

`StatCounter` shows the pattern: the real figure is in the markup, and JS resets
it to `0` before counting up. Crawlers and no-JS visitors read the true number.

**`priority` on exactly one image per page**, the real above-the-fold LCP. Every
extra one adds a competing preload. Everything else is `loading="lazy"`.

**`quality` must be a value listed in `next.config.ts` → `images.qualities`**
(currently `70`, `75`, `80`). On the declared Next.js version, `next/image`
resolves an unlisted value to the closest entry in that array, so the prop is
silently not what you wrote; a direct request to the optimizer with an
unsupported quality is rejected with an HTTP 400. Add the value to the array
before using it. Use 70 for full-bleed hero art, 80 otherwise.

Descriptive `alt` on every image — never empty, generic, or a filename.

## Component shape

```tsx
'use client'                    // only if genuinely needed

// react → next → third-party → internal (@/…)
// types / interfaces
// constants outside the component
// component
// default export at the bottom
```

Explicit prop interfaces. No `any`. No dead imports. Comment *why*, not *what*.
