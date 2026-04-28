// Batch asset generator. Reads scripts/asset-manifest.json and generates
// every listed image via Gemini 2.5 Flash Image. Skips files that already exist
// so the script can be resumed after a failure.
//
// Usage: GEMINI_API_KEY=... node scripts/generate-assets.mjs [--concurrency=3]

import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const CONCURRENCY = parseInt(args.concurrency || '3', 10);

const manifestPath = path.resolve('scripts/asset-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const MODEL = 'gemini-2.5-flash-image';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

async function generateOne(item) {
  const outPath = path.resolve(item.out);
  if (fs.existsSync(outPath)) {
    return { item, skipped: true };
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const body = {
    contents: [{ role: 'user', parts: [{ text: item.prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    throw new Error('No image in response: ' + JSON.stringify(json).slice(0, 300));
  }
  const data = imgPart.inlineData?.data || imgPart.inline_data?.data;
  fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
  return { item, bytes: fs.statSync(outPath).size };
}

async function runPool(items, concurrency) {
  const queue = [...items];
  let done = 0, skipped = 0, failed = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try {
        const r = await generateOne(item);
        if (r.skipped) {
          skipped++;
          console.log(`[${++done}/${items.length}] skip ${item.out}`);
        } else {
          console.log(`[${++done}/${items.length}] ✓ ${item.out} (${r.bytes} bytes)`);
        }
      } catch (e) {
        failed++;
        done++;
        console.error(`[${done}/${items.length}] ✗ ${item.out}: ${e.message}`);
      }
    }
  });
  await Promise.all(workers);
  console.log(`\nDone. ${done - skipped - failed} generated, ${skipped} skipped, ${failed} failed.`);
  if (failed) process.exit(1);
}

console.log(`${manifest.length} items, concurrency=${CONCURRENCY}`);
await runPool(manifest, CONCURRENCY);
