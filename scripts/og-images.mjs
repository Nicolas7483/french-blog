// Renders the Open Graph share images (public/og-en.png and public/og-fr.png).
// Run again after changing the site name or tagline: npm run og
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const font = (pkg, file) =>
  `data:font/woff2;base64,${fs.readFileSync(path.resolve('node_modules', pkg, 'files', file)).toString('base64')}`;
const name = 'Pas de Panique';
const cards = {
  en: 'Moving to the US from France? Here is what nobody tells you.',
  fr: 'Tu pars vivre aux <span class="nw">États-Unis\u00a0?</span> Voici ce que personne ne te dit.',
};

const html = (tagline) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Literata; src: url(${font('@fontsource-variable/literata', 'literata-latin-wght-normal.woff2')}); font-weight: 200 900; }
@font-face { font-family: Instrument; src: url(${font('@fontsource-variable/instrument-sans', 'instrument-sans-latin-wght-normal.woff2')}); font-weight: 400 700; }
body { margin: 0; width: 1200px; height: 630px; background: #faf7f2; color: #1d1b18; font-family: Literata; }
.page { position: absolute; inset: 0; padding: 88px 96px 72px 176px; display: flex; flex-direction: column; justify-content: space-between;
  background-image: repeating-linear-gradient(to bottom, transparent 0 47px, #e7dfd2 47px 48px); }
.page::before { content: ''; position: absolute; left: 136px; top: 0; bottom: 0; border-left: 2px solid #d98c7e; }
.nw { white-space: nowrap; }
h1 { text-wrap: balance; font-size: 76px; line-height: 1.12; font-weight: 600; margin: 0; letter-spacing: -0.5px; }
p { margin: 0; font-family: Instrument; font-size: 30px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #a8321f; }
</style></head><body><div class="page"><h1>${tagline}</h1><p>${name}</p></div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [lang, tagline] of Object.entries(cards)) {
  await page.setContent(html(tagline), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/og-${lang}.png` });
}
await browser.close();
