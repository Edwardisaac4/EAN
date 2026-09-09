/**
 * Re-encode everything under public/images so a cold Vercel image transform is
 * cheap, without giving up a single pixel the site can actually serve.
 *
 * Why this exists
 * ---------------
 * Vercel keys its optimized-image cache on (project, w, q, normalised Accept,
 * content hash of the source). A redeploy does NOT invalidate it, but changing
 * a source file's bytes does — so every photography swap sends all of that
 * image's cached variants cold, and the next visitor pays a full `MISS`
 * transform inside their LCP. The cost of that MISS is dominated by how many
 * megapixels sharp has to decode, which is why a 7200x3600 source scores
 * differently from a 1920x960 one that looks identical on screen.
 *
 * The resolution cap is free, not a compromise
 * --------------------------------------------
 * `images.deviceSizes` in next.config.ts tops out at 1920 and next/image never
 * upscales, so no request can ever be served more than 1920px on the long edge.
 * Capping the source there discards only pixels that were already unreachable.
 * Anything at or below the cap keeps its dimensions exactly and is only
 * re-encoded.
 *
 * Sharp edges worth knowing
 * -------------------------
 * - `.rotate()` is called with no arguments *before* any resize. Re-encoding
 *   drops EXIF, so a photograph carrying an orientation tag would come out
 *   sideways if the rotation were not baked into the pixels first.
 * - The ICC profile is deliberately kept. These are camera-original aviation
 *   photographs; several are wide-gamut, and dropping the profile makes a
 *   browser read them as sRGB, which shifts the livery blues and the lounge
 *   warm tones. Everything else in the metadata block goes.
 * - JPEG is re-encoded at 4:4:4. The default 4:2:0 halves the chroma planes,
 *   which is exactly what smears fine coloured detail — livery lettering,
 *   signage. That detail is the thing this script is trying not to lose.
 * - A file is only overwritten when the new encode is genuinely smaller. Some
 *   already-tuned assets round-trip larger; those are reported and left alone.
 * - A photograph stored as PNG cannot be fixed here. Switching it to JPEG would
 *   change its filename, which means editing the component that references it,
 *   so those are reported as follow-ups rather than converted silently.
 *
 * Usage
 * -----
 *   node scripts/optimize-images.mjs              # dry run, writes nothing
 *   node scripts/optimize-images.mjs --apply      # rewrite in place, after backup
 *   node scripts/optimize-images.mjs --apply --backup-dir <path>
 *   node scripts/optimize-images.mjs --apply --no-backup
 */

import { readdir, stat, readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Matches images.deviceSizes' ceiling in next.config.ts. Keep the two in step. */
const MAX_EDGE = 1920;

/**
 * 85 with full chroma, rather than a lower number with subsampling. Vercel
 * re-encodes to AVIF/WebP on top of this, so the source only has to be a clean
 * master — it is never the thing a browser downloads.
 */
const JPEG_QUALITY = 85;
const WEBP_QUALITY = 85;

/**
 * Below this, a re-encode is churn — but only for a file that is also within
 * the dimension cap. Byte size is a poor proxy for transform cost on its own:
 * flat vector-style artwork exported at 3000x2000 can weigh 29KB and still make
 * the optimizer decode six megapixels on every cold request. Dimensions are
 * checked first, so an oversized-but-light file is never skipped.
 */
const SKIP_UNDER_BYTES = 40 * 1024;

/** A PNG this large with no alpha is a photograph in the wrong container. */
const PNG_PHOTO_HINT_BYTES = 300 * 1024;

/**
 * A rewrite has to earn itself, and "smaller by any amount" is not enough.
 *
 * Overwriting a source changes its content hash, which colds every cached
 * variant of it on Vercel and hands the next visitor a full transform. Trading
 * that for a 1KB saving is a straight loss. It also matters that this script is
 * safe to re-run: without a floor, each pass re-encodes already-optimised JPEGs
 * for ~0% gain, stacking generational loss and colding the cache every time.
 *
 * A file that breaches the dimension cap is exempt — there the resize is the
 * entire point and always worth one rewrite.
 */
const MIN_SAVING_RATIO = 0.05;
const MIN_SAVING_BYTES = 8 * 1024;

const ROOT = path.resolve("public/images");
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const noBackup = args.includes("--no-backup");
const backupDir = (() => {
  const i = args.indexOf("--backup-dir");
  if (i !== -1 && args[i + 1]) return path.resolve(args[i + 1]);
  return path.resolve(".image-originals");
})();

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function fmt(bytes) {
  return bytes >= 1024 * 1024
    ? (bytes / 1048576).toFixed(2) + " MB"
    : Math.round(bytes / 1024) + " KB";
}

/**
 * Whether a file exceeds the dimension cap, regardless of how little it weighs.
 * Reads the header only — sharp does not decode pixels to answer `metadata()`.
 */
async function isOversized(file) {
  try {
    const meta = await sharp(file, { failOn: "none" }).metadata();
    return Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE;
  } catch {
    return false;
  }
}

/**
 * Builds the re-encoded buffer for one file, or explains why it was left alone.
 * A null buffer means "no change".
 */
async function reencode(file, sourceBytes) {
  const input = await readFile(file);
  let pipeline = sharp(input, { failOn: "none" });
  const meta = await pipeline.metadata();

  if (!meta.width || !meta.height) {
    return { buffer: null, note: "unreadable dimensions" };
  }

  // Orientation must be baked in before the EXIF that describes it is dropped.
  pipeline = pipeline.rotate().keepIccProfile();

  const longest = Math.max(meta.width, meta.height);
  const willResize = longest > MAX_EDGE;
  if (willResize) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? MAX_EDGE : undefined,
      height: meta.height > meta.width ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
      kernel: "lanczos3",
    });
  }

  let note = willResize ? `capped from ${meta.width}x${meta.height}` : "re-encoded only";

  switch (meta.format) {
    case "jpeg":
      pipeline = pipeline.jpeg({
        quality: JPEG_QUALITY,
        chromaSubsampling: "4:4:4",
        mozjpeg: true,
      });
      break;
    case "png": {
      // Both colour models are encoded and the smaller result wins, because
      // neither is reliably right and the metadata will not say which.
      //
      // Forcing 32-bit RGBA on flat artwork inflates it — a 3000x2000 logo went
      // 29KB -> 52KB that way, so the resize that would have cut its decode
      // cost got rejected as "not smaller". Quantising a true-colour photograph
      // or gradient to a palette bands it visibly instead. And `meta.palette`
      // cannot arbitrate: sharp leaves it undefined for that very file, so
      // trusting it silently picks the inflating branch.
      //
      // Encoding twice costs a little CPU on a handful of files and is never
      // wrong. Palette output is only accepted when it actually wins, so a
      // photograph keeps its full colour.
      if (!meta.hasAlpha && sourceBytes > PNG_PHOTO_HINT_BYTES) {
        note += " · opaque PNG, would shrink far more as JPEG (needs a code edit)";
      }
      const [asPalette, asTruecolor] = await Promise.all([
        pipeline.clone().png({ compressionLevel: 9, effort: 10, palette: true }).toBuffer(),
        pipeline.clone().png({ compressionLevel: 9, effort: 10, palette: false }).toBuffer(),
      ]);
      return {
        buffer: asPalette.length < asTruecolor.length ? asPalette : asTruecolor,
        width: meta.width,
        height: meta.height,
        note,
      };
    }
    case "webp":
      pipeline = pipeline.webp({ quality: WEBP_QUALITY, effort: 6 });
      break;
    case "avif":
      return { buffer: null, note: "avif, already minimal" };
    default:
      return { buffer: null, note: `unhandled format: ${meta.format}` };
  }

  const buffer = await pipeline.toBuffer();
  return { buffer, width: meta.width, height: meta.height, note };
}

