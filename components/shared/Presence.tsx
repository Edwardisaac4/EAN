'use client';

import { useEffect, useState } from 'react';

interface PresenceProps {
  /** Whether the content should be shown. */
  show: boolean;
  /** Must match the exit animation duration in CSS, in milliseconds. */
  durationMs?: number;
  /** Receives the current phase so the child can pick its enter/exit classes. */
  children: (state: 'open' | 'closed') => React.ReactNode;
}

/**
 * Minimal stand-in for framer-motion's <AnimatePresence> for the single-child
 * case: holds the child mounted for `durationMs` after `show` flips false so a
 * CSS exit animation can play, then unmounts it.
 *
 * Deliberately renders no wrapper element — the child keeps whatever
 * positioning and layout classes it already had.
 */
export default function Presence({ show, durationMs = 200, children }: PresenceProps) {
  const [isMounted, setIsMounted] = useState(show);

  // Mounting on the way *in* has to be immediate, so it is adjusted during
  // render rather than in an effect — React re-renders before committing, so the
  // child never paints a frame in its closed state. Doing this in an effect
  // instead would flash one unstyled frame and trip react-hooks/set-state-in-effect.
  if (show && !isMounted) {
    setIsMounted(true);
  }

  useEffect(() => {
    // Only the way *out* needs to be deferred, to let the CSS exit animation run.
    if (show) return;

    const timer = setTimeout(() => setIsMounted(false), durationMs);
    return () => clearTimeout(timer);
  }, [show, durationMs]);

  if (!isMounted) return null;

  return <>{children(show ? 'open' : 'closed')}</>;
}
