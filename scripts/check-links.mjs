// Checks every link in the built site (dist/): pages, assets, feeds, sitemaps
// and fragments. Absolute links to the site's own domain are checked against
// the local build. Some government sites answer 403 to scripts (bot
// protection), so external 403 and 429 answers are re-checked in a real
// headless browser before they count as broken. Pass --internal-only to skip external sites (for sandboxes
// without internet access); CI runs the full check.

import { LinkChecker } from 'linkinator';
import { chromium } from '@playwright/test';
import { serve } from './serve.mjs';
import { SITE_URL as site } from '../site-url.mjs';

const internalOnly = process.argv.includes('--internal-only');
const port = 5555;
// Official sites whose bot protection blocks every automated check from CI,
// even a real headless browser. A 403 from these is a warning to check by hand.
const BOT_BLOCKED_HOSTS = ['travel.state.gov'];
const local = `http://localhost:${port}`;
const escaped = site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const server = await serve(port);
const checker = new LinkChecker();
const result = await checker.check({
  path: `${local}/`,
  recurse: true,
  checkFragments: true,
  concurrency: 20,
  timeout: 20000,
  retryErrors: true,
  retryErrorsCount: 2,
  userAgent:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  headers: { accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'accept-language': 'en-US,en;q=0.9,fr;q=0.8' },
  urlRewriteExpressions: [{ pattern: new RegExp(`^${escaped}`), replacement: local }],
  linksToSkip: async (link) => internalOnly && /^https?:/.test(link) && !link.startsWith(local) && !link.startsWith(site),
});

server.close();

const unique = (links) => [...new Set(links.map((l) => l.url))];
let broken = result.links.filter((l) => l.state === 'BROKEN');

// Re-check external links blocked by bot protection in a real browser.
const blocked = unique(broken.filter((l) => !l.url.startsWith(local) && [403, 429].includes(l.status ?? 0)));
if (blocked.length) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const verified = [];
  for (const url of blocked) {
    const page = await browser.newPage();
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (res && res.status() < 400) verified.push(url);
    } catch {
      // Still broken.
    }
    await page.close();
  }
  await browser.close();
  for (const url of verified) console.log(`Verified in a browser (the site blocks scripts): ${url}`);
  broken = broken.filter((l) => !verified.includes(l.url));
}

const manual = unique(broken.filter((l) => l.status === 403 && BOT_BLOCKED_HOSTS.includes(new URL(l.url).host)));
for (const url of manual) console.warn(`WARNING could not verify automatically (bot protection), check by hand: ${url}`);
broken = broken.filter((l) => !manual.includes(l.url));

const checked = result.links.filter((l) => l.state === 'OK');
const skipped = result.links.filter((l) => l.state === 'SKIPPED');

console.log(`Links: ${unique(checked).length} unique OK, ${unique(skipped).length} skipped, ${broken.length} broken.`);
if (internalOnly && skipped.length) {
  console.log('External links not checked (--internal-only):');
  for (const url of unique(skipped)) console.log(`  ${url}`);
}
if (broken.length) {
  for (const l of broken) console.error(`  BROKEN ${l.status ?? ''} ${l.url}  (on ${l.parent})`);
  process.exit(1);
}
