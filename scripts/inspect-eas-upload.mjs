// Walks the project tree, applies .easignore (gitignore-style) the same way
// EAS Build does, and prints what would be uploaded — biggest folders first.
//
// Run: node scripts/inspect-eas-upload.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const ignore = require('ignore');

async function loadIgnore() {
  const ig = ignore();
  const easPath = path.join(ROOT, '.easignore');
  const gitPath = path.join(ROOT, '.gitignore');
  let usedFile;
  try {
    const txt = await fs.readFile(easPath, 'utf8');
    ig.add(txt);
    usedFile = '.easignore';
  } catch {
    const txt = await fs.readFile(gitPath, 'utf8');
    ig.add(txt);
    usedFile = '.gitignore';
  }
  // EAS always also excludes the .git directory itself
  ig.add('.git/');
  return { ig, usedFile };
}

async function walk(dir, ig, rel = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let out = [];
  for (const e of entries) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) {
      // Match against trailing-slash form for directories
      if (ig.ignores(r + '/')) continue;
      out = out.concat(await walk(path.join(dir, e.name), ig, r));
    } else if (e.isFile()) {
      if (ig.ignores(r)) continue;
      const st = await fs.stat(path.join(dir, e.name));
      out.push({ rel: r, size: st.size });
    }
  }
  return out;
}

function fmt(n) {
  if (n > 1024 * 1024) return (n / 1024 / 1024).toFixed(2) + ' MB';
  if (n > 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

const { ig, usedFile } = await loadIgnore();
console.log(`Using ${usedFile}\n`);
const files = await walk(ROOT, ig);
files.sort((a, b) => b.size - a.size);

const total = files.reduce((s, f) => s + f.size, 0);
console.log(`Files: ${files.length}`);
console.log(`Total: ${fmt(total)}\n`);

// Group by top-level dir / first path segment
const groups = new Map();
for (const f of files) {
  const top = f.rel.split('/')[0];
  groups.set(top, (groups.get(top) || 0) + f.size);
}
const sortedGroups = [...groups.entries()].sort((a, b) => b[1] - a[1]);
console.log('--- Top-level breakdown ---');
for (const [k, v] of sortedGroups) console.log(`  ${fmt(v).padStart(10)}  ${k}`);

console.log('\n--- 25 biggest files ---');
for (const f of files.slice(0, 25)) console.log(`  ${fmt(f.size).padStart(10)}  ${f.rel}`);
