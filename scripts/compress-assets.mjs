// One-off asset compressor. Resizes oversized PNGs and re-quantizes them
// in-place so the EAS upload + on-device install footprint shrinks.
//
// Strategy (chosen so visible quality is unchanged on real device pixels):
//   - icons/      1024 -> 384, palette PNG, quality 70-85
//   - characters/ 1024 -> 512, palette PNG, quality 70-90
//   - q/          already pngquanted in commit ff4babf, leave alone
//   - maps & onboarding bg: keep 1024, palette PNG, quality 70-90
//
// Run: node scripts/compress-assets.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');

const jobs = [
  // dir, resize-to (or null to keep size), palette quality range
  { dir: 'icons',      resize: 384, quality: [70, 85] },
  { dir: 'characters', resize: 512, quality: [70, 90] },
  // q/ images are already pngquanted in commit ff4babf. Re-running sharp
  // with effort=10 picks up extra zlib gains without touching the palette.
  { dir: 'q',          resize: null, quality: [80, 90] },
];

// Top-level map PNGs + onboarding bg - keep size, just compress.
const topLevelTargets = [
  'map-egypt.png',
  'map-greece.png',
  'map-persia.png',
  'map-italy.png',
  'map-vikings.png',
  'map-china.png',
  'map-byzantine.png',
  'world-map.png',
  'onboarding/bg.png',
];

async function compressOne(absPath, { resize, quality }) {
  const before = (await fs.stat(absPath)).size;
  const buf = await fs.readFile(absPath);
  let pipeline = sharp(buf);
  if (resize) {
    pipeline = pipeline.resize(resize, resize, { fit: 'inside', withoutEnlargement: true });
  }
  const out = await pipeline
    .png({
      palette: true,
      quality: quality[1],
      effort: 9,
      compressionLevel: 9,
      colors: 256,
      dither: 1.0,
    })
    .toBuffer();
  // Only write if smaller
  if (out.length < before) {
    await fs.writeFile(absPath, out);
    return { before, after: out.length };
  }
  return { before, after: before, skipped: true };
}

function fmt(n) {
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

async function run() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const { dir, resize, quality } of jobs) {
    const abs = path.join(ASSETS, dir);
    const files = (await fs.readdir(abs)).filter((f) => f.endsWith('.png'));
    console.log(`\n[${dir}] ${files.length} PNGs, resize=${resize ?? 'none'}`);
    for (const f of files) {
      const p = path.join(abs, f);
      const r = await compressOne(p, { resize, quality });
      totalBefore += r.before;
      totalAfter += r.after;
      const tag = r.skipped ? ' (kept original)' : '';
      console.log(`  ${f}: ${fmt(r.before)} -> ${fmt(r.after)}${tag}`);
    }
  }

  console.log(`\n[top-level maps + onboarding bg] keep-size compress`);
  for (const rel of topLevelTargets) {
    const p = path.join(ASSETS, rel);
    try {
      const r = await compressOne(p, { resize: null, quality: [70, 90] });
      totalBefore += r.before;
      totalAfter += r.after;
      const tag = r.skipped ? ' (kept original)' : '';
      console.log(`  ${rel}: ${fmt(r.before)} -> ${fmt(r.after)}${tag}`);
    } catch (e) {
      console.log(`  ${rel}: SKIPPED (${e.message})`);
    }
  }

  console.log(`\nTOTAL: ${fmt(totalBefore)} -> ${fmt(totalAfter)} (saved ${fmt(totalBefore - totalAfter)})`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
