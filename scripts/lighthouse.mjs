// Runs Lighthouse (mobile, the default) on key pages of the built site and fails
// if any category scores below 90. Reports go to qa-output/lighthouse/.

import fs from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { serve } from './serve.mjs';

const port = 4400;
const pages = [
  '/',
  '/fr/',
  '/articles/americans-run-on-momentum/',
  '/fr/articles/trouver-un-logement/',
  '/topics/',
  '/fr/themes/argent/',
  '/about/',
];
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

const server = await serve(port);
const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROMIUM_PATH || undefined,
  chromeFlags: ['--headless=new', '--no-sandbox'],
});
fs.mkdirSync('qa-output/lighthouse', { recursive: true });

let failed = false;
const rows = [];
for (const path of pages) {
  const result = await lighthouse(`http://localhost:${port}${path}`, {
    port: chrome.port,
    output: 'html',
    onlyCategories: categories,
    logLevel: 'error',
  });
  const scores = categories.map((c) => Math.round(result.lhr.categories[c].score * 100));
  const name = path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
  fs.writeFileSync(`qa-output/lighthouse/${name}.html`, result.report);
  rows.push({ path, ...Object.fromEntries(categories.map((c, i) => [c, scores[i]])) });
  if (scores.some((s) => s < 90)) failed = true;
}

await chrome.kill();
server.close();
console.table(rows);
fs.writeFileSync('qa-output/lighthouse/summary.json', JSON.stringify(rows, null, 2));
if (failed) {
  console.error('Lighthouse: at least one score is below 90.');
  process.exit(1);
}
console.log('Lighthouse: every category is 90 or above on every page.');
