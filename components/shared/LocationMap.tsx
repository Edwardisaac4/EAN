'use client';

import React, { useState } from 'react';
import { MapPin as MapPinIcon } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';

import { mapEmbedUrl, type MapPin } from '@/lib/maps';

interface LocationMapProps {
  pin: MapPin;
  /** The site of the pin, not the company. Names the frame for a screen reader. */
  title: string;
  className?: string;
}

/**
 * The Lagos HQ map. The map, and nothing else.
 *
 * **Roadmap only.** This carried a Satellite/Map toggle for a while, on the
 * argument that overhead imagery of the hangar and apron *is* the proposition
 * for an FBO. It cost more than it returned: a second control in a frame that
 * already has Google's, a second analytics event, and a chip sitting opposite
 * Google's own chrome. Anyone who wants the imagery is one tap from it inside
 * the embed.
 *
 * **No card over the tiles.** There was one — address, phone, hours, plus code,
 * two links out — floated onto the map from `lg` up. It went because the frame
 * could not hold both it and Google's own top-left 'View larger map' pill
 * without the two reading as a collision, and that pill is inside a
 * cross-origin iframe where nothing of ours can reach it. The card lost the
 * argument rather than the pill because everything it carried except the plus
 * code is already on the page, in the contact block above this section. What is
 * left here is the thing the section exists for.
 *
 * **The map is live on load.** An earlier pass held it behind a facade to save
 * the third-party request; that traded away the thing the section exists for.
 *
 * **The scroll guard survives, invisible.** A Maps embed captures one-finger
 * drag, so a thumb travelling down the contact page would pan the map instead
 * of scrolling past it. A transparent sheet takes the first tap and then gets
 * out of the way for good. The map is fully visible throughout — the guard
 * costs a gesture, not a view.
 */
export default function LocationMap({
  pin,
  title,
  className = '',
}: LocationMapProps) {
  const [isInteractive, setIsInteractive] = useState(false);

  const releaseGuard = () => {
    setIsInteractive(true);
    sendGAEvent('event', 'map_engage', {
      category: 'Location',
      label: pin.label,
    });
  };

  return (
    <div
      className={`relative h-112.5 sm:h-137.5 lg:h-162.5 w-full overflow-hidden bg-ean-navy ${className}`}
    >
      <iframe
        src={mapEmbedUrl(pin, 'map')}
        title={`Map showing ${title}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />

      {!isInteractive && (
        /*
         * The guard. A real button so a keyboard reaches it, but it draws
         * nothing over the tiles — only the hint chip is visible.
         */
        <button
          type="button"
          onClick={releaseGuard}
          onTouchStart={releaseGuard}
          aria-label="Enable panning and zooming on the map"
          className="absolute inset-0 z-20 cursor-pointer bg-transparent"
        >
          <span className="absolute right-4 top-4 inline-flex items-center gap-2 border border-white/25 bg-black/55 px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md sm:right-6 sm:top-6">
            <MapPinIcon className="h-3 w-3" aria-hidden />
            Tap to pan &amp; zoom
          </span>
        </button>
      )}
    </div>
  );
}
