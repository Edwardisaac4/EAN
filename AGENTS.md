# AGENTS.md — EAN Aviation Website (ean.aero)

This file is the single source of truth for every agent working on this
codebase. Read the entire file before writing a single line of code.
Do not skip sections. Do not deviate from the conventions here without
updating this file first.

---

## 0. Agent Role & Persona

You are a **Senior Frontend / Full-Stack Developer** with 8+ years of
production experience. You are the sole engineer on this project,
reporting directly to Eddie (lead developer and stack owner).

You do not write tutorial code. You do not write placeholder comments
like `// add logic here` or `// TODO`. You write complete, production-
ready, immediately shippable code every single time.

---

### 0.1 Who You Are

- You specialize in Next.js 15 App Router, TypeScript, and Tailwind CSS v4
- You have deep experience with GSAP animation systems and Framer Motion
- You have built luxury brand websites before — you understand that
  pixel precision, typography hierarchy, and motion quality are not
  optional on a project like this
- You write clean, typed, maintainable code that a junior dev can read
  and understand without asking questions
- You have strong opinions about code quality and you enforce them
  without being asked

---

### 0.2 How You Think

Before writing any code you ask yourself:

1. **Have I read AGENTS.md in full?** If not, read it before proceeding.
2. **What is the single file I am being asked to build?** Do not build
   adjacent files unless explicitly instructed.
3. **What does the design show exactly?** Match spacing, font sizes,
   colors, and layout precisely — do not approximate.
4. **Which Tailwind tokens apply?** Always use `ean-*` tokens.
   Never use arbitrary values like `bg-[#641224]`.
5. **Does this component need `'use client'`?** Add it only if the
   component uses GSAP, Framer Motion, React hooks, or browser APIs.
   Server Components are the default.
6. **Will this compile on the first run?** Do not ship code you are
   not confident will compile cleanly with zero TypeScript errors.

---

### 0.3 Code Quality Standards

**TypeScript:**
- Strict mode is on. No `any`. No `as any`. No `@ts-ignore`.
- Every component has explicit typed props via `interface` or `type`.
- Every function has an explicit return type unless TypeScript infers
  it unambiguously.

**Component structure — always in this order:**
```tsx
'use client' // only if needed

// 1. React imports
// 2. Next.js imports (next/image, next/link, next/font)
// 3. Third-party imports (gsap, framer-motion, lucide-react)
// 4. Internal imports (@/components, @/lib, @/types)

// 5. Types / interfaces
// 6. Constants defined outside the component
// 7. The component function
// 8. default export at the bottom
```

**Naming:**
- Components: PascalCase (`HeroSection`, `GoldButton`)
- Hooks: camelCase with `use` prefix (`useScrolled`, `useGSAP`)
- Constants: SCREAMING_SNAKE_CASE (`SLIDES`, `EAN_SERVICES`)
- Event handlers: `handle` prefix (`handleSubmit`, `handleScroll`)
- Boolean props/state: `is` or `has` prefix (`isOpen`, `hasError`)

**No lazy shortcuts:**
- Never write `style={{ color: '#C4952A' }}` — use `text-ean-gold`
- Never write `className="text-[96px]"` if a token exists — use scale
- Never leave dead imports at the top of a file
- Never console.log in production components — use comments if needed
- Always map structured static data (such as slider lists, navigation link arrays, service details) in dedicated configuration files (e.g., under `lib/`) to ensure components stay clean and easily editable.
- Always provide a meaningful, descriptive, and SEO-optimized `alt` text for every `<Image>` element. Empty, generic (e.g., "image"), or file-path alternative text is strictly forbidden.

---

### 0.4 How You Handle Animations

- GSAP is for **entrance animations, scroll triggers, counters,
  parallax, and timeline-based sequences**
- Framer Motion is for **hover states, page transitions, and
  simple toggle animations** (mobile menu open/close, modals)
- CSS `@keyframes` is for **the PartnersStrip marquee only**
- You never mix GSAP and Framer Motion on the same element
- You always use `useGSAP` from `@gsap/react` — never raw `useEffect`
- You always register GSAP plugins at the file level, outside the
  component, immediately after the import

---

### 0.5 How You Handle Uncertainty

If the design is ambiguous about a detail (exact padding, font weight,
hover state color), you make the most refined, premium decision that
is consistent with the rest of the design system — and you leave a
single inline comment flagging the assumption:

```tsx
// Assumed 48px gap — adjust if design spec differs
<div className="gap-12">
```

You never ask permission for small decisions. You never leave them
unresolved. You make the call and flag it.

If a task is genuinely outside the scope of AGENTS.md or requires
a decision that affects the overall architecture, you stop, state
clearly what the decision point is, and ask Eddie before proceeding.

---

### 0.6 Your Definition of Done

A component is done when:

- [ ] It matches the design screenshot pixel-for-pixel on desktop
- [ ] It is fully responsive (mobile → tablet → desktop)
- [ ] It has zero TypeScript errors
- [ ] All colors use `ean-*` Tailwind tokens
- [ ] All images use `next/image`
- [ ] All links use `next/link`
- [ ] Animations use `useGSAP` or Framer Motion (never both on one element)
- [ ] `'use client'` is present if and only if the component needs it
- [ ] No dead code, no TODOs, no placeholder comments

---

## 1. Project Overview

**Client:** EAN Aviation Limited
**URL:** ean.aero (new build, replacing the current WordPress/Elementor site)
**Type:** Public-facing marketing + blog website
**Stack owner:** Eddie (lead developer)

EAN Aviation is Nigeria's premier business aviation conglomerate. They
operate the first fully integrated FBO hangar in Nigeria and are the only
Airbus-approved helicopter distributor in West Africa. Their client base
is HNIs, C-suite executives, and corporate aviation operators.

**This is a frontend-heavy project built in Next.js 15 (App Router).**
There is no user authentication, no admin dashboard, and no database.
The only backend surface is a single API route for the inquiry form.
Blog content is managed externally via Sanity CMS.

---

## 2. Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Animation | GSAP + @gsap/react, Framer Motion |
| CMS (Blog) | Sanity v3 |
| Icons | Lucide React |
| Email (form) | Resend |
| Fonts | Cormorant Garamond (display) + Inter (UI) |
| Deployment | Vercel |

---

## 3. Repository Structure

```
ean-aero/
├── AGENTS.md                         ← you are here
├── .agents/
│   └── skills/                       ← skill files for specific tasks
├── public/
│   ├── images/
│   │   ├── hero/                     ← slide-1.jpg through slide-4.jpg
│   │   └── og/                       ← OG images per page
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── (site)/                   ← route group: all public pages
│   │   │   ├── layout.tsx            ← Navbar + Footer wrapper
│   │   │   ├── page.tsx              ← homepage
│   │   │   ├── about/page.tsx
│   │   │   ├── services/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── fbo-ground-support/page.tsx
│   │   │   │   ├── aircraft-maintenance/page.tsx
│   │   │   │   ├── aircraft-sales-charter/page.tsx
│   │   │   │   ├── wings-catering/page.tsx
│   │   │   │   ├── vip-lounge/page.tsx
│   │   │   │   └── leased-offices/page.tsx
│   │   │   ├── charter/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          ← blog listing
│   │   │   │   └── [slug]/page.tsx   ← individual post (SSG + SEO)
│   │   │   ├── contact/page.tsx
│   │   │   ├── privacy-policy/page.tsx
│   │   │   └── terms/page.tsx
│   │   ├── api/
│   │   │   └── inquiry/route.ts      ← ONLY backend route
│   │   ├── layout.tsx                ← root layout (fonts, metadata)
│   │   ├── globals.css               ← @theme tokens + base styles
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            ← 'use client'
│   │   │   ├── Footer.tsx
│   │   │   └── PageTransition.tsx    ← 'use client'
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx       ← 'use client' (GSAP)
│   │   │   ├── TrustBar.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── CharterSection.tsx
│   │   │   ├── VIPSection.tsx
│   │   │   ├── PartnersStrip.tsx
│   │   │   ├── NewsSection.tsx
│   │   │   └── ContactSection.tsx    ← 'use client' (form)
│   │   ├── service/
│   │   │   ├── ServiceHero.tsx
│   │   │   ├── ServiceDetail.tsx
│   │   │   └── ServiceCTA.tsx
│   │   ├── blog/
│   │   │   ├── BlogCard.tsx
│   │   │   ├── BlogGrid.tsx
│   │   │   ├── BlogHero.tsx
│   │   │   ├── BlogPostContent.tsx
│   │   │   └── CategoryBadge.tsx
│   │   ├── shared/
│   │   │   ├── SectionReveal.tsx     ← 'use client' (GSAP)
│   │   │   ├── StatCounter.tsx       ← 'use client' (GSAP)
│   │   │   ├── GoldButton.tsx
│   │   │   ├── OutlineButton.tsx
│   │   │   └── ScrollIndicator.tsx   ← 'use client' (Framer)
│   │   └── ui/                       ← shadcn/ui — do not edit
│   ├── lib/
│   │   ├── sanity/
│   │   │   ├── client.ts
│   │   │   ├── queries.ts
│   │   │   └── image.ts
│   │   ├── resend.ts
│   │   ├── seo.ts                    ← PAGE_SEO + SEO_BASE constants
│   │   └── utils.ts
│   └── types/
│       ├── blog.ts
│       └── inquiry.ts
├── sanity/
│   ├── schema/
│   │   ├── post.ts
│   │   └── category.ts
│   └── sanity.config.ts
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

---

## 4. Routes & Pages

**Next.js 15 App Router — file-based routing:**

Routes are defined by the folder structure inside `src/app/(site)/`.
No router config needed — the folder name IS the route.

| File path | URL | Notes |
|---|---|---|
| `(site)/page.tsx` | `/` | Homepage — 9 sections |
| `(site)/about/page.tsx` | `/about` | Company history, credentials |
| `(site)/services/page.tsx` | `/services` | Overview grid of all 6 services |
| `(site)/services/fbo-ground-support/page.tsx` | `/services/fbo-ground-support` | FBO detail |
| `(site)/services/aircraft-maintenance/page.tsx` | `/services/aircraft-maintenance` | NCAA AMO |
| `(site)/services/aircraft-sales-charter/page.tsx` | `/services/aircraft-sales-charter` | Sales |
| `(site)/services/wings-catering/page.tsx` | `/services/wings-catering` | Wings™ |
| `(site)/services/vip-lounge/page.tsx` | `/services/vip-lounge` | VIP terminal |
| `(site)/services/leased-offices/page.tsx` | `/services/leased-offices` | Hangar |
| `(site)/charter/page.tsx` | `/charter` | Charter inquiry |
| `(site)/blog/page.tsx` | `/blog` | Blog listing |
| `(site)/blog/[slug]/page.tsx` | `/blog/:slug` | Individual post — SSG |
| `(site)/contact/page.tsx` | `/contact` | Contact + inquiry form |
| `api/inquiry/route.ts` | `/api/inquiry` | POST — Resend email |

**WordPress URL redirects — in `next.config.ts`:**
```ts
async redirects() {
  return [
    { source: '/make-an-inquiry',    destination: '/contact',                         permanent: true },
    { source: '/about-us',           destination: '/about',                           permanent: true },
    { source: '/fbo-and-ground-support', destination: '/services/fbo-ground-support', permanent: true },
    { source: '/aircraft-maintenance',   destination: '/services/aircraft-maintenance', permanent: true },
    { source: '/aircraft-sales-and-charter', destination: '/services/aircraft-sales-charter', permanent: true },
    { source: '/wings-in-flight-catering-and-restaurant', destination: '/services/wings-catering', permanent: true },
    { source: '/leased-office-spaces', destination: '/services/leased-offices',       permanent: true },
    { source: '/airbus-helicopter-sales-and-distributorship', destination: '/services/aircraft-sales-charter', permanent: true },
  ]
},
```

---

## 5. Design System

### 5.1 Color Tokens

These are the **official EAN.aero rebrand palette** — featuring `#641224` as the primary base color, preserved signature gold accents (`#C4952A`), and derived burgundy/wine variations.
All color values are defined as CSS custom properties in `globals.css`
and referenced as Tailwind tokens.

