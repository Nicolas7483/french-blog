import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sitemapPaths } from './pages';

const pages = [...sitemapPaths(), '/this-page-does-not-exist/'];

async function headingLevels(page: Page) {
  return page.$$eval('h1, h2, h3, h4, h5, h6', (hs) => hs.map((h) => Number(h.tagName[1])));
}

test.describe('accessibility', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`axe finds no serious issues (${scheme} mode)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      const report: string[] = [];
      for (const path of pages) {
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .analyze();
        for (const v of results.violations) {
          report.push(`${path} [${v.impact}] ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        }
      }
      // Zero violations of any impact, so moderate and minor issues do not creep in either.
      expect(report, report.join('\n')).toEqual([]);
    });
  }

  test('heading order never skips a level and there is one h1', async ({ page }) => {
    for (const path of pages) {
      await page.goto(path);
      const levels = await headingLevels(page);
      expect(levels[0], path).toBe(1);
      expect(levels.filter((l) => l === 1), path).toHaveLength(1);
      levels.forEach((l, i) => {
        if (i > 0) expect(l - levels[i - 1], `${path} heading ${i}`).toBeLessThanOrEqual(1);
      });
    }
  });

  test('images have alt text', async ({ page }) => {
    for (const path of pages) {
      await page.goto(path);
      await expect(page.locator('img:not([alt])'), path).toHaveCount(0);
    }
  });

  test('keyboard: skip link comes first and moves focus to the content', async ({ page }) => {
    await page.goto('/articles/tipping-in-the-us/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const inMain = await focused.evaluate((el) => !!el.closest('main'));
    expect(inMain).toBe(true);
  });

  test('keyboard: every link can be reached and shows a visible focus ring', async ({ page }) => {
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/');
      // Number every link so identical links (header and footer) count separately.
      const total = await page.$$eval('a[href]', (links) => {
        links.forEach((a, i) => a.setAttribute('data-kb', String(i)));
        return links.length;
      });
      const seen = new Set<string>();
      for (let i = 0; i < total + 2; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const cs = getComputedStyle(el);
          return { key: el.getAttribute('data-kb') ?? el.tagName, outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
        });
        if (info.key === 'BODY') continue;
        seen.add(info.key);
        expect(info.outline, info.key).not.toBe('none');
        expect(info.width, info.key).toBeGreaterThanOrEqual(2);
      }
      expect(seen.size).toBe(total);
    }
  });
});

test.describe('responsive', () => {
  for (const width of [375, 768, 1280]) {
    test(`no horizontal scroll, readable lines and big enough tap targets at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of pages) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `horizontal scroll on ${path}`).toBeLessThanOrEqual(0);

        // Characters per line in body text: aim for 45 to 80.
        const perLine = await page.$$eval('.prose p, .hero__intro, .post-card__summary', (els) => {
          const ctx = document.createElement('canvas').getContext('2d')!;
          return els.map((el) => {
            const cs = getComputedStyle(el);
            ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            const sample = 'the quick brown fox jumps over the lazy dog and keeps going ';
            const avg = ctx.measureText(sample).width / sample.length;
            return Math.round(el.getBoundingClientRect().width / avg);
          });
        });
        for (const n of perLine) expect(n, `line length on ${path}`).toBeLessThanOrEqual(85);

        // WCAG 2.2 target size: 24px minimum, text links inside sentences are exempt.
        // Navigation and filters aim higher, at 44px tall.
        const targets = await page.$$eval('a[href]', (links) =>
          links
            .filter((a) => !a.closest('.prose p, .prose li, .article__note, .not-found p, .hero p'))
            .filter((a) => a.getBoundingClientRect().width > 0)
            .map((a) => {
              const r = a.getBoundingClientRect();
              const big = !!a.closest('.site-nav, .site-footer__links, .filters');
              return { text: a.textContent!.trim(), h: r.height, w: r.width, big };
            }),
        );
        for (const t of targets) {
          expect(t.h, `height of "${t.text}" on ${path}`).toBeGreaterThanOrEqual(t.big ? 44 : 24);
          expect(t.w, `width of "${t.text}" on ${path}`).toBeGreaterThanOrEqual(24);
        }
      }
    });
  }
});
