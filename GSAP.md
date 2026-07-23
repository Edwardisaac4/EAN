# SKILL: GSAP Animations
# Project: EAN Aviation (ean.aero)
# Stack: Next.js 15, TypeScript, GSAP 3 + @gsap/react

Read this file fully before writing any animation code.
Every pattern in this file has been chosen specifically for
Next.js 15 App Router + TypeScript. Do not deviate from them.

---

## 1. THE GOLDEN RULES (read before anything else)

```
1. ALWAYS use useGSAP from @gsap/react — NEVER raw useEffect with gsap
2. ALWAYS register plugins at the FILE LEVEL — never inside a component
3. ALWAYS add 'use client' to any component using GSAP
4. NEVER mix GSAP and Framer Motion on the same element
5. NEVER use document.querySelector inside useGSAP — use refs or scope
6. ALWAYS return a cleanup function or use useGSAP's built-in cleanup
7. ALWAYS use gsap.context() scope — prevents animation leaks in Next.js
```

---

## 2. SETUP — REQUIRED IMPORTS

```tsx
'use client'

// Core — always needed
import { useRef }     from 'react'
import { useGSAP }    from '@gsap/react'
import gsap           from 'gsap'

// Plugins — import only what you use
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin }    from 'gsap/TextPlugin'

// Register plugins AT FILE LEVEL — outside the component, always
gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(TextPlugin)
// If using both:
gsap.registerPlugin(ScrollTrigger, TextPlugin)
```

**Why file level registration matters:**
Next.js can mount/unmount components multiple times (StrictMode, HMR).
If you register inside the component or useEffect, you get double
registration warnings and broken animations on re-renders. File level
runs once per module load — always correct.

---

## 3. useGSAP — THE ONLY WAY TO USE GSAP IN REACT

`useGSAP` is a drop-in replacement for `useEffect` that handles
GSAP cleanup automatically. It also sets up the GSAP context scope.

```tsx
// Basic pattern — always use this
const containerRef = useRef<HTMLElement>(null)

useGSAP(() => {
  // Your GSAP code here
  gsap.to('.box', { x: 100, duration: 1 })
}, { scope: containerRef })  // scope limits querySelector to this element
```

**scope: containerRef** is critical — it tells GSAP to only look for
`.box` inside `containerRef`. Without it, GSAP searches the entire
document and breaks when multiple instances of the component exist.

```tsx
// With dependencies (re-runs when dep changes)
useGSAP(() => {
  gsap.to('.item', { opacity: 1 })
}, { scope: containerRef, dependencies: [someState] })

// Cleanup — useGSAP handles this automatically
// You do NOT need to return a cleanup function
// GSAP kills all animations created in this scope on unmount
```

---

## 4. THE THREE CORE METHODS

### 4.1 gsap.to() — animate FROM current state TO target

Use when the element is already styled and you want to animate it
to a new state. Most common method.

```tsx
// Syntax
gsap.to(target, vars)

// Examples
gsap.to('.hero-text', {
  opacity: 1,     // animate TO opacity 1
  y: 0,           // animate TO y position 0
  duration: 0.9,  // over 0.9 seconds
  ease: 'power2.out',
})

// Multiple elements — animates all that match
gsap.to('.service-card', {
  opacity: 1,
  y: 0,
  duration: 0.7,
  stagger: 0.1,   // each card starts 0.1s after the previous
})

// With a ref
gsap.to(myRef.current, {
  scale: 1.05,
  duration: 0.3,
})
```

### 4.2 gsap.from() — animate FROM specified values TO current state

Use when the element is already in its final position and you want
to animate it IN from somewhere else. Great for entrances.

```tsx
// Syntax
gsap.from(target, vars)

// Examples
gsap.from('.hero-headline', {
  opacity: 0,    // starts at opacity 0, animates to current (1)
  y: 40,         // starts 40px below, animates to current position
  duration: 1,
  ease: 'power3.out',
})

// IMPORTANT: the element must already have its final styles set
// via CSS/Tailwind before gsap.from() runs
```

### 4.3 gsap.fromTo() — full control, specify both start AND end

Use when you need to guarantee exactly where an animation starts
AND ends. Most explicit, most reliable. Preferred for complex sequences.

```tsx
// Syntax
gsap.fromTo(target, fromVars, toVars)

// Examples
gsap.fromTo('#hero-eyebrow',
  { opacity: 0, y: 20 },   // FROM: starts here
  { opacity: 1, y: 0,       // TO: ends here
    duration: 0.7,
    ease: 'power2.out' }
)

// Use fromTo when:
// - You're not sure what the element's current state is
// - You're re-running animations (stale state issue)
// - You need precision on both ends of the animation
```