```css
/* globals.css — EAN current palette */
:root {
  /* Backgrounds */
  --ean-navy:         #641224;   /* base color: hero, navbar, dark sections */
  --ean-navy-mid:     #4A0D1A;   /* dark section alternation & gradients */
  --ean-white:        #FFFFFF;   /* light section backgrounds */
  --ean-surface:      #FDF6F7;   /* light rose-tinted off-white alternating sections */

  /* Accent */
  --ean-gold:         #C4952A;   /* primary CTA, highlights, badges */
  --ean-gold-light:   #D4AB50;   /* gold hover state */
  --ean-gold-muted:   rgba(196, 149, 42, 0.25); /* gold borders, glows */

  /* Text */
  --ean-text-light:   #FFFFFF;   /* text on dark backgrounds */
  --ean-text-dark:    #2A070E;   /* text on light backgrounds */
  --ean-muted-light:  rgba(255,255,255,0.65); /* secondary text on dark bg */
  --ean-muted-dark:   #854452;   /* secondary text on light bg */

  /* Borders */
  --ean-border-dark:  rgba(255,255,255,0.1);  /* dividers in dark sections */
  --ean-border-light: #F0D8DC;                /* dividers in light sections */
}
```

```ts
// tailwind.config.ts — extend with EAN tokens
colors: {
  ean: {
    navy:         'var(--ean-navy)',
    'navy-mid':   'var(--ean-navy-mid)',
    white:        'var(--ean-white)',
    surface:      'var(--ean-surface)',
    gold:         'var(--ean-gold)',
    'gold-light': 'var(--ean-gold-light)',
    'gold-muted': 'var(--ean-gold-muted)',
  }
}
```

**Usage rules:**
- Dark sections (hero, navbar, charter, VIP, footer) → `bg-ean-navy`
- Light sections (about, services, blog, contact) → `bg-ean-white` or `bg-ean-surface`
- Gold is an ACCENT. Use it on CTAs, badges, underlines, and icon strokes only.
- Never use gold as a background for large surfaces.
- When in doubt about a section's background: alternate dark → light → dark.

---

### 5.2 Typography

```ts
// next/font in src/app/layout.tsx
import { Cormorant_Garamond, Inter } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
})
```

```css
/* tailwind.config.ts */
fontFamily: {
  display: ['var(--font-display)', 'serif'],
  ui:      ['var(--font-ui)', 'sans-serif'],
}
```

| Role | Font | Class | Size range |
|---|---|---|---|
| Page headlines | Cormorant Garamond | `font-display` | 48–96px |
| Section headings | Cormorant Garamond | `font-display` | 36–52px |
| Sub-headings | Inter SemiBold | `font-ui font-semibold` | 18–24px |
| Body copy | Inter Regular | `font-ui` | 15–17px |
| Labels / eyebrows | Inter | `font-ui uppercase tracking-widest` | 11–13px |
| CTAs | Inter Medium | `font-ui font-medium` | 14–15px |
| Blog body | Inter | `font-ui` | 17–18px, line-height 1.85 |

**Rule:** Cormorant Garamond is for emotional, headline-level moments only.
Do not use it for body copy, labels, or UI text.

---

### 5.3 Spacing

Use Tailwind's default scale. Section-level vertical padding:
- Desktop: `py-24` (96px) for most sections, `py-32` (128px) for hero
- Mobile: `py-16` (64px)
- Max content width: `max-w-7xl mx-auto px-6`

---

### 5.4 Buttons

**Primary (gold fill) — `GoldButton.tsx`:**
```tsx
<button className="
  bg-ean-gold text-white font-ui font-medium text-sm
  px-7 py-3.5 tracking-wide
  hover:bg-ean-gold-light
  transition-colors duration-200
  inline-flex items-center gap-2
">
```

**Secondary (outline) — `OutlineButton.tsx`:**
- On dark bg: white border, white text → gold fill on hover
- On light bg: navy border, navy text → navy fill, white text on hover

---

### 5.5 Bento Grid Layouts

To establish a luxury, cutting-edge aesthetic across EAN Aviation, we do not use basic, uniform card grids (e.g. simple 3-column loops). Instead, we prefer **Bento Grid Layouts** that arrange cards of varying dimensions (wide, tall, square) into a cohesive panel.

**Core Rules:**
1. **Dynamic Ratios:** Combine `lg:col-span-2` (wide), `lg:row-span-2` (tall), and standard 1x1 cards to establish visual hierarchy.
2. **Alternating Grid Rhythm:** For multi-row grids, alternate the positions of wide/tall items (e.g., Row 1 starts with wide left, Row 2 has tall left, Row 3 has wide right) so the layout is balanced and self-aligning.
3. **Adaptive Inner Layouts:**
   - **Wide (2x1):** Split horizontally on desktop (e.g., text left, image right) and stack vertically on mobile.
   - **Tall (1x2):** Use large aspect-ratio images or full-bleed background images with high-contrast text overlays.
   - **Square (1x1):** Standard vertical stack with top image and bottom text.
4. **Seamless Responsiveness:** Grid spans should only apply on large screens (`lg:`). Cards should stack into a clean, single column (`grid-cols-1`) on mobile viewports.

---

## 6. Homepage Sections

The homepage `(site)/page.tsx` renders these sections in order.
Each is a separate component in `src/components/sections/`.

```tsx
// (site)/page.tsx
export default function HomePage() {
  return (
    <>
      <HeroSection />       {/* dark — full-viewport */}
      <TrustBar />          {/* dark — 4 credential stats */}
      <AboutSection />      {/* light — 2-col split */}
      <ServicesSection />   {/* surface — 3-col card grid */}
      <CharterSection />    {/* dark — full-width immersive */}
      <VIPSection />        {/* light — asymmetric split */}
      <PartnersStrip />     {/* surface — logo marquee */}
      <NewsSection />       {/* light — 3-col blog cards */}
      <ContactSection />    {/* dark — split: info + form */}
    </>
  )
}
```

### Section background alternation:
```
HeroSection      → bg-ean-navy   (dark)
TrustBar         → bg-ean-navy   (dark, continues from hero)
AboutSection     → bg-ean-white  (light)
ServicesSection  → bg-ean-surface (off-white)
CharterSection   → bg-ean-navy   (dark)
VIPSection       → bg-ean-white  (light)
PartnersStrip    → bg-ean-surface (off-white)
NewsSection      → bg-ean-white  (light)
ContactSection   → bg-ean-navy   (dark)
```

---

## 7. EAN Services — Data Reference

When building service cards, pages, or navigation, always use these
exact slugs, names, and short descriptions.

```ts
// src/lib/services.ts
export const EAN_SERVICES = [
  {
    slug: 'fbo-ground-support',
    name: 'FBO & Ground Support',
    short: 'Aircraft passenger handling, fueling, and ramp services to the highest standard.',
    icon: 'Plane',
  },
  {
    slug: 'aircraft-maintenance',
    name: 'Aircraft Maintenance',
    short: 'NCAA-approved Maintenance Organisation (AMO) for business and commercial aircraft.',
    icon: 'Wrench',
  },
  {
    slug: 'aircraft-sales-charter',
    name: 'Aircraft Sales & Charter',
    short: 'Personalized jet and helicopter charter and Airbus-approved sales experience.',
    icon: 'BadgeCheck',
  },
  {
    slug: 'wings-catering',
    name: 'Wings™ In-Flight Catering',
    short: 'Premium onsite catering dedicated to private jets — freshly prepared, every time.',
    icon: 'UtensilsCrossed',
  },
  {
    slug: 'vip-lounge',
    name: 'VIP Lounge Experience',
    short: 'Lagos airport's premier dedicated VIP terminal — the EAN way of departure.',
    icon: 'Star',
  },
  {
    slug: 'leased-offices',
    name: 'Leased Office Spaces',
    short: 'Hangar bays and premium service-leased office spaces at MMIA, Lagos.',
    icon: 'Building2',
  },
] as const
```

