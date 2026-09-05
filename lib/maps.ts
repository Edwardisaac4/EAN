/**
 * Google Maps URL builders for the Lagos HQ pin.
 *
 * All three use documented, key-free endpoints, which is the whole point: this
 * project has no `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and adding one would mean a
 * billing account, a referrer-restricted key and a quota to watch for a single
 * static pin. `output=embed` renders the same tiles for free, and the
 * `/maps/dir/?api=1` and `/maps/search/?api=1` forms are Google's official
 * cross-platform URL scheme — on a phone they hand off to the native Maps app
 * rather than opening a browser tab.
 *
 * The query is the **plus code**, not the street address and not a bare
 * lat/lng. All three would land in roughly the same place, but the plus code is
 * the only one that is both exact and legible: it is a coordinate (eleven
 * characters resolve to a ~3m cell) that Google echoes back as a readable
 * destination name instead of a decimal pair. Geocoding "FAAN Transit Camp
 * Road" was never an option — it resolves in neither Google's index nor
 * OpenStreetMap.
 *
 * `lat`/`lng` are still carried because two consumers need real numbers: the
 * `GeoCoordinates` in `lib/seo.ts`, and any future non-Google map.
 *
 * The one thing a built URL cannot do is name the pin. A keyless embed renders
 * whatever the query was -- so a built URL pins "6FR5H8GG+C7R", not "EAN
 * Aviation, FBO (DNMM/LOS)". Only a query bound to the Google Business listing
 * carries the name, which is what `embedUrl` holds; the built URL below is now
 * the fallback for a location that has no listing.
 */

export interface MapPin {
  /** Open Location Code, global (unshortened) form — the routing query. */
  plusCode: string;
  lat: number;
  lng: number;
  /** Human name. Used for the accessible frame title and analytics. */
  label: string;
  /** Google's own formatting of the address, shown on the map card. */
  formattedAddress: string;
  /**
   * Google Place ID, once the business listing is claimed. Optional — with it,
   * the pin stops reading as a plus code and starts reading "EAN Jet Center",
   * and directions pick up the verified entrance and hours.
   */
  placeId?: string;
  /** Embed zoom. 17 frames the hangar and its apron; 14 shows the airport. */
  zoom?: number;
  /**
   * `src` from Google Maps -> Share -> Embed a map. The only key-free way to
   * get a pin that reads as the business rather than as its coordinates, so it
   * overrides the built URL when set.
   *
   * Its `pb` payload is an undocumented but stable field list, `!<index><type>`
   * per field. The four that matter, and which `LAGOS_HQ.map` has already been
   * corrected on:
   *
   *   `1d<metres>`  vertical extent of the viewport -- the zoom
   *   `2d<lng>`     viewport centre longitude
   *   `3d<lat>`     viewport centre latitude
   *   `1s<hex:hex>` the place's feature ID; this is what names the pin
   *   `5e0` / `5e1` roadmap / satellite
   *
   * The centre is independent of the marker, so a share taken from a panned
   * view centres somewhere other than the place -- harmless when zoomed out to
   * a whole city, which is why it goes unnoticed, and fatal once you zoom in.
   * Verify a change by fetching the URL: the response carries the resolved
   * marker coordinate and the place name as plain text.
   */
  embedUrl?: string;
}

/** Which tiles the embed draws. `t=k` and `t=h` both resolve to Google's `5e1`. */
export type MapView = "map" | "satellite";

const MAPS_ORIGIN = "https://www.google.com";

/**
 * `src` for the embedded iframe. Not the JS Embed API — no key, no script.
 *
 * Google answers this with a 301 to `/maps/embed?…` on the same origin, so the
 * `frame-src https://www.google.com` entry in `next.config.ts` covers both hops.
 */
export function mapEmbedUrl(pin: MapPin, view: MapView = "satellite"): string {
  // Map type is one field in the `pb` payload rather than something baked in,
  // so a listing-bound embed keeps the view toggle instead of forfeiting it.
  if (pin.embedUrl) {
    return pin.embedUrl.replace(/!5e[01]/, view === "satellite" ? "!5e1" : "!5e0");
  }
  const q = encodeURIComponent(pin.plusCode);
  const t = view === "satellite" ? "k" : "m";
  return `${MAPS_ORIGIN}/maps?q=${q}&z=${pin.zoom ?? 17}&t=${t}&hl=en&output=embed`;
}

/** `6FR5H8GG+C7R` -> `H8GG+C7R` -- the form a local reads and types. */
export function shortPlusCode(plusCode: string): string {
  return plusCode.length > 8 ? plusCode.slice(4) : plusCode;
}

/**
 * Turn-by-turn from wherever the visitor is. Deliberately omits `origin` so
 * Maps uses the device's own location — which is why this has to be a link out
 * and not something the embed can do: `Permissions-Policy: geolocation=()` in
 * `next.config.ts` blocks geolocation for this origin and every frame in it.
 */
export function mapDirectionsUrl({ plusCode, placeId }: MapPin): string {
  const params = new URLSearchParams({ api: "1", destination: plusCode });
  if (placeId) params.set("destination_place_id", placeId);
  return `${MAPS_ORIGIN}/maps/dir/?${params.toString()}`;
}

/** Opens the pin itself — for saving the location rather than navigating to it. */
export function mapPlaceUrl({ plusCode, placeId }: MapPin): string {
  const params = new URLSearchParams({ api: "1", query: plusCode });
  if (placeId) params.set("query_place_id", placeId);
  return `${MAPS_ORIGIN}/maps/search/?${params.toString()}`;
}