### 4.4 gsap.set() — set properties instantly (no animation)

Use to set initial states before an animation starts, or to
snap something to a value immediately.

```tsx
// Syntax
gsap.set(target, vars)

// Examples
gsap.set('.slide', { opacity: 0 })           // hide all slides instantly
gsap.set('#hero-content', { y: 30 })         // position before animation
gsap.set('.card', { transformOrigin: 'center center' }) // set transform origin
```

---

## 5. TIMELINE — CHAINING ANIMATIONS IN SEQUENCE

Timeline is the most powerful GSAP feature. It lets you chain
multiple animations together with precise timing control.

```tsx
// Create a timeline
const tl = gsap.timeline()

// Chain animations — they run IN SEQUENCE by default
tl.to('.element-1', { opacity: 1, duration: 0.5 })
  .to('.element-2', { opacity: 1, duration: 0.5 })   // starts after element-1
  .to('.element-3', { opacity: 1, duration: 0.5 })   // starts after element-2
```

### 5.1 Position Parameter — controlling when animations start

The position parameter is the 3rd argument on timeline methods.
It controls WHEN in the timeline an animation begins.

```tsx
const tl = gsap.timeline()

// ABSOLUTE position — starts at exactly 1 second into the timeline
tl.to('.a', { opacity: 1 }, 1)

// LABEL position — starts at a named label
tl.addLabel('start')
tl.to('.a', { opacity: 1 }, 'start')

// RELATIVE — starts 0.3s AFTER the previous animation ENDS
tl.to('.a', { opacity: 1 })
  .to('.b', { opacity: 1 }, '+=0.3')   // 0.3s gap after .a

// RELATIVE — starts 0.3s BEFORE the previous animation ENDS (overlap)
tl.to('.a', { opacity: 1, duration: 1 })
  .to('.b', { opacity: 1 }, '-=0.3')   // starts 0.3s before .a finishes

// IMMEDIATE — starts at the SAME TIME as the previous animation
tl.to('.a', { opacity: 1 })
  .to('.b', { opacity: 1 }, '<')       // starts exactly when .a starts

// OFFSET from previous start
tl.to('.a', { opacity: 1 })
  .to('.b', { opacity: 1 }, '<0.2')    // starts 0.2s after .a STARTS
```

### 5.2 Timeline Config Options

```tsx
const tl = gsap.timeline({
  delay:  0.3,       // wait 0.3s before the timeline starts
  repeat: -1,        // repeat forever (-1 = infinite)
  yoyo:   true,      // play forwards then backwards
  paused: true,      // create paused — trigger manually
  onComplete: () => console.log('done'),
  onUpdate:   () => console.log('updating'),
})
```

### 5.3 EAN Hero Intro Timeline — exact pattern to use

```tsx
'use client'

import { useRef }  from 'react'
import { useGSAP } from '@gsap/react'
import gsap        from 'gsap'

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.2 })

    tl.fromTo('#hero-eyebrow',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
    )
    .fromTo('#hero-headline',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
      '-=0.4'   // starts 0.4s before eyebrow finishes — overlap
    )
    .fromTo('#hero-subcopy',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.5'
    )
    .fromTo('#hero-ctas',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo('#hero-dots',
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power1.out' },
      '-=0.2'
    )
    .fromTo('#hero-scroll',
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power1.out' },
      '-=0.3'
    )

  }, { scope: sectionRef })

  return <section ref={sectionRef}> ... </section>
}
```

---

## 6. SCROLL TRIGGER

ScrollTrigger fires animations when elements enter the viewport.
Every section entrance on EAN uses this pattern.

### 6.1 Basic ScrollTrigger

```tsx
gsap.registerPlugin(ScrollTrigger)

gsap.fromTo('.section-content',
  { opacity: 0, y: 40 },
  {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: {
      trigger:  '.section-content',  // element that triggers the animation
      start:    'top 85%',           // when top of trigger hits 85% from top of viewport
      end:      'bottom 20%',        // optional end point
      toggleActions: 'play none none none',  // play once on enter
      // toggleActions: 'play reverse play reverse'  // play and reverse on scroll
    }
  }
)
```

### 6.2 toggleActions explained

```
toggleActions: 'onEnter onLeave onEnterBack onLeaveBack'

Options for each: play | pause | resume | reverse | restart | none

// Play once, never reverse (most common for EAN sections)
toggleActions: 'play none none none'

// Play when enter, reverse when leave
toggleActions: 'play reverse play reverse'

// Play once, stay visible
toggleActions: 'play none none none'
```