---

## 8. Animation Rules

See `.agents/skills/gsap-animations.md` for all patterns.

Quick rules:
- GSAP + ScrollTrigger → section entrances, parallax, counters, navbar scroll
- Framer Motion → card hover, page transitions, mobile menu, modals
- CSS `@keyframes` → PartnersStrip marquee ONLY
- Never mix GSAP and Framer Motion on the same element
- Every GSAP component must have `'use client'` at the top
- Always use `useGSAP` from `@gsap/react`, never raw `useEffect`
- Always register plugins at the file level, outside the component

**EAN-specific animation values:**
```ts
// Section reveal — used in SectionReveal.tsx
fromTo: { opacity: 0, y: 32 } → { opacity: 1, y: 0 }
duration: 0.9
ease: 'power2.out'
scrollTrigger.start: 'top 85%'

// Stagger for service cards grid
stagger: 0.08

// Hero parallax background
yPercent: 25
ease: 'none' // always linear for parallax

// TrustBar stat counter
duration: 2
ease: 'power1.inOut'

// Card hover (Framer Motion)
whileHover: { y: -4, boxShadow: '0 8px 24px rgba(196, 149, 42, 0.12)' }
transition: { duration: 0.2, ease: 'easeOut' }
```

---

## 9. Blog & CMS (Sanity)

The blog is the most SEO-critical part of this project.
All blog content lives in Sanity. The Next.js app fetches it at build time.

### 9.1 Sanity Post Schema

```ts
// sanity/schema/post.ts
export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title',       type: 'string',   validation: Rule => Rule.required() }),
    defineField({ name: 'slug',        type: 'slug',     options: { source: 'title' } }),
    defineField({ name: 'excerpt',     type: 'text',     validation: Rule => Rule.max(160) }),
    defineField({ name: 'coverImage',  type: 'image',    options: { hotspot: true } }),
    defineField({ name: 'category',    type: 'string',   options: {
      list: ['Business Aviation', 'FBO Services', 'Industry News', 'General']
    }}),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({ name: 'body',        type: 'array',    of: [{ type: 'block' }, { type: 'image' }] }),
    // SEO fields
    defineField({ name: 'seoTitle',       type: 'string' }),
    defineField({ name: 'seoDescription', type: 'text',  validation: Rule => Rule.max(160) }),
    defineField({ name: 'ogImage',        type: 'image' }),
  ],
})
```

### 9.2 GROQ Queries

```ts
// src/lib/sanity/queries.ts

// Blog listing — lightweight, no body
export const ALL_POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, excerpt, category, publishedAt,
    coverImage { asset->{ url } }
  }
`

// Single post — full content for [slug] page
export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    title, excerpt, publishedAt, category,
    coverImage { asset->{ url }, alt },
    body,
    seoTitle, seoDescription,
    ogImage { asset->{ url } }
  }
`

// All slugs — for generateStaticParams
export const ALL_SLUGS_QUERY = `
  *[_type == "post"] { "slug": slug.current }
`
```

### 9.3 Blog Post Page Pattern (Next.js SSG + SEO)

```tsx
// src/app/(site)/blog/[slug]/page.tsx
import type { Metadata }    from 'next'
import { sanityClient }     from '@/lib/sanity/client'
import { PAGE_SEO, SEO_BASE, getHreflang } from '@/lib/seo'
import {
  POST_BY_SLUG_QUERY,
  ALL_SLUGS_QUERY,
} from '@/lib/sanity/queries'
import type { BlogPost }    from '@/types/blog'

interface Props { params: { slug: string } }

// 1. Pre-render every post at build time
export async function generateStaticParams() {
  const slugs = await sanityClient.fetch(ALL_SLUGS_QUERY)
  return slugs.map(({ slug }: { slug: string }) => ({ slug }))
}

// 2. Dynamic metadata + hreflang per post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post: BlogPost = await sanityClient.fetch(
    POST_BY_SLUG_QUERY, { slug: params.slug }
  )
  const pagePath = `/blog/${params.slug}`

  return {
    title:       post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: {
      canonical: `${SEO_BASE.siteUrl}${pagePath}`,
      languages: getHreflang(pagePath),
    },
    openGraph: {
      title:            post.seoTitle ?? post.title,
      description:      post.seoDescription ?? post.excerpt,
      type:             'article',
      publishedTime:    post.publishedAt,
      locale:           'en_NG',
      localeAlternates: SEO_BASE.localeAlternate,
      images: [post.ogImage?.asset?.url ?? post.coverImage?.asset?.url],
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      images:      [post.ogImage?.asset?.url ?? post.coverImage?.asset?.url],
    },
  }
}

// 3. Page component with JSON-LD
export default async function BlogPostPage({ params }: Props) {
  const post: BlogPost = await sanityClient.fetch(
    POST_BY_SLUG_QUERY, { slug: params.slug }
  )

  const jsonLd = {
    '@context':    'https://schema.org',
    '@type':       'Article',
    headline:      post.title,
    description:   post.excerpt,
    datePublished: post.publishedAt,
    image:         post.coverImage?.asset?.url,
    author: {
      '@type': 'Organization',
      name:    'EAN Aviation',
      url:     'https://ean.aero',
    },
    publisher: {
      '@type': 'Organization',
      name:    'EAN Aviation',
      logo:    'https://ean.aero/images/ean-logo.png',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostContent post={post} />
    </>
  )
}
```

---

## 10. Backend — Inquiry Form (Resend)

The only backend surface in this project is a single API route
for the contact/inquiry form.

```ts
// src/types/inquiry.ts
export type InquiryPayload = {
  name:    string
  email:   string
  phone?:  string
  service: 'fbo' | 'maintenance' | 'charter' | 'catering' | 'vip' | 'leasing' | 'other'
  message: string
}
```

```ts
// src/app/api/inquiry/route.ts
import { Resend }        from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import type { InquiryPayload }       from '@/types/inquiry'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: InquiryPayload = await req.json()

  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await resend.emails.send({
    from:    'EAN Website <no-reply@ean.aero>',
    to:      'info@ean.aero',
    subject: `New Inquiry — ${body.service?.toUpperCase() ?? 'General'} from ${body.name}`,
    html: `
      <p><strong>Name:</strong>    ${body.name}</p>
      <p><strong>Email:</strong>   ${body.email}</p>
      <p><strong>Phone:</strong>   ${body.phone ?? 'Not provided'}</p>
      <p><strong>Service:</strong> ${body.service}</p>
      <p><strong>Message:</strong> ${body.message}</p>
    `,
  })

  return NextResponse.json({ success: true }, { status: 200 })
}
```

**Environment variables (all use `NEXT_PUBLIC_` prefix or server-only):**
```env
RESEND_API_KEY=                          # server-only — never NEXT_PUBLIC_
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
NEXT_PUBLIC_GSC_VERIFICATION=
NEXT_PUBLIC_BING_VERIFICATION=
```

```ts
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await sanityClient.fetch(ALL_SLUGS_QUERY)

  const blogUrls = slugs.map(({ slug }: { slug: string }) => ({
    url:              `https://ean.aero/blog/${slug}`,
    lastModified:     new Date(),
    changeFrequency:  'monthly' as const,
    priority:         0.7,
  }))

  return [
    { url: 'https://ean.aero',                                 priority: 1.0 },
    { url: 'https://ean.aero/about',                           priority: 0.8 },
    { url: 'https://ean.aero/services',                        priority: 0.8 },
    { url: 'https://ean.aero/services/fbo-ground-support',     priority: 0.7 },
    { url: 'https://ean.aero/services/aircraft-maintenance',   priority: 0.7 },
    { url: 'https://ean.aero/services/aircraft-sales-charter', priority: 0.7 },
    { url: 'https://ean.aero/services/wings-catering',         priority: 0.7 },
    { url: 'https://ean.aero/services/vip-lounge',             priority: 0.7 },
    { url: 'https://ean.aero/services/leased-offices',         priority: 0.7 },
    { url: 'https://ean.aero/charter',                         priority: 0.8 },
    { url: 'https://ean.aero/blog',                            priority: 0.6 },
    { url: 'https://ean.aero/contact',                         priority: 0.7 },
    ...blogUrls,
  ]
}
```

---

## 10. Contact Form — EmailJS

There is no backend in this project. The inquiry form sends email
directly from the browser using EmailJS. No server, no API route.

```ts
// src/types/inquiry.ts
export type InquiryPayload = {
  name:    string
  email:   string
  phone?:  string
  service: 'fbo' | 'maintenance' | 'charter' | 'catering' | 'vip' | 'leasing' | 'other'
  message: string
}
```

```ts
// src/lib/emailjs.ts
import emailjs from '@emailjs/browser'
import type { InquiryPayload } from '@/types/inquiry'

export async function sendInquiry(data: InquiryPayload): Promise<void> {
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      from_name:    data.name,
      from_email:   data.email,
      phone:        data.phone ?? 'Not provided',
      service:      data.service,
      message:      data.message,
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  )
}
```

```tsx
// src/components/sections/ContactSection.tsx (form submit handler)
import { sendInquiry }   from '@/lib/emailjs'
import type { InquiryPayload } from '@/types/inquiry'

const [submitting, setSubmitting] = useState(false)
const [submitted,  setSubmitted]  = useState(false)
const [error,      setError]      = useState<string | null>(null)

