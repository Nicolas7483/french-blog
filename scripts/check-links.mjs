// Checks every link in the built site (dist/): pages, assets, feeds, sitemaps
// and fragments. Absolute links to the site's own domain are checked against
// the local build. Pass --internal-only to skip external sites (for sandboxes
// without internet access); CI runs the full check.

import { LinkChecker } from 'linkinator';
import { serve } from './serve.mjs';

const site = (process.env.SITE_URL || 'https://pas-de-panique.netlify.app').replace(/\/$/, '');
const internalOnly = process.argv.includes('--internal-only');
const port = 5555;
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
  userAgent: 'Mozilla/5.0 (compatible; link-check)',
  urlRewriteExpressions: [{ pattern: new RegExp(`^${escaped}`), replacement: local }],
  linksToSkip: async (link) => internalOnly && /^https?:/.test(link) && !link.startsWith(local) && !link.startsWith(site),
});

server.close();

const broken = result.links.filter((l) => l.state === 'BROKEN');
const checked = result.links.filter((l) => l.state === 'OK');
const skipped = result.links.filter((l) => l.state === 'SKIPPED');
const unique = (links) => [...new Set(links.map((l) => l.url))];

console.log(`Links: ${unique(checked).length} unique OK, ${unique(skipped).length} skipped, ${broken.length} broken.`);
if (internalOnly && skipped.length) {
  console.log('External links not checked (--internal-only):');
  for (const url of unique(skipped)) console.log(`  ${url}`);
}
if (broken.length) {
  for (const l of broken) console.error(`  BROKEN ${l.status ?? ''} ${l.url}  (on ${l.parent})`);
  process.exit(1);
}
