import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { FutureProgramme } from '@/lib/future-constants';

type TileSize = FutureProgramme['tile']['size'];

/**
 * The corner notch.
 *
 * A chamfer off the top-right corner, cut with `clip-path` rather than drawn
 * with a pseudo-element, so it clips the photograph itself and not a frame laid
 * over it. The two sizes are not proportional to the tile: the notch is a
 * constant, like a bleed mark, so a third-width tile carries the same cut as a
 * full-width one and the page reads as one set of objects.
 *
 * It is the one thing on this page that is not from the design system. The
 * system's cards are 14px rounded rectangles; the mosaic is the reference the
 * client asked for, and the notch is its signature. Everything inside the tile
 * — type, motion, colour — is the system's.
 */
const NOTCH =
  '[clip-path:polygon(0_0,calc(100%-18px)_0,100%_20px,100%_100%,0_100%)] md:[clip-path:polygon(0_0,calc(100%-27px)_0,100%_31px,100%_100%,0_100%)]';

/**
 * Aspect per column span. Portrait on mobile in every case, because a tile that
 * keeps its landscape ratio at 390px is 180px tall and the numeral has nowhere
 * to live; landscape only returns at `md`, and only for the full-width tile.
 */
const ASPECT: Record<TileSize, string> = {
  full: 'aspect-[912/1340] md:aspect-[1280/679]',
  half: 'aspect-[370/539] md:aspect-[89/97]',
  third: 'aspect-[370/539] md:aspect-[46/67]',
};

/**
 * The numeral's type ramp — Rosario, because the system gives it numbers as
 * well as headings, and at `-0.02em` because every Rosario setting carries it.
 *
 * It scales with the cell rather than staying fixed: held at one size it would
 * fill a third-width tile corner to corner and merely annotate a full-width
 * one. What is held constant is its *relation* to the tile.
 */
const NUMERAL: Record<TileSize, string> = {
  full: 'text-[64px] md:text-[180px]',
  half: 'text-[64px] md:text-[128px]',
  third: 'text-[52px] md:text-[88px]',
};

/** `sizes`, so the browser fetches a third-width tile at a third the width. */
const SIZES: Record<TileSize, string> = {
  full: '100vw',
  half: '(min-width: 768px) 50vw, 100vw',
  third: '(min-width: 768px) 33vw, 100vw',
};

interface ProductTileProps {
  programme: FutureProgramme;
  /** Only the first tile takes it — it is the LCP element on this route. */
  priority?: boolean;
}

/**
 * One programme, as a photograph with a number on it, linking to its page.
 *
 * All transitions run at 400ms on the system's default easing. §21 rules out
 * "transitions faster than 350ms", which is the opposite of what most UI kits
 * default to and is the most recognisable thing about how this system feels —
 * the 150ms hover that would be normal elsewhere is wrong here.
 *
 * No resting shadow, per §21's "shadows on content cards". The lift comes from
 * the photograph scaling inside a fixed frame, which is motion the tile already
 * owns.
 *
 * The entrance is not here. It belongs to the mosaic, which sequences the tiles
 * off one ScrollTrigger per row via `data-reveal` — see DsReveal.
 */
export default function ProductTile({ programme, priority = false }: ProductTileProps) {
  const { number, name, headline, slug, tile } = programme;
  const { image, alt, size, imagePosition } = tile;

  return (
    <Link
      href={`/airborne/${slug}`}
      data-reveal
      aria-label={`${name} — ${headline}`}
      className={`group relative block w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ds-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ds-canvas ${ASPECT[size]} ${NOTCH}`}
    >
      <Image
        src={image}
        alt={alt}
        fill
        sizes={SIZES[size]}
        priority={priority}
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
        className="object-cover transition-transform duration-[400ms] ease-ds-default group-hover:scale-[1.04]"
      />

      {/*
        The scrim. Half these images are daylight renders with pale skies, and
        white type sits on them unreadably without it. Weighted to the bottom,
        where the type is, rather than flat across the frame, so the picture
        survives above it.

        Set in the system's own near-black rather than a literal black: the
        page's darkest value is Afterburn, and a true #000 gradient reads colder
        than anything else on a linen ground.
      */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(8,0,0,0.82) 0%, rgba(8,0,0,0.28) 45%, transparent 100%)',
        }}
      />

      <span
        aria-hidden
        className={`pointer-events-none absolute top-4 left-6 font-ds-display font-bold leading-none tracking-[-0.02em] text-ds-skyway/25 transition-colors duration-[400ms] ease-ds-default group-hover:text-ds-skyway/40 md:top-7 md:left-7 ${NUMERAL[size]}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {number}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <h3
          className={`mb-2 flex items-center gap-2 font-ds-display font-semibold tracking-[-0.02em] text-ds-skyway md:mb-2.5 ${
            size === 'third' ? 'text-[18px] md:text-[20px]' : 'text-[20px] md:text-[26px]'
          }`}
        >
          {name}
          <ArrowUpRight
            aria-hidden
            className="size-[0.8em] shrink-0 -translate-x-1 opacity-0 transition duration-[400ms] ease-ds-default group-hover:translate-x-0 group-hover:opacity-100"
          />
        </h3>
        <p className="font-ds-body text-[15px] leading-[1.6] text-ds-skyway/70 md:text-[16px]">
          {headline}
        </p>
      </div>
    </Link>
  );
}
