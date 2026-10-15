/**
 * One-off asset optimiser (not part of the site build).
 *
 * Most SVGs in public/ are Figma exports with a full-resolution bitmap inlined
 * as a base64 data URI (procrash.svg was 30MB on its own). Browsers download
 * those bytes verbatim and next/image cannot optimise SVG.
 *
 * For each SVG this script finds every embedded bitmap, downscales it to a
 * sensible maximum and re-encodes it losslessly-ish in a format the SVG renderers
 * already support: PNG (quantised palette) when the bitmap has alpha, JPEG
 * otherwise. The SVG structure, its vector overlays and every `src` reference
 * stay exactly as they were.
 *
 * Note: an earlier attempt re-encoded these as WebP. Browsers accept WebP in
 * <image>, but librsvg (used by sharp, ImageMagick and several build tools)
 * silently rendered them blank, so the output format is kept PNG/JPEG.
 *
 * Usage: node scripts/compress-svg-rasters.mjs [--dry]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('public');
const DRY = process.argv.includes('--dry');

// Anything rendered wider than this is downscaled. Solution mockups are shown at
// most ~800px wide, logos at ~40px.
const MAX_WIDTH = {
  'solutions': 1600,
  'photos': 1600,
  'proj': 1400,
  'hackathons': 1200,
  'techstack': 320,
  'exp_logos': 320,
  default: 1200,
};

const QUALITY = 78;
const PALETTE_COLORS = 128;

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.toLowerCase().endsWith('.svg')) yield full;
  }
}

const DATA_URI = /data:image\/(png|jpeg|jpg|gif|webp);base64,([A-Za-z0-9+/=]+)/g;

// Written into every file this script rewrites so a second run can't re-encode
// already-compressed rasters (which would compound generation loss).
const MARKER = '<!-- rasters-optimized -->';

let totalBefore = 0;
let totalAfter = 0;
let totalBeforeEmbedded = 0;
const changed = [];
const skipped = [];

for await (const file of walk(PUBLIC_DIR)) {
  const rel = path.relative(PUBLIC_DIR, file);
  const before = (await fs.stat(file)).size;

  if (before < 40 * 1024) continue; // already small enough

  const source = await fs.readFile(file, 'utf8');
  if (source.includes(MARKER)) {
    skipped.push(rel);
    continue;
  }
  const maxWidth = MAX_WIDTH[path.dirname(rel)] ?? MAX_WIDTH.default;

  const matches = [...source.matchAll(DATA_URI)];
  if (matches.length === 0) continue;

  let cursor = 0;
  let out = '';
  let embeddedBytes = 0;

  for (const match of matches) {
    const [full, mime, base64] = match;
    out += source.slice(cursor, match.index);
    cursor = match.index + full.length;

    const original = Buffer.from(base64, 'base64');
    try {
      // Anything with an alpha channel has to stay a format that keeps it.
      const { hasAlpha } = await sharp(original).stats();
      let converted;
      let outMime;
      if (mime === 'png' && hasAlpha) {
        converted = await sharp(original)
          .resize({ width: maxWidth, withoutEnlargement: true })
          .png({ palette: true, colors: PALETTE_COLORS, effort: 10, quality: 80 })
          .toBuffer();
        outMime = 'png';
      } else {
        converted = await sharp(original)
          .resize({ width: maxWidth, withoutEnlargement: true })
          .flatten({ background: '#101014' })
          .jpeg({ quality: QUALITY, mozjpeg: true })
          .toBuffer();
        outMime = 'jpeg';
      }
      embeddedBytes += original.length;
      out += `data:image/${outMime};base64,${converted.toString('base64')}`;
    } catch (err) {
      console.warn(`  ! could not convert one raster in ${rel}: ${err.message}`);
      out += full; // leave the original untouched
    }
  }
  out += source.slice(cursor);

  // Insert the marker right after the opening <svg ...> tag.
  out = out.replace(/<svg\b[^>]*>/, (tag) => `${tag}\n${MARKER}`);

  if (out === source) continue;

  if (!DRY) await fs.writeFile(file, out, 'utf8');

  const after = Buffer.byteLength(out, 'utf8');
  totalAfter += after;
  totalBeforeEmbedded += before;
  changed.push([rel, before, after]);
}

console.log(`\n${DRY ? '[dry run] ' : ''}SVGs with embedded rasters rewritten: ${changed.length}`);
for (const [rel, before, after] of changed.sort((a, b) => b[1] - a[1])) {
  console.log(
    `  ${rel.padEnd(34)} ${(before / 1024 / 1024).toFixed(2).padStart(7)}MB -> ${(after / 1024).toFixed(0).padStart(7)}KB`,
  );
}
console.log(
  `\ntotal embedded raster bytes: ${(totalBeforeEmbedded / 1024 / 1024).toFixed(1)}MB source files -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB rewritten (${changed.length} files)`,
);
if (skipped.length) {
  console.log(`already processed, left alone: ${skipped.length} file(s)`);
}