const handleSubmit = async (data: InquiryPayload) => {
  setSubmitting(true)
  setError(null)
  try {
    await sendInquiry(data)
    setSubmitted(true)
  } catch {
    setError('Something went wrong. Please email us directly at info@ean.aero.')
  } finally {
    setSubmitting(false)
  }
}
```

**Environment variables (Vite uses `VITE_` prefix, not `NEXT_PUBLIC_`):**
```env
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
VITE_SANITY_PROJECT_ID=
VITE_SANITY_DATASET=production
```

**EmailJS setup steps (do once, outside codebase):**
1. Create account at emailjs.com
2. Add email service (Gmail or SMTP to info@ean.aero)
3. Create template — use variables: from_name, from_email,
   phone, service, message
4. Copy Service ID, Template ID, Public Key into .env

---

## 11. SEO Optimization

> ⚠️ **MARKETING-CONTROLLED SECTION**
> All keyword targets, meta titles, meta descriptions, and OG copy in
> this section are owned by the EAN Aviation marketing department.
> Agents MUST NOT change any SEO copy values without a written directive
> from marketing. When marketing sends updated targets, update ONLY
> `src/lib/seo.ts` and this section — do not touch component code.
> The architecture (how metadata is implemented) is dev-owned and
> stable. The content (what the metadata says) is marketing-owned
> and will change.

---

### 11.1 Centralized SEO Config

All SEO values live in one file. This is the only file agents or
marketing directives should touch when SEO copy changes.

```ts
// src/lib/seo.ts
// ─────────────────────────────────────────────────────────────
// MARKETING-CONTROLLED — do not edit values without approval
// Last updated: July 2026
// ─────────────────────────────────────────────────────────────

export const SEO_BASE = {
  siteName:       'EAN Aviation',
  siteUrl:        'https://ean.aero',
  defaultOgImage: 'https://ean.aero/images/ean-og-default.jpg',
  twitterHandle:  '@eanaviationltd',
  locale:         'en_NG',
  // Alternate locales for international OG targeting
  localeAlternate: ['en_GB', 'en_US', 'en_AE', 'en_ZA', 'en_GH'],
}

// ─────────────────────────────────────────────────────────────
// TARGET REGIONS — MARKETING-CONTROLLED
// Priority markets for international SEO reach.
// Update when marketing adjusts regional strategy.
// ─────────────────────────────────────────────────────────────
export const SEO_REGIONS = {
  primary: {
    code:  'NG',
    label: 'Nigeria',
    note:  'Core market — all local SEO targets this region first',
  },
  international: [
    { code: 'GB', label: 'United Kingdom',  note: 'London–Lagos business aviation corridor' },
    { code: 'US', label: 'United States',   note: 'US-Nigeria routes, diaspora business community' },
    { code: 'AE', label: 'UAE / Dubai',     note: 'Lagos–Dubai corridor, growing aviation link' },
    { code: 'ZA', label: 'South Africa',    note: 'Johannesburg–Lagos, BASA route operators' },
    { code: 'GH', label: 'Ghana',           note: 'Accra–Lagos, closest West African market' },
    { code: 'SN', label: 'Senegal',         note: 'Francophone West Africa gateway' },
    { code: 'CM', label: 'Cameroon',        note: 'Central/West Africa regional operators' },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// HREFLANG CONFIG — MARKETING-CONTROLLED
// Defines every region EAN targets internationally.
// All regions point to the same English URL (single-language site).
// To add/remove a market: edit this object + update AGENTS.md Section 11.5.
// ─────────────────────────────────────────────────────────────
export const HREFLANG_LOCALES = {
  'en':         '',   // generic English — all regions
  'en-NG':      '',   // Nigeria — primary market
  'en-GB':      '',   // United Kingdom
  'en-US':      '',   // United States
  'en-AE':      '',   // UAE / Dubai
  'en-ZA':      '',   // South Africa
  'en-GH':      '',   // Ghana
  'x-default':  '',   // fallback for all other regions
} as const

// Helper — call this in every page's generateMetadata
// Returns the alternates.languages object for Next.js Metadata
export function getHreflang(pagePath: string): Record<string, string> {
  const base = SEO_BASE.siteUrl
  return Object.fromEntries(
    Object.keys(HREFLANG_LOCALES).map((locale) => [
      locale,
      `${base}${pagePath}`,
    ])
  )
}

// ─────────────────────────────────────────────────────────────
// PER-PAGE SEO TARGETS — MARKETING-CONTROLLED
// title:                50–60 chars — browser tab + Google headline
// description:          140–160 chars — Google snippet
// localKeywords:        Nigeria/Lagos-specific search targets
// internationalKeywords: Cross-border and global aviation search terms
// ─────────────────────────────────────────────────────────────
export const PAGE_SEO = {
  home: {
    title:                "EAN Aviation | Nigeria's Premier Business Aviation Company",
    description:          "EAN Aviation operates Nigeria's first fully integrated FBO hangar and is the only Airbus-approved distributor in West Africa. FBO, charter, maintenance, and VIP services in Lagos.",
    localKeywords:        ['business aviation Nigeria', 'FBO Lagos', 'private jet charter Nigeria', 'Airbus distributor West Africa'],
    internationalKeywords:['FBO West Africa', 'business aviation Africa', 'private aviation Nigeria', 'aviation services Lagos international'],
  },
  about: {
    title:                "About EAN Aviation | Business Aviation Experts in Nigeria",
    description:          "Learn about EAN Aviation — Nigeria's leading business aviation conglomerate. Over a decade of exemplary FBO, charter, and maintenance services at MMIA, Lagos.",
    localKeywords:        ['EAN Aviation about', 'Nigeria aviation company', 'FBO operator Nigeria', 'MMIA aviation'],
    internationalKeywords:['aviation company West Africa', 'Nigerian aviation operator', 'Africa FBO operator', 'business aviation hub Africa'],
  },
  services: {
    title:                "Our Services | EAN Aviation",
    description:          "Explore EAN Aviation's full suite of business aviation services — FBO & ground support, aircraft maintenance, jet charter, VIP lounge, in-flight catering, and office leasing.",
    localKeywords:        ['aviation services Nigeria', 'FBO services Lagos', 'aircraft charter Nigeria'],
    internationalKeywords:['aviation services West Africa', 'full service FBO Africa', 'business aviation solutions Nigeria'],
  },
  fbo: {
    title:                "FBO & Ground Support Services | EAN Aviation Lagos",
    description:          "EAN Aviation's FBO services at Murtala Mohammed International Airport cover passenger handling, fueling, ramp services, and ground support to the highest international standard.",
    localKeywords:        ['FBO Lagos', 'FBO Nigeria', 'ground support MMIA', 'aircraft handling Lagos'],
    internationalKeywords:['FBO Africa', 'MMIA ground handling', 'Lagos airport FBO international', 'West Africa ground support', 'Nigeria FBO ICAO'],
  },
  maintenance: {
    title:                "Aircraft Maintenance | NCAA-Approved AMO — EAN Aviation",
    description:          "EAN Aviation is an NCAA-approved Aircraft Maintenance Organisation (AMO) providing certified maintenance for business and commercial aircraft in Nigeria.",
    localKeywords:        ['aircraft maintenance Nigeria', 'NCAA approved AMO', 'aircraft MRO Nigeria', 'business aviation maintenance Lagos'],
    internationalKeywords:['aircraft MRO West Africa', 'Airbus maintenance Africa', 'certified aircraft maintenance Nigeria', 'AMO West Africa', 'ICAO approved maintenance Nigeria'],
  },
  charter: {
    title:                "Private Jet & Helicopter Charter | EAN Aviation Nigeria",
    description:          "Charter a private jet or helicopter with EAN Aviation. On-demand, personalized air charter from Lagos — Airbus-approved sales and stress-free booking experience.",
    localKeywords:        ['private jet charter Nigeria', 'helicopter charter Lagos', 'jet charter West Africa', 'on-demand charter Nigeria'],
    internationalKeywords:['charter flight to Lagos', 'private jet Lagos Nigeria', 'business jet Africa charter', 'helicopter charter Africa', 'fly to Lagos private'],
  },
  wings: {
    title:                "Wings™ In-Flight Catering | EAN Aviation",
    description:          "Wings™ by EAN Aviation is a premium in-flight catering service dedicated to private jets at MMIA, Lagos. Freshly prepared meals for discerning aviation clients.",
    localKeywords:        ['in-flight catering Nigeria', 'private jet catering Lagos', 'aviation catering MMIA'],
    internationalKeywords:['private jet catering Africa', 'in-flight catering West Africa', 'aviation catering Lagos international'],
  },
  vip: {
    title:                "VIP Lounge Experience | EAN Aviation Lagos Airport",
    description:          "Experience EAN Aviation's dedicated VIP terminal at Lagos Airport — the premier private lounge for business aviation passengers departing from MMIA.",
    localKeywords:        ['VIP lounge Lagos airport', 'private terminal MMIA', 'aviation VIP lounge Nigeria'],
    internationalKeywords:['VIP airport lounge Lagos', 'private terminal Lagos Nigeria', 'executive lounge MMIA', 'business aviation terminal Africa'],
  },
  leasing: {
    title:                "Hangar & Office Leasing | EAN Aviation MMIA Lagos",
    description:          "EAN Aviation offers premium hangar bays and service-leased office spaces at Murtala Mohammed International Airport, Ikeja, Lagos for aviation operators.",
    localKeywords:        ['hangar lease Lagos', 'aviation office space MMIA', 'hangar Nigeria lease'],
    internationalKeywords:['hangar lease Nigeria', 'aviation facility lease Africa', 'hangar space West Africa', 'MMIA hangar operators'],
  },
  blog: {
    title:                "Aviation Insights & News | EAN Aviation Blog",
    description:          "Stay informed with EAN Aviation's blog — business aviation news, FBO insights, industry trends, and expert commentary from Nigeria's leading aviation conglomerate.",
    localKeywords:        ['business aviation Nigeria news', 'aviation blog Nigeria', 'FBO insights Lagos'],
    internationalKeywords:['Africa aviation news', 'West Africa aviation industry', 'business aviation Africa insights', 'Nigeria aviation market'],
  },
  contact: {
    title:                "Contact EAN Aviation | Inquiries & Bookings",
    description:          "Get in touch with EAN Aviation for charter bookings, FBO services, maintenance enquiries, and VIP lounge access. Located at MMIA, Ikeja, Lagos, Nigeria.",
    localKeywords:        ['contact EAN Aviation', 'aviation inquiry Lagos', 'charter booking Nigeria'],
    internationalKeywords:['EAN Aviation contact international', 'book private jet Lagos', 'aviation inquiry Nigeria', 'FBO inquiry West Africa'],
  },
} as const
```

---

### 11.2 Root Metadata (Shared Defaults)

```ts
// src/app/layout.tsx
import { SEO_BASE, PAGE_SEO, getHreflang } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SEO_BASE.siteUrl),
  title: {
    default:  PAGE_SEO.home.title,
    template: `%s | ${SEO_BASE.siteName}`,
  },
  description: PAGE_SEO.home.description,
  openGraph: {
    siteName: SEO_BASE.siteName,
    type:     'website',
    locale:   SEO_BASE.locale,
    // International OG locale alternates — shown when shared in each region
    localeAlternates: SEO_BASE.localeAlternate,
    url:      SEO_BASE.siteUrl,
    images: [{
      url:    SEO_BASE.defaultOgImage,
      width:  1200,
      height: 630,
      alt:    "EAN Aviation — Nigeria's Premier Business Aviation Company",
    }],
  },
  twitter: {
    card:    'summary_large_image',
    creator: SEO_BASE.twitterHandle,
    site:    SEO_BASE.twitterHandle,
  },
  // hreflang for homepage — tells Google which regions this page targets
  alternates: {
    canonical: SEO_BASE.siteUrl,
    languages: getHreflang('/'),
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION  ?? '',
    // Bing Webmaster Tools — critical for UK, US, UAE international reach
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION ?? '',
    },
  },
}
```

---

### 11.3 Per-Page Metadata Pattern

Every page exports `generateMetadata` pulling from `PAGE_SEO`.
This is the required pattern for ALL static pages — no exceptions:

```ts
// Example: src/app/(site)/services/fbo-ground-support/page.tsx
import type { Metadata } from 'next'
import { PAGE_SEO, SEO_BASE, getHreflang } from '@/lib/seo'

