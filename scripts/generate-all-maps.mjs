// Parallel map generator - runs N generate-region processes concurrently.
// Usage: GEMINI_API_KEY=... node scripts/generate-all-maps.mjs
import { spawn } from 'node:child_process';

const REGIONS = ['italy', 'greece', 'china', 'egypt', 'persia', 'byzantine', 'vikings'];
const CONCURRENCY = 3;

const queue = [...REGIONS];
let active = 0;
const results = [];

function runOne(region) {
  return new Promise((resolve) => {
    const child = spawn('node', ['scripts/generate-region.mjs', region], {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (out += d.toString()));
    child.on('close', (code) => {
      console.log(`\n=== ${region} (exit ${code}) ===\n${out}`);
      resolve({ region, code, out });
    });
  });
}

async function worker() {
  while (queue.length) {
    const region = queue.shift();
    if (!region) return;
    active++;
    const r = await runOne(region);
    results.push(r);
    active--;
  }
}

const workers = Array.from({ length: CONCURRENCY }, () => worker());
await Promise.all(workers);

console.log('\n====== DONE ======');
for (const r of results) {
  console.log(`  ${r.region}: exit ${r.code}`);
}
const failed = results.filter((r) => r.code !== 0);
if (failed.length) process.exit(1);
