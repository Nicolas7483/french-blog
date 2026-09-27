// Fails when the site leaks something it should not.
//
// 1. Any term from forbidden-terms.txt (one per line, case insensitive; lines
//    starting with # are comments). The file is private and never committed.
// 2. Any em dash, anywhere, as a character or an HTML entity.
//
// Scans the built site (dist/) and the source content (src/).

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TEXT = new Set(['.html', '.xml', '.txt', '.md', '.mdx', '.astro', '.ts', '.js', '.mjs', '.css', '.json', '.svg']);
const EM_DASH = [/\u2014/, /&mdash;/i, /&#8212;/, /&#x2014;/i];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return walk(p);
    return TEXT.has(path.extname(d.name)) ? [p] : [];
  });
}

if (!fs.existsSync(path.join(ROOT, 'dist'))) {
  console.error('check:privacy: dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const termsFile = path.join(ROOT, 'forbidden-terms.txt');
let terms = [];
if (fs.existsSync(termsFile)) {
  terms = fs
    .readFileSync(termsFile, 'utf8')
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter((t) => t && !t.startsWith('#'))
    .map((t) => t.normalize('NFC').toLowerCase());
} else {
  console.warn('check:privacy: forbidden-terms.txt not found, only checking for em dashes.');
}

const files = [...walk(path.join(ROOT, 'dist')), ...walk(path.join(ROOT, 'src'))];
const problems = [];

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').normalize('NFC').split('\n');
  lines.forEach((line, i) => {
    const where = `${path.relative(ROOT, file)}:${i + 1}`;
    if (EM_DASH.some((re) => re.test(line))) problems.push(`${where}  em dash`);
    const lower = line.toLowerCase();
    // Never print the term itself, so CI logs do not leak it either.
    terms.forEach((term, n) => {
      if (lower.includes(term)) problems.push(`${where}  forbidden term #${n + 1} (line ${n + 1} of forbidden-terms.txt)`);
    });
  });
}

if (problems.length) {
  console.error(`check:privacy: FAILED, ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`check:privacy: OK (${files.length} files, ${terms.length} forbidden terms, no em dashes).`);