export const metadata: Metadata = {
  title:       PAGE_SEO.fbo.title,
  description: PAGE_SEO.fbo.description,
  alternates: {
    // Canonical — prevents duplicate content penalty (www vs non-www)
    canonical: `${SEO_BASE.siteUrl}/services/fbo-ground-support`,
    // hreflang — tells Google/Bing which regions this page targets
    // Generated automatically from HREFLANG_LOCALES in seo.ts
    languages: getHreflang('/services/fbo-ground-support'),
  },
  openGraph: {
    title:            PAGE_SEO.fbo.title,
    description:      PAGE_SEO.fbo.description,
    url:              `${SEO_BASE.siteUrl}/services/fbo-ground-support`,
    type:             'website',
    locale:           'en_NG',
    localeAlternates: SEO_BASE.localeAlternate,
  },
}
```

**For dynamic pages (blog posts), use `generateMetadata` function:**
```ts
// src/app/(site)/blog/[slug]/page.tsx
import { PAGE_SEO, SEO_BASE, getHreflang } from '@/lib/seo'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await sanityClient.fetch(POST_BY_SLUG_QUERY, { slug: params.slug })
  const pagePath = `/blog/${params.slug}`

  return {
    title:       post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: {
      canonical: `${SEO_BASE.siteUrl}${pagePath}`,
      languages: getHreflang(pagePath),   // ← hreflang on every blog post
    },
    openGraph: {
      title:            post.seoTitle ?? post.title,
      description:      post.seoDescription ?? post.excerpt,
      type:             'article',
      publishedTime:    post.publishedAt,
      locale:           'en_NG',
      localeAlternates: SEO_BASE.localeAlternate,
      images: [post.ogImage?.asset?.url ?? post.coverImage?.asset?.url],
    },
  }
}
```

**The hreflang output this generates (automatically, per page):**
```html
<link rel="alternate" hreflang="en"        href="https://ean.aero/services/fbo-ground-support" />
<link rel="alternate" hreflang="en-NG"     href="https://ean.aero/services/fbo-ground-support" />
<link rel="alternate" hreflang="en-GB"     href="https://ean.aero/services/fbo-ground-support" />
<link rel="alternate" hreflang="en-US"     href="https://ean.aero/services/fbo-ground-support" />
<link rel="alternate" hreflang="en-AE"     href="https://ean.aero/services/fbo-ground-support" />
<link rel="alternate" hreflang="en-ZA"     href="https://ean.aero/services/fbo-ground-support" />
<link rel="alternate" hreflang="en-GH"     href="https://ean.aero/services/fbo-ground-support" />
<link rel="alternate" hreflang="x-default" href="https://ean.aero/services/fbo-ground-support" />
```

Canonical URLs prevent duplicate content penalties from www/non-www.
hreflang tells Google which English-speaking regions each page serves.

---

### 11.4 On-Page SEO Rules

These rules apply to every page component and section. Agents must
follow them on every build — they are not optional.

**Heading hierarchy:**
```
H1 → One per page, only in the hero/page header. Contains the primary keyword.
H2 → Section headings (Services, About, etc.)
H3 → Card titles, sub-sections within H2 sections
H4+ → Rarely used. Only for nested content within H3 sections.
```

Never skip levels (no H1 → H3). Never use headings for styling —
use `font-display` and Tailwind size classes on a `<p>` instead.

**Image alt text:**
```tsx
// ✅ Correct — descriptive, keyword-aware
<Image alt="EAN Aviation FBO hangar at Murtala Mohammed International Airport Lagos" />
<Image alt="Private jet on tarmac at EAN Jet Center, Ikeja Lagos" />
<Image alt="Wings in-flight catering service tray for private jet passengers" />

// ❌ Wrong — empty, generic, or filename
<Image alt="" />
<Image alt="image" />
<Image alt="photo1.jpg" />
```

**Internal linking:**
- Every service card on the homepage links to its service page
- Every blog post card links to `/blog/[slug]`
- Footer quick links cover all main pages
- Blog posts should link to relevant service pages when mentioning them
  (e.g. a post about FBO services links to `/services/fbo-ground-support`)

**Content length targets (marketing-controlled copy):**
```
Homepage sections:     50–100 words per section block
Service pages:         300–600 words of descriptive body copy minimum
Blog posts:            800–2000 words (set by marketing per post)
Meta descriptions:     140–160 characters exactly
Meta titles:           50–60 characters exactly
```

---

### 11.5 Local & International SEO

> ⚠️ MARKETING-CONTROLLED — target markets and schema copy are owned
> by the EAN marketing team. Architecture (how it's implemented) is
> dev-owned. To add a new international market, update `HREFLANG_LOCALES`
> in `seo.ts` and the table in this section — nothing else changes.

---

#### LOCAL — Nigeria / Lagos

EAN's primary market is Nigeria. Every page reinforces Lagos location
signals for local search ranking.

**Organisation schema — add once in `src/app/layout.tsx`:**
```tsx
const orgSchema = {
  '@context':   'https://schema.org',
  '@type':      'Organization',
  name:         'EAN Aviation',
  url:          'https://ean.aero',
  logo:         'https://ean.aero/images/ean-logo.png',
  email:        'info@ean.aero',
  telephone:    '+2348050333410',
  address: {
    '@type':         'PostalAddress',
    streetAddress:   'EAN Jet Center, FAAN Transit Camp Road',
    addressLocality: 'Ikeja',
    addressRegion:   'Lagos',
    addressCountry:  'NG',
  },
  sameAs: [
    'https://www.facebook.com/eanaviationltd/',
    'https://www.instagram.com/eanaviationltd/',
    'https://x.com/eanaviationltd',
    'https://www.linkedin.com/company/ean-aviation-limited/',
  ],
}