### 6.3 EAN Section Reveal — SectionReveal.tsx pattern

```tsx
'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP }                from '@gsap/react'
import gsap                       from 'gsap'
import { ScrollTrigger }          from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SectionRevealProps {
  children:  ReactNode
  delay?:    number    // stagger offset for sequential sections
  className?: string
}

export default function SectionReveal({
  children,
  delay = 0,
  className,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 32 },
      {
        opacity:  1,
        y:        0,
        duration: 0.9,
        delay,
        ease:     'power2.out',
        scrollTrigger: {
          trigger:       ref.current,
          start:         'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: ref })

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Usage in homepage sections:
// <SectionReveal><AboutSection /></SectionReveal>
// <SectionReveal delay={0.1}><ServicesSection /></SectionReveal>
```

### 6.4 Staggered ScrollTrigger — for card grids

```tsx
// Animates each service card one after another as they scroll into view
useGSAP(() => {
  gsap.fromTo('.service-card',
    { opacity: 0, y: 40 },
    {
      opacity:  1,
      y:        0,
      duration: 0.7,
      ease:     'power2.out',
      stagger:  0.08,  // 80ms between each card
      scrollTrigger: {
        trigger:       '.services-grid',
        start:         'top 80%',
        toggleActions: 'play none none none',
      },
    }
  )
}, { scope: containerRef })
```

### 6.5 Parallax with ScrollTrigger

```tsx
// Background image moves slower than scroll — creates depth
useGSAP(() => {
  gsap.to('.hero-bg-image', {
    yPercent: 25,     // moves 25% of its height while scrolling
    ease:     'none', // always linear for parallax
    scrollTrigger: {
      trigger: '.hero-section',
      start:   'top top',
      end:     'bottom top',
      scrub:   true,  // ties animation directly to scroll position
    },
  })
}, { scope: sectionRef })
```

### 6.6 Navbar background on scroll (ScrollTrigger alternative)

For the navbar background appearing on scroll, use a direct scroll
listener instead of ScrollTrigger — lighter and more precise:

```tsx
// In Navbar.tsx
useEffect(() => {
  const handleScroll = () => {
    gsap.to('.navbar', {
      backgroundColor: window.scrollY > 80
        ? 'rgba(10, 22, 40, 0.92)'
        : 'rgba(10, 22, 40, 0)',
      duration: 0.3,
      ease: 'power1.out',
    })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

---

## 7. STAGGER

Stagger creates a delay between animations on multiple elements.
Use it whenever you animate a list or grid of items.

```tsx
// Basic stagger
gsap.fromTo('.card',
  { opacity: 0, y: 30 },
  {
    opacity:  1,
    y:        0,
    duration: 0.6,
    stagger:  0.08,   // 80ms between each card
  }
)

// Stagger from center outward
gsap.fromTo('.card',
  { opacity: 0, scale: 0.95 },
  {
    opacity:  1,
    scale:    1,
    duration: 0.5,
    stagger: {
      amount: 0.5,      // total time spread across all elements
      from:   'center', // animate from center outward
    }
  }
)

// Stagger grid (2D — for card grids)
gsap.fromTo('.card',
  { opacity: 0, y: 20 },
  {
    opacity:  1,
    y:        0,
    duration: 0.6,
    stagger: {
      amount: 0.6,
      grid:   'auto',   // GSAP auto-detects grid layout
      from:   'start',
    }
  }
)
```

**EAN stagger values:**
```
Service cards grid:     stagger: 0.08
Blog post cards:        stagger: 0.1
TrustBar stats:         stagger: 0.12
Partner logos:          CSS marquee only — no stagger
```

---

## 8. EASING REFERENCE

Ease controls the speed curve of the animation.
Choose based on what the element IS, not personal preference.

```
power1       — subtle, gentle. Use for opacity fades
power2       — standard, slightly snappy. Default choice for EAN
power3       — faster start, longer decel. Use for headlines
power4       — very fast start. Use for urgent/impactful elements
back         — overshoots then settles. Use for playful UI (NOT EAN)
elastic      — bouncy spring. NOT appropriate for luxury brand
bounce       — literal bounce. NOT appropriate for EAN
sine         — very gentle sine wave. Use for breathing animations
expo         — extreme version of power. Use sparingly
circ         — circular curve. Use for unique moments
```

**EAN-specific ease guide:**
```ts
// Headlines — fast in, long settle
ease: 'power3.out'

// General content — balanced
ease: 'power2.out'

// Opacity only — very gentle
ease: 'power1.out'

// Parallax — always linear
ease: 'none'

