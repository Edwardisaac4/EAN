import React from 'react';

/**
 * Route entrance.
 *
 * A `template` re-mounts on every navigation where a `layout` does not, which is
 * the whole reason this file exists: it is the only App Router hook that fires on
 * a route change without holding the outgoing route mounted.
 *
 * Deliberately a Server Component with no JS of any kind — the animation is one
 * CSS class (`ean-enter-route`, in globals.css) on a wrapper div. AGENTS.md §8
 * requires content to paint without JavaScript, and a route transition driven by
 * a client effect would put the entire bundle in front of every navigation's LCP.
 *
 * Entrance only. There is no exit: the App Router unmounts the outgoing route
 * before this remounts, and `components/shared/Presence.tsx` — the tool that
 * holds a child mounted for its exit — is component-level, not route-level.
 * Faking one would mean keeping the old page in the tree, which is a far larger
 * change than the effect is worth.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="ean-enter-route">{children}</div>;
}