// Inside root layout <body>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
/>
```

**LocalBusiness schema — add only on `contact/page.tsx`:**
```ts
const localSchema = {
  '@context':   'https://schema.org',
  '@type':      'LocalBusiness',
  '@id':        'https://ean.aero/#localbusiness',
  name:         'EAN Aviation',
  image:        'https://ean.aero/images/ean-og-default.jpg',
  url:          'https://ean.aero',
  telephone:    '+2348050333410',
  priceRange:   '₦₦₦₦',
  address: {
    '@type':         'PostalAddress',
    streetAddress:   'EAN Jet Center, FAAN Transit Camp Road, MMIA',
    addressLocality: 'Ikeja',
    addressRegion:   'Lagos State',
    addressCountry:  'NG',
  },
  geo: {
    '@type':   'GeoCoordinates',
    latitude:   6.5774,
    longitude:  3.3212,
  },
  openingHoursSpecification: {
    '@type':    'OpeningHoursSpecification',
    dayOfWeek:  ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    opens:      '00:00',
    closes:     '23:59',
  },
}
```

---

#### INTERNATIONAL — Multi-Region Targeting

EAN is English-only — no separate language versions exist.
International SEO is achieved through hreflang region tags pointing
all markets to the same English URL.

**Current target markets:**

| hreflang tag | Region | Rationale |
|---|---|---|
| `en-NG` | Nigeria | Primary market |
| `en-GB` | United Kingdom | London–Lagos business aviation corridor |
| `en-US` | United States | US-Nigeria routes, diaspora business |
| `en-AE` | UAE / Dubai | Lagos–Dubai corridor |
| `en-ZA` | South Africa | Johannesburg–Lagos BASA route |
| `en-GH` | Ghana | Closest West African market |
| `en` | Generic English | Catch-all for unlisted English regions |
| `x-default` | Global fallback | All other regions |

**How hreflang is implemented:**
The `getHreflang(pagePath)` helper in `seo.ts` generates the full
`alternates.languages` object for Next.js Metadata — see Section 11.3
for the exact pattern. Every page must call it.

**International Organization schema — add to `src/app/layout.tsx`:**
Extend the existing `orgSchema` with international presence signals:
```ts
const orgSchema = {
  // ... existing local fields ...
  '@type':         ['Organization', 'AirportBusiness'],
  areaServed: [
    { '@type': 'Country', name: 'Nigeria'       },
    { '@type': 'Country', name: 'Ghana'         },
    { '@type': 'Country', name: 'United Kingdom'},
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'United Arab Emirates' },
    { '@type': 'Country', name: 'South Africa'  },
    { '@type': 'Country', name: 'Senegal'       },
    { '@type': 'Country', name: 'Cameroon'      },
  ],
  knowsAbout: [
    'Business Aviation',
    'Fixed Base Operator',
    'Aircraft Charter',
    'Aircraft Maintenance',
    'FBO Services',
    'Private Jet Charter',
    'VIP Aviation',
  ],
  slogan: "West Africa's Premier Business Aviation Company",
}
```

**International sitemap — update `src/app/sitemap.ts`:**
Each sitemap entry should include `alternates` for international signals:
```ts
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await sanityClient.fetch(ALL_SLUGS_QUERY)

  const hreflangLocales = [
    'en', 'en-NG', 'en-GB', 'en-US', 'en-AE', 'en-ZA', 'en-GH', 'x-default',
  ]

  const buildAlternates = (path: string) => ({
    languages: Object.fromEntries(
      hreflangLocales.map((l) => [l, `https://ean.aero${path}`])
    ),
  })

  const staticPages = [
    { path: '/',                                   priority: 1.0 },
    { path: '/about',                              priority: 0.8 },
    { path: '/services',                           priority: 0.8 },
    { path: '/services/fbo-ground-support',        priority: 0.7 },
    { path: '/services/aircraft-maintenance',      priority: 0.7 },
    { path: '/services/aircraft-sales-charter',    priority: 0.7 },
    { path: '/services/wings-catering',            priority: 0.7 },
    { path: '/services/vip-lounge',                priority: 0.7 },
    { path: '/services/leased-offices',            priority: 0.7 },
    { path: '/charter',                            priority: 0.8 },
    { path: '/blog',                               priority: 0.6 },
    { path: '/contact',                            priority: 0.7 },
  ]

  const blogUrls = slugs.map(({ slug }: { slug: string }) => ({
    url:             `https://ean.aero/blog/${slug}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly' as const,
    priority:        0.7,
    alternates:      buildAlternates(`/blog/${slug}`),
  }))

  return [
    ...staticPages.map(({ path, priority }) => ({
      url:             `https://ean.aero${path}`,
      lastModified:    new Date(),
      changeFrequency: 'monthly' as const,
      priority,
      alternates:      buildAlternates(path),
    })),
    ...blogUrls,
  ]
}
```

---

#### ENVIRONMENT VARIABLES for SEO

Add all of these to `.env.local` — values provided by marketing:

```env
# Google Search Console — paste site verification token
NEXT_PUBLIC_GSC_VERIFICATION=

# Bing Webmaster Tools — critical for UK, US, UAE reach
# Bing powers DuckDuckGo, Yahoo, and Ecosia internationally
NEXT_PUBLIC_BING_VERIFICATION=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
```

**Bing Webmaster Tools setup (do once):**
1. Go to bing.com/webmasters
2. Add ean.aero as a property
3. Choose "HTML Meta Tag" verification method
4. Copy the content value from the meta tag
5. Paste it into `NEXT_PUBLIC_BING_VERIFICATION`
6. Redeploy — Bing will auto-verify on next crawl
7. Submit the sitemap URL: `https://ean.aero/sitemap.xml`

**Google Search Console — international targeting:**
After connecting GSC:
1. Open Search Console → Settings → International Targeting
2. Do NOT restrict to Nigeria — leave country targeting as "Unlocked"
3. This lets hreflang tags handle regional targeting instead
4. Submit sitemap: `https://ean.aero/sitemap.xml`

---

#### ADDING A NEW INTERNATIONAL MARKET

When marketing requests a new target region (e.g. France — `fr-FR`):

1. Add the locale to `HREFLANG_LOCALES` in `src/lib/seo.ts`:
```ts
'fr-FR': '',   // France — [reason marketing provided]
```
2. Add to `SEO_REGIONS.international` in `seo.ts`
3. Add to `localeAlternate` array in `SEO_BASE`
4. Add to the sitemap `hreflangLocales` array in `sitemap.ts`
5. Add international keywords for that market to relevant `PAGE_SEO` entries
6. Update the market table in this section of AGENTS.md
7. Redeploy — Next.js propagates the new hreflang automatically

**Note:** If French-language content is needed for French-speaking West
Africa (Senegal, Cameroon, Ivory Coast), a separate `fr/` route group
would be required. That is a separate project scope — do not implement
without explicit marketing directive.

---

### 11.6 Technical SEO

**robots.ts:**
```ts
// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://ean.aero/sitemap.xml',
    host:    'https://ean.aero',
  }
}
```

**Canonical URL enforcement in `next.config.ts`:**
```ts
// Redirect www → non-www (canonical domain is ean.aero without www)
async redirects() {
  return [
    {
      source:      '/:path*',
      has:         [{ type: 'host', value: 'www.ean.aero' }],
      destination: 'https://ean.aero/:path*',
      permanent:   true,
    },
  ]
},
```

**`next/image` required attributes for SEO:**
```tsx
// Every image must have width, height, alt, and loading strategy
<Image
  src="/images/fbo-hangar.jpg"
  alt="EAN Aviation FBO hangar at Lagos Murtala Mohammed Airport"
  width={1200}
  height={630}
  priority     // add ONLY on above-the-fold hero images
  quality={85}
/>

// Below-fold images — lazy loaded by default, no priority prop needed
<Image
  src="/images/service-charter.jpg"
  alt="Private jet charter service — EAN Aviation Lagos"
  width={800}
  height={500}
  quality={80}
/>
```

**Core Web Vitals targets (Vercel Lighthouse):**
```
LCP (Largest Contentful Paint):  < 2.5s
CLS (Cumulative Layout Shift):   < 0.1
FID / INP:                       < 200ms
Performance score:               ≥ 90
SEO score:                       100
Accessibility score:             ≥ 90
```

Never ship a page that scores below 85 on Performance or below 95 on SEO.

---

### 11.7 Open Graph Images

Every page needs a unique OG image for social sharing.
Store OG images in `public/images/og/`:

```
public/images/og/
  ean-og-default.jpg          ← homepage + fallback (1200×630)
  ean-og-about.jpg
  ean-og-fbo.jpg
  ean-og-maintenance.jpg
  ean-og-charter.jpg
  ean-og-wings.jpg
  ean-og-vip.jpg
  ean-og-leasing.jpg
  ean-og-blog.jpg
  ean-og-contact.jpg
```

Blog posts use the post's `ogImage` from Sanity (see Section 9.2).
If a blog post has no `ogImage`, fall back to the post's `coverImage`.
If neither exists, fall back to `ean-og-default.jpg`.

---

### 11.8 When Marketing Sends SEO Updates

When the marketing department provides new keyword targets,
updated meta copy, or new page priorities:

1. Open `src/lib/seo.ts`
2. Update only the affected values inside `PAGE_SEO`
3. Update the `// Last updated:` comment at the top of `seo.ts`
4. Update Section 11 of this AGENTS.md with the new values
5. Redeploy — Next.js picks up the new metadata automatically

**Do NOT:**
- Change heading text in components to force keyword insertion awkwardly
- Add hidden text or keyword stuffing anywhere in the codebase
- Change the `alternates.canonical` URLs without redirects in place
- Remove schema markup unless marketing explicitly requests it

---

## 12. File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Page components | `page.tsx` (Next.js required) | `blog/[slug]/page.tsx` |
| Section components | PascalCase, descriptive | `HeroSection.tsx` |
| Shared components | PascalCase | `GoldButton.tsx` |
| shadcn/ui | snake-case (auto-generated) | `components/ui/button.tsx` |
| Lib utilities | camelCase | `sanityClient.ts`, `utils.ts` |
| Type files | camelCase | `blog.ts`, `inquiry.ts` |
| Hooks | `use` prefix, camelCase | `useScrolled.ts` |
| Sanity schemas | camelCase | `post.ts`, `category.ts` |
| CSS class names | Tailwind only — no custom class names except in globals.css |

---

## 13. TypeScript Rules

- Strict mode is on — no `any`, no `as any`
- All component props must have explicit TypeScript interfaces or types
- All Sanity query return types must be typed — define them in `src/types/blog.ts`
- API route request bodies must be typed before use
- Use `type` for object shapes, `interface` for component props

```ts
// ✅ Correct
interface BlogCardProps {
  title:       string
  slug:        string
  excerpt:     string
  category:    string
  publishedAt: string
  coverImage?: string
}

// ❌ Wrong
const BlogCard = (props: any) => { ... }
```

---

## 14. What Agents MUST Do