// Counter numbers — smooth deceleration
ease: 'power1.inOut'

// Ken Burns zoom — very slow, linear
ease: 'none'

// Card hover — snappy
ease: 'power2.out'
```

**In vs Out vs InOut:**
```
.out    — fast start, decelerates at end (most natural, use 90% of the time)
.in     — slow start, accelerates at end (feels heavy, use rarely)
.inOut  — slow start AND end (use for counters and loops)
```

---

## 9. EAN-SPECIFIC ANIMATION PATTERNS

### 9.1 Hero Image Crossfade (4-slide slider)

```tsx
'use client'

import { useRef, useState, useEffect } from 'react'
import { useGSAP }                      from '@gsap/react'
import gsap                             from 'gsap'

const SLIDES = [
  { src: '/images/hero/slide-1.jpg', alt: '...' },
  { src: '/images/hero/slide-2.jpg', alt: '...' },
  { src: '/images/hero/slide-3.jpg', alt: '...' },
  { src: '/images/hero/slide-4.jpg', alt: '...' },
] as const

export default function HeroSection() {
  const sectionRef    = useRef<HTMLElement>(null)
  const imageRefs     = useRef<(HTMLDivElement | null)[]>([])
  const activeRef     = useRef(0)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // Crossfade function — defined outside useGSAP so it can be called
  // from the interval and from dot clicks
  const goToSlide = (next: number) => {
    const current = imageRefs.current[activeRef.current]
    const nextEl  = imageRefs.current[next]
    if (!current || !nextEl) return

    // Ken Burns on incoming slide
    gsap.fromTo(nextEl,
      { scale: 1.06 },
      { scale: 1, duration: 6, ease: 'none' }
    )

    // Crossfade
    gsap.to(current, { opacity: 0, duration: 1.2, ease: 'power2.inOut' })
    gsap.to(nextEl,  {
      opacity: 1,
      duration: 1.2,
      ease: 'power2.inOut',
      onStart: () => {
        activeRef.current = next
        setActive(next)
      },
    })
  }

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!paused) {
        const next = (activeRef.current + 1) % SLIDES.length
        goToSlide(next)
      }
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused])

  // Intro timeline
  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo('#hero-eyebrow',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
    )
    .fromTo('#hero-headline',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo('#hero-subcopy',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.5'
    )
    .fromTo('#hero-ctas',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.4'
    )
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide images */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            ref={(el) => { imageRefs.current[i] = el }}
            className="absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
            // CRITICAL: no CSS transition here — GSAP owns opacity
          >
            <img src={slide.src} alt={slide.alt}
              className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Content, dots, etc. */}
    </section>
  )
}
```

### 9.2 Stat Counter Animation (TrustBar)

```tsx
'use client'

import { useRef }     from 'react'
import { useGSAP }    from '@gsap/react'
import gsap           from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface StatCounterProps {
  end:    number   // target number
  label:  string   // e.g. "Years of Service"
  suffix?: string  // e.g. "+" or "%"
}

export default function StatCounter({ end, label, suffix = '' }: StatCounterProps) {
  const ref     = useRef<HTMLDivElement>(null)
  const numRef  = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const obj = { val: 0 }

    gsap.to(obj, {
      val:      end,
      duration: 2,
      ease:     'power1.inOut',
      scrollTrigger: {
        trigger:       ref.current,
        start:         'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        if (numRef.current) {
          numRef.current.textContent = Math.round(obj.val) + suffix
        }
      },
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="text-center">
      <span ref={numRef} className="font-display text-5xl text-white">
        0{suffix}
      </span>
      <p className="font-ui text-white/60 text-sm mt-1">{label}</p>
    </div>
  )
}

// Usage in TrustBar:
// <StatCounter end={10}  suffix="+" label="Years of Service" />
// <StatCounter end={500} suffix="+" label="Flights Completed" />
```

### 9.3 Partners Marquee (CSS — not GSAP)

The partners logo strip uses CSS animation only. Do NOT use GSAP here.

```css
/* in globals.css */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 35s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
```

```tsx
// PartnersStrip.tsx — duplicate logos so the loop is seamless
<div className="overflow-hidden">
  <div className="flex animate-marquee w-max">
    {/* Render logos TWICE — seamless loop */}
    {[...PARTNERS, ...PARTNERS].map((partner, i) => (
      <div key={i} className="mx-10 opacity-50 hover:opacity-100 transition-opacity">
        <img src={partner.logo} alt={partner.name} className="h-8 w-auto" />
      </div>
    ))}
  </div>