const files = (await walk(ROOT)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));

let before = 0;
let after = 0;
let changed = 0;
const rows = [];
const followUps = [];

for (const file of files) {
  const sourceBytes = (await stat(file)).size;
  before += sourceBytes;

  if (sourceBytes < SKIP_UNDER_BYTES && !(await isOversized(file))) {
    after += sourceBytes;
    continue;
  }

  let result;
  try {
    result = await reencode(file, sourceBytes);
  } catch (err) {
    after += sourceBytes;
    rows.push([file, sourceBytes, sourceBytes, `FAILED: ${err.message}`]);
    continue;
  }

  if (!result.buffer) {
    after += sourceBytes;
    continue;
  }

  const saved = sourceBytes - result.buffer.length;
  const wasCapped = result.note.startsWith("capped");
  const worthIt =
    wasCapped ||
    (saved >= MIN_SAVING_BYTES && saved / sourceBytes >= MIN_SAVING_RATIO);

  if (saved <= 0 || !worthIt) {
    after += sourceBytes;
    rows.push([
      file,
      sourceBytes,
      sourceBytes,
      saved <= 0
        ? "kept — re-encode was larger"
        : `kept — only ${Math.round(saved / 1024)}KB (${Math.round((saved / sourceBytes) * 100)}%), not worth colding the cache`,
    ]);
    continue;
  }

  after += result.buffer.length;
  changed++;
  rows.push([file, sourceBytes, result.buffer.length, result.note]);
  if (result.note.includes("needs a code edit")) followUps.push(file);

  if (apply) {
    if (!noBackup) {
      const dest = path.join(backupDir, path.relative(ROOT, file));
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(file, dest);
    }
    await writeFile(file, result.buffer);
  }
}

rows.sort((a, b) => b[1] - b[2] - (a[1] - a[2]));
for (const [file, from, to, note] of rows) {
  const saved = from - to;
  const pct = from ? Math.round((saved / from) * 100) : 0;
  console.log(
    `${fmt(from).padStart(8)} -> ${fmt(to).padStart(8)}  ${String(pct).padStart(3)}%  ` +
      `${path.relative(ROOT, file)}  (${note})`,
  );
}

console.log("");
console.log(
  `${apply ? "APPLIED" : "DRY RUN"} · ${files.length} images scanned, ${changed} rewritten`,
);
console.log(
  `total ${fmt(before)} -> ${fmt(after)}  (${Math.round(((before - after) / before) * 100)}% smaller)`,
);
if (!apply) console.log("nothing was written — re-run with --apply");
else if (!noBackup) console.log(`originals copied to ${path.relative(process.cwd(), backupDir)}`);
if (followUps.length) {
  console.log("\nopaque PNGs that want a JPEG swap (filename change, so left alone):");
  for (const f of followUps) console.log("  " + path.relative(ROOT, f));
}