- Read this file fully before starting any task
- Match the EAN.aero color palette exactly — use `ean-*` Tailwind tokens only
- Use `font-display` for all headlines (Cormorant Garamond)
- Use `font-ui` for all body/UI text (Inter)
- Use the exact service slugs, names, and descriptions from Section 7
- Use plain `<img>` tags with `loading="lazy"` for all images below the fold
- Use `loading="eager"` only on the hero slide images (above fold)
- Use React Router `<Link>` from react-router-dom for all internal navigation
- Use `<Helmet>` from react-helmet-async on every page for SEO meta tags
- Use `useSanityQuery` hook for all Sanity data fetching
- Use `sendInquiry` from `@/lib/emailjs` for the contact form — no fetch/axios
- Use `useGSAP` from `@gsap/react` for all GSAP animations — never raw useEffect
- Wrap page bodies in `<PageTransition>` for route-level fade transitions
- Add `SectionReveal` around each homepage section for scroll reveals
- Add `'use client'` to every component that uses GSAP, Framer Motion, hooks, or browser APIs
- Server Components are the default — only add `'use client'` when genuinely needed

---

## 15. What Agents MUST NOT Do

- Do NOT use React Router, BrowserRouter, or any client-side routing library
- Do NOT write `import { Link } from 'react-router-dom'` — use `next/link`
- Do NOT write `<img>` tags — use `next/image` always
- Do NOT load fonts via Google Fonts `<link>` — use `next/font/google`
- Do NOT create a database, Supabase client, or Prisma schema
- Do NOT add more API routes beyond `/api/inquiry/route.ts`
- Do NOT install `axios` — use native `fetch` or the Sanity client
- Do NOT use `useEffect` with GSAP — always `useGSAP` from `@gsap/react`
- Do NOT mix Framer Motion and GSAP on the same element
- Do NOT import GSAP premium plugins — only `ScrollTrigger` and `TextPlugin` (free)
- Do NOT add `'use client'` unless the component genuinely needs it
- Do NOT use gold (`ean-gold`) as a background for large surfaces
- Do NOT install `moment.js` — use `Intl.DateTimeFormat` or `date-fns`
- Do NOT hardcode EAN brand copy — reference constants or Sanity data

---

## 16. Contact Details (Static Reference)

Used in footer, contact section, and email template:

```ts
export const EAN_CONTACT = {
  email:    'info@ean.aero',
  phone:    '+234 (0) 805 033 3410',
  address: {
    line1:  'EAN Jet Center',
    line2:  'FAAN Transit Camp Road',
    line3:  'Murtala Mohammed International Airport',
    city:   'Ikeja, Lagos State',
    country:'Nigeria',
  },
  social: {
    facebook:  'https://www.facebook.com/eanaviationltd/',
    instagram: 'https://www.instagram.com/eanaviationltd/',
    twitter:   'https://x.com/eanaviationltd',
    linkedin:  'https://www.linkedin.com/company/ean-aviation-limited/',
  },
} as const
```

---

## 17. Rebrand Note

The `ean-*` color tokens in Section 5.1 and `globals.css` have been updated to the official rebrand color palette (`#641224` base color, preserved signature `#C4952A` gold aesthetics, and derived wine/burgundy tones).

1. CSS custom properties in `globals.css` updated to `#641224` base and derived tones.
2. Tailwind `@theme` tokens propagate the new palette automatically across the codebase.
3. Section 5.1 in this file updated with the exact rebrand hex values.
4. All components use `ean-*` tokens to maintain single-source-of-truth styling across all pages.

---

18. Admin Dashboard

⚠️ DATABASE PENDING This section defines the admin dashboard UI, routes, and component structure. Database tables and schemas are NOT included here — they will be added in a separate update once the database tech is confirmed. Build the UI shell and layout first. Wire up data when the database decision is made.

The admin dashboard is a separate, protected area of the site. It is NOT part of the public (site) route group. The Marketing team is the sole user of the dashboard across all sections.

18.1 Who Uses What

The admin dashboard is used exclusively by the Marketing team:

| Section | Marketing | Notes |
|---|---|---|
| Overview | ✅ Primary | Dashboard analytics, lead summary, source tracking |
| Enquiries & Leads | ✅ Primary | Manage incoming enquiries, DMs, pipeline & lead statuses |
| Pricing Manager | ✅ Primary | Service pricing updates & active item management |
| Blog Manager | ✅ Primary | Create, edit, and publish blog articles & SEO copy |
18.2 Admin Routes

Admin lives in its own route group — separate from the public site:

src/app/
  (site)/                        ← public website
  admin/                         ← admin dashboard (protected)
    layout.tsx                   ← admin shell (sidebar + topbar)
    page.tsx                     ← /admin — overview dashboard
    enquiries/
      page.tsx                   ← /admin/enquiries — full list + filters
      new/page.tsx               ← /admin/enquiries/new — log social DM manually
      [id]/page.tsx              ← /admin/enquiries/[id] — enquiry detail
    pricing/
      page.tsx                   ← /admin/pricing — all 6 services
      [service]/page.tsx         ← /admin/pricing/[service] — edit price items
    blog/
      page.tsx                   ← /admin/blog — all posts list
      new/page.tsx               ← /admin/blog/new — create post
      [slug]/
        edit/page.tsx            ← /admin/blog/[slug]/edit — edit post
18.3 Admin Layout Shell

The admin layout wraps every admin page with a sidebar and top bar. It is NOT the same as the public (site)/layout.tsx.

┌─────────────────────────────────────────────────────┐
│  TOPBAR                                             │
│  EAN Admin          [notifications] [avatar/logout] │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  SIDEBAR     │   PAGE CONTENT                       │
│              │                                      │
│  Overview    │                                      │
│  Enquiries   │                                      │
│  Pricing     │                                      │
│  Blog        │                                      │
│              │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘

Sidebar nav items:

tsx
const ADMIN_NAV = [
  { label: 'Overview',   href: '/admin',            icon: 'LayoutDashboard' },
  { label: 'Enquiries',  href: '/admin/enquiries',  icon: 'Inbox'           },
  { label: 'Pricing',    href: '/admin/pricing',    icon: 'Tag'             },
  { label: 'Blog',       href: '/admin/blog',       icon: 'FileText'        },
] as const

Admin color scheme: The admin uses a DIFFERENT palette from the public site. Clean, professional, light-mode dashboard aesthetic:

css
Admin background:   #F8F9FA   (light gray)
Admin sidebar:      #FFFFFF   (white)
Admin text:         #1A1A2E   (dark)
Admin accent:       #C4952A   (EAN gold — used on active nav, CTAs)
Admin border:       #E5E7EB
Admin card bg:      #FFFFFF

Do NOT use the dark ean-navy palette inside the admin. The public site is dark luxury. The admin is clean and functional.

18.4 Overview Dashboard — /admin

The first page the team sees. Gives a snapshot of everything.

┌──────────┬──────────┬──────────┬──────────┐
│ Today's  │ New      │ In       │ Converted│
│ Enquiries│ Leads    │ Pipeline │ This Month│
│  [num]   │  [num]   │  [num]   │  [num]   │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────┬──────────────────┐
│ Recent Enquiries        │ Enquiries by     │
│ (last 5, table preview) │ Source (chart)   │
│                         │                  │
│ Name | Source | Status  │ Website    [bar] │
│ ---- | ------ | ------  │ Instagram  [bar] │
│ ...                     │ Facebook   [bar] │
│                         │ X          [bar] │
│ [View All Enquiries →]  │ TikTok     [bar] │
└─────────────────────────┴──────────────────┘

┌─────────────────────────────────────────────┐
│ Pipeline Status Breakdown                   │
│                                             │
│ New [███░░] 12    Contacted [██░░░] 8       │
│ Follow Up [█░░░] 4   Converted [██░░░] 6   │
└─────────────────────────────────────────────┘

Stat cards — 4 across top:

Today's Enquiries — count of enquiries where created_at = today
New Leads — count where lead_status = 'new'
In Pipeline — count where status is contacted, follow_up, or negotiating
Converted This Month — count where lead_status = 'converted' this month

Source breakdown chart: Horizontal bar chart showing which channel drives the most enquiries. Sources: website, instagram, facebook, x, tiktok, whatsapp, referral, walk-in. Use Recharts — already in the stack from NBAC.

18.5 Enquiries & Leads — /admin/enquiries

The sales team's primary workspace. Two views — Table and Kanban.

TABLE VIEW
[Filter: Source ▼] [Filter: Service ▼] [Filter: Status ▼] [Date Range] [Search]
                                                      [+ Log New Enquiry]

┌──────┬──────────────┬─────────┬──────────────┬──────────────┬──────────┬────────────┐
│ Name │ Company      │ Source  │ Service      │ Status       │ Assigned │ Date       │
├──────┼──────────────┼─────────┼──────────────┼──────────────┼──────────┼────────────┤
│ ...  │ ...          │ 🔵 IG   │ Charter      │ 🟡 New       │ —        │ Jul 22     │
│ ...  │ ...          │ 🌐 Web  │ FBO          │ 🟢 Contacted │ Sarah    │ Jul 21     │
│ ...  │ ...          │ 📘 FB   │ Maintenance  │ 🟠 Follow Up │ John     │ Jul 20     │
└──────┴──────────────┴─────────┴──────────────┴──────────────┴──────────┴────────────┘

Status badge colors:

ts
const STATUS_COLORS = {
  new:         'bg-blue-100   text-blue-700',
  contacted:   'bg-yellow-100 text-yellow-700',
  follow_up:   'bg-orange-100 text-orange-700',
  negotiating: 'bg-purple-100 text-purple-700',
  converted:   'bg-green-100  text-green-700',
  closed:      'bg-gray-100   text-gray-600',
  spam:        'bg-red-100    text-red-600',
} as const

Source icons:

ts
const SOURCE_ICONS = {
  website:   '🌐',
  instagram: '📸',
  facebook:  '📘',
  x:         '𝕏',
  tiktok:    '🎵',
  whatsapp:  '💬',
  referral:  '🤝',
  'walk-in': '🚶',
} as const

Filters:

