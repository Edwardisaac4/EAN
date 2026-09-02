/**
 * Opening veil over the hero — a gold flight path that draws itself while a jet
 * climbs it trailing vapour, handing off to the EAN lockup as it leaves frame.
 *
 * A pure CSS animation with no JavaScript behaviour of its own. The original
 * version held an opaque full-viewport overlay in the server HTML and only tore
 * it down once GSAP had hydrated, which pushed first paint behind the entire
 * client bundle. Nothing here costs a byte of runtime JavaScript or a network
 * request: the artwork is inline SVG rather than /images/new-logo.png for
 * exactly that reason. Do not reintroduce a JS-controlled unmount.
 *
 * Note that it is not a Server Component, despite reading like one — its only
 * caller, PublicShell, is `'use client'`, so this module is part of the client
 * bundle. That costs bundle bytes but not first paint: the markup is in the
 * server HTML and the animation is CSS, so nothing here waits on hydration.
 *
 * Timeline in globals.css, 1.4s end to end. The veil stays fully opaque until
 * 1.15s — through the jet's climb (0 → 0.77s) and the lockup's stagger
 * (0.60 → 1.08s) — and then the whole layer dissolves over 1.15 → 1.36s to
 * reveal the site. So the preloader genuinely finishes before the page is
 * visible, which the previous split timeline did not: it cleared the backdrop
 * at 0.60s and flew the jet over the live hero for another 1.1s, which read as
 * the site arriving mid-animation. The trade is Speed Index — AGENTS.md §8 has
 * the numbers. `pointer-events-none` still matters, but the window it covers is
 * now the 0.25s dissolve rather than three quarters of the beat.
 */

/**
 * Shared by the guide arc, the vapour trail, and — as a duplicated literal —
 * by `offset-path` on `.ean-preloader-plane` in globals.css. If you change this
 * curve, change it there too, or the jet will fly off the line it is drawing.
 */
const ARC_PATH = 'M 14 90 C 62 90 118 28 246 22';

/** Top-view business jet, nose at +X, drawn around the origin so the motion
 *  path's fill-box anchor lands on its centre. */
const JET_PATH =
  'M 13 0 L 1 1.2 L -6 7 L -8 7 L -3 1.4 L -9 1.4 L -12 4 L -13 4 L -11 1 ' +
  'L -13.5 0 L -11 -1 L -13 -4 L -12 -4 L -9 -1.4 L -3 -1.4 L -8 -7 L -6 -7 ' +
  'L 1 -1.2 Z';

export default function Preloader() {
  return (
    <div
      aria-hidden="true"
      className="ean-preloader fixed inset-0 z-9999 pointer-events-none"
    >
      <div className="ean-preloader-veil absolute inset-0 bg-ean-gold" />

      <div className="ean-preloader-mark absolute inset-0 flex flex-col items-center justify-center gap-7">
        <svg viewBox="0 0 260 110" className="w-[min(64vw,320px)]">
          <defs>
            {/*
              Laid along the arc's own endpoints, so the trail is transparent at
              the tail and solid at the head. The jet flies toward the solid
              end, which means whatever is behind it is always the faded part —
              a vapour dissolve for the cost of one gradient.
            */}
            <linearGradient
              id="ean-preloader-trail-gradient"
              gradientUnits="userSpaceOnUse"
              x1="14"
              y1="90"
              x2="246"
              y2="22"
            >
              <stop className="ean-preloader-stop-tail" offset="0%" />
              <stop className="ean-preloader-stop-mid" offset="60%" />
              <stop className="ean-preloader-stop-head" offset="100%" />
            </linearGradient>
          </defs>

          <path
            className="ean-preloader-arc fill-none stroke-white/25"
            d={ARC_PATH}
            pathLength="1"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            className="ean-preloader-trail fill-none"
            d={ARC_PATH}
            pathLength="1"
            stroke="url(#ean-preloader-trail-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <g className="ean-preloader-plane">
            <g className="ean-preloader-bank">
              <path className="fill-white" d={JET_PATH} />
            </g>
          </g>
        </svg>

        <div className="flex flex-col items-center gap-3">
          {/* The trailing letter-space of `tracking` shifts the word off centre;
              the matching start padding cancels it. Letters are split so they
              can stagger — globals.css keys the delays off :nth-child. */}
          <span className="font-display text-[clamp(1.5rem,5.5vw,2.25rem)] leading-none tracking-[0.42em] ps-[0.42em] text-ean-white">
            <span className="ean-preloader-letter inline-block">E</span>
            <span className="ean-preloader-letter inline-block">A</span>
            <span className="ean-preloader-letter inline-block">N</span>
          </span>
          <span className="ean-preloader-rule h-px w-16 bg-white/25" />
        </div>
      </div>
    </div>
  );
}
