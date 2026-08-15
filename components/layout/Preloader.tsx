/**
 * Opening veil over the hero.
 *
 * Deliberately a Server Component with a pure CSS fade: the previous version
 * held an opaque full-viewport overlay in the server HTML and only tore it
 * down once GSAP had hydrated, which pushed first paint behind the entire
 * client bundle. The fade now runs off the compositor on the first frame and
 * the layer is `pointer-events-none` throughout, so it never gates content or
 * input. Do not reintroduce a JS-controlled unmount here.
 */
export default function Preloader() {
  return (
    <div
      aria-hidden="true"
      className="ean-preloader fixed inset-0 z-9999 bg-ean-navy pointer-events-none"
    />
  );
}