</div>
```

### 9.4 Page Transition (Framer Motion — NOT GSAP)

Page transitions use Framer Motion, not GSAP. Keep them separate.

```tsx
// src/components/layout/PageTransition.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname }             from 'next/navigation'
import type { ReactNode }          from 'react'

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 9.5 Card Hover (Framer Motion — NOT GSAP)

```tsx
import { motion } from 'framer-motion'

<motion.div
  whileHover={{
    y:         -4,
    boxShadow: '0 8px 24px rgba(196, 149, 42, 0.12)',
  }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
  className="service-card ..."
>
  {/* card content */}
</motion.div>
```

### 9.6 Mobile Menu Open/Close (Framer Motion — NOT GSAP)

```tsx
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-60 bg-ean-navy"
    >
      {/* menu content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 10. GSAP vs FRAMER MOTION — DECISION TABLE

Use this every time you're about to write an animation:

| Animation type | Tool | Reason |
|---|---|---|
| Hero intro sequence | GSAP timeline | Complex multi-element sequence |
| Image crossfade | GSAP | Precise opacity + timing control |
| Ken Burns zoom | GSAP | Long-duration scale animation |
| ScrollTrigger reveals | GSAP | Scroll-based triggering |
| Stat counters | GSAP | Requires onUpdate callback |
| Parallax | GSAP scrub | Tied to scroll position |
| Partners marquee | CSS only | Simple infinite loop |
| Page transitions | Framer Motion | AnimatePresence needed |
| Card hover states | Framer Motion | Simple whileHover |
| Mobile menu | Framer Motion | AnimatePresence + slide |
| Modal open/close | Framer Motion | AnimatePresence |
| Scroll indicator bounce | Framer Motion | Simple repeat animation |

---

## 11. COMMON MISTAKES — DO NOT DO THESE

```tsx
// ❌ WRONG — useEffect with gsap (memory leaks, stale refs, hydration issues)
useEffect(() => {
  gsap.to('.box', { opacity: 1 })
  return () => gsap.killTweensOf('.box')  // still not safe enough
}, [])

// ✅ CORRECT — useGSAP handles cleanup automatically
useGSAP(() => {
  gsap.to('.box', { opacity: 1 })
}, { scope: containerRef })

// ❌ WRONG — registering plugin inside component
export default function Hero() {
  gsap.registerPlugin(ScrollTrigger)  // runs on every render
}

// ✅ CORRECT — register at file level
gsap.registerPlugin(ScrollTrigger)   // runs once per module
export default function Hero() { ... }

// ❌ WRONG — CSS transition AND GSAP on same opacity
<div className="transition-opacity duration-300"  // CSS transition
  ref={el => gsap.to(el, { opacity: 1 })}        // GSAP also controlling opacity
/>

// ✅ CORRECT — pick ONE. Remove CSS transition when GSAP owns the property
<div ref={divRef} style={{ opacity: 0 }} />  // GSAP starts from this

// ❌ WRONG — document.querySelector inside useGSAP
useGSAP(() => {
  const el = document.querySelector('.hero')  // breaks with multiple instances
  gsap.to(el, { opacity: 1 })
})

// ✅ CORRECT — use scope or refs
useGSAP(() => {
  gsap.to('.hero', { opacity: 1 })  // scope limits to containerRef
}, { scope: containerRef })

// ❌ WRONG — mixing GSAP and Framer Motion on same element
<motion.div
  animate={{ opacity: 1 }}           // Framer controls opacity
  ref={el => gsap.to(el, { y: 0 })} // GSAP also trying to control this element
/>

// ✅ CORRECT — one tool per element, always
```

---

## 12. QUICK REFERENCE — EAN ANIMATION VALUES

```ts
// Section reveals
fromTo: { opacity: 0, y: 32 } → { opacity: 1, y: 0 }
duration: 0.9
ease: 'power2.out'
scrollTrigger.start: 'top 85%'

// Hero headline
fromTo: { opacity: 0, y: 30 } → { opacity: 1, y: 0 }
duration: 0.9
ease: 'power3.out'

// Hero eyebrow / subcopy / CTAs
fromTo: { opacity: 0, y: 20 } → { opacity: 1, y: 0 }
duration: 0.7
ease: 'power2.out'

// Service card stagger
stagger: 0.08
duration: 0.7

// Crossfade duration
duration: 1.2
ease: 'power2.inOut'

// Ken Burns
fromTo: { scale: 1.06 } → { scale: 1 }
duration: 6
ease: 'none'

// Stat counter
duration: 2
ease: 'power1.inOut'

// Parallax
yPercent: 25
ease: 'none'
scrub: true

// Navbar scroll
duration: 0.3
ease: 'power1.out'
```