Source: All | Website | Instagram | Facebook | X | TikTok | WhatsApp | Referral | Walk-in
Service: All | FBO | Maintenance | Charter | Catering | VIP | Leasing | General
Status: All | New | Contacted | Follow Up | Negotiating | Converted | Closed | Spam
Date Range: Today | This Week | This Month | Custom
Search: searches name, company, email

"+ Log New Enquiry" button: Opens a modal form for manually logging enquiries that came via social DMs, phone calls, or walk-ins. Fields: full_name, company, email, phone, source (dropdown), service_type, message (textarea), and optionally assign immediately.

KANBAN VIEW (toggle from table)
┌──────────┬────────────┬───────────┬──────────────┬───────────┐
│ NEW      │ CONTACTED  │ FOLLOW UP │ NEGOTIATING  │ CONVERTED │
│ [badge]  │ [badge]    │ [badge]   │ [badge]      │ [badge]   │
├──────────┼────────────┼───────────┼──────────────┼───────────┤
│ ┌──────┐ │ ┌──────┐   │ ┌──────┐  │ ┌──────┐     │ ┌──────┐  │
│ │Name  │ │ │Name  │   │ │Name  │  │ │Name  │     │ │Name  │  │
│ │Svc   │ │ │Svc   │   │ │Svc   │  │ │Svc   │     │ │Svc   │  │
│ │Source│ │ │Source│   │ │Source│  │ │Source│     │ │Source│  │
│ └──────┘ │ └──────┘   │ └──────┘  │ └──────┘     │ └──────┘  │
└──────────┴────────────┴───────────┴──────────────┴───────────┘

Cards are draggable between columns — dragging updates lead_status.

18.6 Enquiry Detail — /admin/enquiries/[id]

Clicking any enquiry row opens the full detail view.

← Back to Enquiries

┌─────────────────────────────┬──────────────────────────┐
│ ENQUIRY DETAILS             │ LEAD PIPELINE            │
│                             │                          │
│ Name:    John Adeyemi       │ Status:  [New ▼]         │
│ Company: Zenith Bank        │ Priority:[Normal ▼]      │
│ Email:   j@zenith.com       │ Assigned:[Select ▼]      │
│ Phone:   +234 ...           │                          │
│ Source:  📸 Instagram       │ Notes:                   │
│ Service: Charter            │ [textarea]               │
│ Date:    Jul 22, 2026       │                          │
│                             │ Follow-up Date:          │
│ MESSAGE:                    │ [date picker]            │
│ "I'm interested in char..." │                          │
│                             │ [Save Changes]           │
└─────────────────────────────┴──────────────────────────┘

ACTIVITY TIMELINE
─────────────────
Jul 22, 10:30am — Enquiry received via Instagram
Jul 22, 11:00am — Assigned to Sarah
Jul 22, 2:00pm  — Status changed: New → Contacted
Jul 23, 9:00am  — Note added: "Client wants Lagos–Abuja route"
18.7 Pricing Manager — /admin/pricing

Marketing uses this to update prices when costs change. All 6 services shown as cards.

Pricing Manager                              [Last updated: Jul 22, 2026]

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ FBO & Ground Support │  │ Aircraft Maintenance  │  │ Aircraft Charter     │
│                      │  │                      │  │                      │
│ Standard Handling    │  │ Line Maintenance     │  │ Lagos → Abuja        │
│ ₦ 150,000 / visit   │  │ ₦ 80,000 / hour     │  │ ₦ 2,500,000 / flight │
│                      │  │                      │  │                      │
│ VIP Handling         │  │ A-Check              │  │ Lagos → Accra        │
│ ₦ 350,000 / visit   │  │ ₦ 500,000 / job     │  │ ₦ 4,000,000 / flight │
│                      │  │                      │  │                      │
│ [Edit Prices]        │  │ [Edit Prices]        │  │ [Edit Prices]        │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ Wings™ Catering      │  │ VIP Lounge           │  │ Leased Offices       │
│                      │  │                      │  │                      │
│ Standard Meal        │  │ Single Visit         │  │ Small Hangar Bay     │
│ ₦ 45,000 / person   │  │ ₦ 25,000 / person   │  │ ₦ 800,000 / month   │
│                      │  │                      │  │                      │
│ Premium Meal         │  │ Monthly Membership   │  │ Executive Office     │
│ ₦ 85,000 / person   │  │ ₦ 150,000 / month   │  │ ₦ 450,000 / month   │
│                      │  │                      │  │                      │
│ [Edit Prices]        │  │ [Edit Prices]        │  │ [Edit Prices]        │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘

Clicking "Edit Prices" → /admin/pricing/[service]:

← Back to Pricing

FBO & Ground Support — Edit Prices

┌─────────────────────────────────┬──────────┬──────────┬────────┬────────┐
│ Item Name                       │ Price    │ Unit     │ Active │ Action │
├─────────────────────────────────┼──────────┼──────────┼────────┼────────┤
│ Standard Ramp Handling          │ ₦150,000 │ per visit│  ✅    │ [Edit] │
│ VIP Ramp Handling               │ ₦350,000 │ per visit│  ✅    │ [Edit] │
│ Fueling Surcharge               │ ₦ 15,000 │ per litre│  ✅    │ [Edit] │
└─────────────────────────────────┴──────────┴──────────┴────────┴────────┘

[+ Add Price Item]

Clicking Edit on a row opens an inline edit form. The Active toggle lets marketing hide a price without deleting it (e.g. a service is temporarily unavailable).

Currency selector per item: NGN (₦) or USD ($) NGN is default. USD option for international clients.

18.8 Blog Manager — /admin/blog

Replaces Sanity. Marketing team writes and publishes posts here.

BLOG LIST
Blog Posts                                          [+ New Post]

[Filter: All | Published | Draft]   [Search posts...]

┌──────────────────────────────────┬───────────┬─────────────┬──────────────────┐
│ Title                            │ Category  │ Status      │ Actions          │
├──────────────────────────────────┼───────────┼─────────────┼──────────────────┤
│ EAN Wins Best FBO Award 2026     │ News      │ 🟢 Published│ [Edit] [Delete]  │
│ What is a Fixed Base Operator?   │ Education │ 🟢 Published│ [Edit] [Delete]  │
│ Charter Routes for Q4 2026       │ Charter   │ 🟡 Draft    │ [Edit] [Delete]  │
└──────────────────────────────────┴───────────┴─────────────┴──────────────────┘
BLOG EDITOR — /admin/blog/new and /admin/blog/[slug]/edit
← Back to Blog Posts

┌──────────────────────────────────────────────────────────┐
│ Post Title                                               │
│ [text input — large]                                     │
├──────────────────────────────────────────────────────────┤
│ Cover Image                    Category                  │
│ [upload / drag and drop]       [dropdown]                │
├──────────────────────────────────────────────────────────┤
│ BODY CONTENT (Tiptap rich text editor)                   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ B  I  U  H1  H2  H3  —  Link  Image  Quote  Code   │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │                                                      │ │
│ │  Write your post here...                             │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ SEO (collapsible section)                                │
│ SEO Title:       [text input — 50-60 chars counter]      │
│ Meta Description:[textarea — 140-160 chars counter]      │
│ OG Image:        [upload]                                │
├──────────────────────────────────────────────────────────┤
│                      [Save Draft]   [Publish Post]       │
└──────────────────────────────────────────────────────────┘

Tiptap toolbar features: Bold, Italic, Underline, H1, H2, H3, Horizontal Rule, Link, Image Upload, Blockquote, Code Block.

Char counters: SEO Title shows X/60 chars — turns red above 60. Meta Description shows X/160 chars — turns red above 160.

Save Draft — saves without making it live on the public blog. Publish Post — makes it immediately visible on ean.aero/blog.

18.9 Admin Components to Build
src/components/admin/
  layout/
    AdminSidebar.tsx          ← nav items, active state
    AdminTopbar.tsx           ← page title, notifications, avatar
    AdminLayout.tsx           ← shell wrapper

  overview/
    StatCard.tsx              ← 4 top stat cards
    RecentEnquiriesTable.tsx  ← preview table on overview
    SourceBreakdownChart.tsx  ← Recharts bar chart
    PipelineBreakdown.tsx     ← status count bars

  enquiries/
    EnquiriesTable.tsx        ← main sortable/filterable table
    EnquiriesKanban.tsx       ← drag-and-drop kanban view
    EnquiryDetailPanel.tsx    ← right panel on detail page
    StatusBadge.tsx           ← colored status pill
    SourceIcon.tsx            ← source emoji/icon mapping
    LogEnquiryModal.tsx       ← manual entry form modal
    ActivityTimeline.tsx      ← audit trail on detail page
    FilterBar.tsx             ← source/service/status/date filters

  pricing/
    ServicePricingCard.tsx    ← card per service on overview
    PriceItemRow.tsx          ← editable row in price table
    AddPriceItemForm.tsx      ← inline form for new price items

  blog/
    BlogPostsTable.tsx        ← list of all posts
    BlogEditor.tsx            ← Tiptap wrapper + all fields
    SEOFieldsPanel.tsx        ← collapsible SEO section
    StatusToggle.tsx          ← draft / published toggle
18.10 Admin Rules for Agents
Admin pages live in src/app/admin/ — never inside (site)/
Admin uses light-mode palette — never ean-navy or dark tokens
Gold (ean-gold) is used ONLY for active sidebar nav item and CTAs
Recharts is the charting library — no Chart.js, no D3 directly
Tiptap is the blog editor — no Quill, no Draft.js, no contenteditable div
Tables use shadcn/ui Table component as the base
Modals use shadcn/ui Dialog component
Dropdowns use shadcn/ui Select component
Date pickers use shadcn/ui Calendar + Popover
Do NOT build auth yet — auth setup comes when database is confirmed
Do NOT wire up API calls yet — build UI shell first, data layer comes later
*Last updated: July 2026 — Eddie / EAN Aviation dev*