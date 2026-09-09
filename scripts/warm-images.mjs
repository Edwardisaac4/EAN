/**
 * Pre-warm Vercel's optimized-image cache after a deploy, so no real visitor —
 * and no synthetic audit — is the one who pays for a transform.
 *
 * The problem this solves
 * -----------------------
 * Vercel keys its image cache on (project, `w`, `q`, normalised `Accept`,
 * content hash of the source). Two consequences matter here:
 *
 *   1. A redeploy does NOT cold the cache. Only changing a source file's bytes
 *      does. So a deploy that ships no photography changes needs no warming.
 *   2. When a photograph IS swapped, every cached variant of it dies at once.
 *      The next request for each `w`/`Accept` combination is a `MISS`, which
 *      means a synchronous decode-and-re-encode before a single byte is sent.
 *      That latency lands inside LCP.
 *
 * A GTmetrix or Lighthouse run that happens to be the first visitor after a
 * photography commit therefore measures transform time rather than the site,
 * which is why an unchanged codebase can score A one week and B the next. This
 * script removes the variable by making the warm-up a deploy step instead of a
 * coin flip.
 *
 * How the URL list is derived
 * ---------------------------
 * Rather than guessing at the `w`/`q` matrix, it reads the URLs Next actually
 * emitted: every `/_next/image?...` in the prerendered HTML under
 * `.next/server/app`. That is the exact set a browser can ask for, including
 * the srcset candidates and the Supabase-hosted blog covers, and it stays
 * correct automatically when a `sizes` prop or a `quality` changes.
 *
 * Requires a build first — the HTML it reads is a build artefact.
 *
 * Why each URL is fetched twice
 * -----------------------------
 * `Accept` is part of the cache key, normalised into buckets. Chromium sends an
 * AVIF-capable Accept and gets AVIF; Safari and older browsers land in the WebP
 * bucket. Warming one leaves the other cold, so both are requested.
 *
 * Usage
 * -----
 *   node scripts/warm-images.mjs                        # warms https://ean.aero
 *   node scripts/warm-images.mjs https://preview.url    # or a preview deploy
 *   WARM_BASE_URL=... node scripts/warm-images.mjs
 *   node scripts/warm-images.mjs --concurrency 4
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));

const BASE = (
  positional[0] ||
  process.env.WARM_BASE_URL ||
  process.env.VERCEL_URL ||
  "https://ean.aero"
).replace(/\/$/, "");
const base = BASE.startsWith("http") ? BASE : `https://${BASE}`;

/**
 * Modest on purpose. Every MISS is server CPU, and firing hundreds at once just
 * queues them behind each other while risking a rate limit — which would return
 * a fast error and leave the entry cold, the exact failure this script exists to
 * prevent.
 */
const CONCURRENCY = (() => {
  const i = args.indexOf("--concurrency");
  return i !== -1 && args[i + 1] ? Number(args[i + 1]) : 8;
})();

/**
 * The two `Accept` buckets that matter. Anything Chromium-shaped normalises to
 * the first; Safari and older browsers to the second.
 */
const ACCEPT_VARIANTS = [
  { label: "avif", value: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
  { label: "webp", value: "image/webp,image/*,*/*;q=0.8" },
];

const HTML_ROOT = path.resolve(".next/server/app");

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const htmlFiles = await walk(HTML_ROOT);
if (htmlFiles.length === 0) {
  console.error(
    `No prerendered HTML found under ${path.relative(process.cwd(), HTML_ROOT)}.\n` +
      "Run `npm run build` first — this script reads the URLs that build emitted.",
  );
  process.exit(1);
}

const urls = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/\/_next\/image\?url=[^"'\s\\]+/g)) {
    // The HTML is escaped for attribute context; the wire format is not.
    urls.add(match[0].replace(/&amp;/g, "&"));
  }
}

const targets = [...urls].flatMap((u) =>
  ACCEPT_VARIANTS.map((accept) => ({ url: base + u, accept })),
);

console.log(
  `Warming ${urls.size} image URLs x ${ACCEPT_VARIANTS.length} Accept variants ` +
    `= ${targets.length} requests against ${base} (concurrency ${CONCURRENCY})`,
);

const tally = { HIT: 0, MISS: 0, STALE: 0, OTHER: 0, FAILED: 0 };
/** Slowest responses, which are the transforms worth knowing about. */
const slowest = [];
let done = 0;

async function warm({ url, accept }) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: { Accept: accept.value, "User-Agent": "ean-aero-cache-warmer" },
      redirect: "follow",
    });
    // The body must be drained, not just headed. A HEAD or an abandoned body
    // can be served without the transform completing, which would report a
    // warm cache that is not actually populated.
    await res.arrayBuffer();
    const ms = Date.now() - started;
    const state = (res.headers.get("x-vercel-cache") || "OTHER").toUpperCase();

    if (!res.ok) {
      tally.FAILED++;
      console.log(`  ${res.status} ${accept.label}  ${url.slice(base.length, base.length + 110)}`);
      return;
    }
    tally[state in tally ? state : "OTHER"]++;
    slowest.push([ms, state, accept.label, url.slice(base.length)]);
  } catch (err) {
    tally.FAILED++;
    console.log(`  ERR ${accept.label}  ${err.message}`);
  } finally {
    done++;
    if (done % 100 === 0) process.stdout.write(`  ...${done}/${targets.length}\n`);
  }
}

// A shared cursor over one array, rather than fixed slices per worker. Response
// times here vary by two orders of magnitude between a HIT and a cold
// transform, so pre-partitioning would leave workers idle behind one slow chunk.
let cursor = 0;
await Promise.all(
  Array.from({ length: Math.max(1, CONCURRENCY) }, async () => {
    while (cursor < targets.length) {
      const target = targets[cursor++];
      await warm(target);
    }
  }),
);

slowest.sort((a, b) => b[0] - a[0]);

console.log("");
console.log(
  `HIT ${tally.HIT} · MISS ${tally.MISS} · STALE ${tally.STALE} · ` +
    `other ${tally.OTHER} · failed ${tally.FAILED}`,
);

if (slowest.length) {
  console.log("\nslowest responses (a cold transform looks like MISS + high ms):");
  for (const [ms, state, fmt, url] of slowest.slice(0, 10)) {
    console.log(`  ${String(ms).padStart(6)}ms  ${state.padEnd(5)} ${fmt.padEnd(4)} ${decodeURIComponent(url).slice(12, 110)}`);
  }
}

// A MISS here is the desired outcome, not an error: this run absorbed the
// transform so a visitor would not. A second consecutive run should be all HIT,
// which is the real check that warming worked.
if (tally.MISS > 0) {
  console.log(
    `\n${tally.MISS} transforms were absorbed by this run. Re-run to confirm they now report HIT.`,
  );
}
if (tally.FAILED > 0) process.exitCode = 1;
