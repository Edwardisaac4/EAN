import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { DS_EASE_PATHS } from '@/lib/ds-motion';

/*
 * Registers the §19 eases under their `ds-*` names. Imported for its side
 * effect by every client module that tweens with them, so the curves exist
 * whichever of those modules happens to load first.
 *
 * Module scope, per AGENTS.md §7 — and because CustomEase.create registers a
 * *global* name, doing it inside a component would re-register on every
 * StrictMode double-mount and every HMR patch. Kept out of lib/ds-motion.ts
 * because that module is read by Server Components and must stay GSAP-free.
 */
gsap.registerPlugin(CustomEase);
for (const [name, path] of Object.entries(DS_EASE_PATHS)) {
  CustomEase.create(name, path);
}
