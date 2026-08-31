'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * The single image primitive — the prototype's `.ib`.
 *
 * Roughly sixty images across the site are the same construction: a fixed-ratio
 * box, an ink gradient sitting underneath, the photograph covering it, and a
 * slow zoom on hover. Building it once means the failure behaviour is uniform
 * too, which matters more than it sounds: a good part of the site's photography
 * is still awaiting clearance, so images that 404 are the expected case during
 * this rebuild rather than an edge case.
 *
 * When the source fails, the `<Image>` is unmounted and the gradient ground is
 * what remains. That is deliberately not a broken-image icon or an error
 * message — the ground reads as an intentionally dark panel, so a missing
 * photograph degrades to something that still looks designed.
 */

// next.config.ts pins `images.qualities` to exactly these three. Next 16
// answers a request for any other value with an HTTP 400, so the union here
// keeps that failure at compile time instead of at request time.
type AllowedQuality = 70 | 75 | 80;

interface ImageBlockProps {
  src: string;
  alt: string;
  /** CSS aspect-ratio, e.g. '3 / 4', '16 / 9'. */
  ratio?: string;
  sizes?: string;
  quality?: AllowedQuality;
  /** Only ever on a genuine above-the-fold LCP image, one per page. */
  priority?: boolean;
  zoom?: boolean;
  className?: string;
  imageClassName?: string;
}

export default function ImageBlock({
  src,
  alt,
  ratio = '16 / 9',
  sizes = '(max-width: 768px) 100vw, 50vw',
  quality = 80,
  priority = false,
  zoom = true,
  className = '',
  imageClassName = '',
}: ImageBlockProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden bg-linear-to-b from-ean-obsidian-elevated to-ean-black ${className}`}
      style={{ aspectRatio: ratio }}
      {...(failed ? { role: 'img', 'aria-label': alt } : {})}
    >
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          onError={() => setFailed(true)}
          className={`object-cover transition-transform duration-700 ease-out ${
            zoom ? 'motion-safe:group-hover:scale-[1.04]' : ''
          } ${imageClassName}`}
        />
      )}
    </div>
  );
}
