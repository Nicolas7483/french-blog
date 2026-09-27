import { test, expect } from '@playwright/test';
import { sitemapPaths, articlePaths } from './pages';

test.describe('home', () => {
  test('English home loads with the start here list', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Pas de Panique/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Moving to the US from France? Here is what nobody tells you.',
    );
    const start = page.locator('.start-list__title a');
    await expect(start).toHaveText([
      'Americans run on momentum',
      'Making friends: find your community',
      'Finding a place to live when you have no credit history',
    ]);
    await expect(page.locator('.topic-group')).toHaveCount(4);
  });

  test('French home loads', async ({ page }) => {
    const res = await page.goto('/fr/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Voici ce que personne ne te dit');
    await expect(page.locator('.start-list__item')).toHaveCount(3);
  });
});

test.describe('articles', () => {
  const paths = articlePaths();

  test('there are 8 articles in each language', () => {
    expect(paths.filter((p) => !p.startsWith('/fr/'))).toHaveLength(8);
    expect(paths.filter((p) => p.startsWith('/fr/'))).toHaveLength(8);
  });

  for (const path of paths) {
    test(`loads ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('.article__header .topic-label')).toBeVisible();
      await expect(page.locator('.article__meta time')).toBeVisible();
      await expect(page.locator('.article__meta')).toContainText(/min/);
      await expect(page.locator('.prose p').first()).toBeVisible();
      await expect(page.locator('.related .post-card')).toHaveCount(2);
      // The translation link points at the other language's version of this article.
      const other = await page.locator('.site-header .lang-switch').getAttribute('href');
      expect(other).toMatch(path.startsWith('/fr/') ? /^\/articles\/.+\/$/ : /^\/fr\/articles\/.+\/$/);
      expect(paths).toContain(other);
    });
  }

  test('cross references in the copy are real links', async ({ page }) => {
    await page.goto('/articles/salary-vs-cost-of-living/');
    await page.getByRole('link', { name: 'the tipping article' }).click();
    await expect(page).toHaveURL(/\/articles\/tipping-in-the-us\/$/);
    await page.goto('/fr/articles/trouver-un-logement/');
    await page.getByRole('link', { name: 'l’article sur le credit score' }).click();
    await expect(page).toHaveURL(/\/fr\/articles\/construire-son-credit-score-en-partant-de-zero\/$/);
  });
});

test.describe('topics', () => {
  test('topic filters show only that topic', async ({ page }) => {
    await page.goto('/topics/');
    await expect(page.locator('.post-card')).toHaveCount(8);
    const filters = page.getByRole('navigation', { name: 'Filter by topic' });
    await expect(filters.getByRole('link', { name: 'All' })).toHaveAttribute('aria-current', 'page');

    const expected = { Culture: 2, Money: 3, 'Settling in': 2, 'Getting here': 1 };
    for (const [name, count] of Object.entries(expected)) {
      await filters.getByRole('link', { name }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
      await expect(page.locator('.post-card')).toHaveCount(count);
      await expect(filters.getByRole('link', { name })).toHaveAttribute('aria-current', 'page');
    }
  });

  test('French topic filters work', async ({ page }) => {
    await page.goto('/fr/themes/');
    const filters = page.getByRole('navigation', { name: 'Filtrer par thème' });
    await filters.getByRole('link', { name: 'Argent' }).click();
    await expect(page).toHaveURL(/\/fr\/themes\/argent\/$/);
    await expect(page.locator('.post-card')).toHaveCount(3);
  });

  test('topic label on an article leads to its topic page', async ({ page }) => {
    await page.goto('/articles/visas-and-the-job-hunt/');
    await page.locator('.article__header .topic-label').click();
    await expect(page).toHaveURL(/\/topics\/getting-here\/$/);
  });
});

test.describe('navigation', () => {
  test('header and footer links work', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('link', { name: 'Topics' }).click();
    await expect(page).toHaveURL(/\/topics\/$/);
    await nav.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
    await page.locator('.site-footer').getByRole('link', { name: 'Disclaimer' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Disclaimer');
    await page.locator('.wordmark').click();
    await expect(page).toHaveURL(/localhost:4321\/$/);
  });

  test('language switch keeps you on the same page', async ({ page }) => {
    await page.goto('/about/');
    await page.locator('.site-header .lang-switch').click();
    await expect(page).toHaveURL(/\/fr\/a-propos\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('À propos');
    await page.locator('.site-header .lang-switch').click();
    await expect(page).toHaveURL(/\/about\/$/);
  });

  test('every sitemap page has a working language switch', async ({ page }) => {
    const paths = sitemapPaths();
    for (const path of paths) {
      await page.goto(path);
      const href = await page.locator('.site-header .lang-switch').getAttribute('href');
      expect(paths, `switch on ${path}`).toContain(href);
    }
  });
});

test('404 page renders with a 404 status', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Back to the home page' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test.describe('feeds and sitemap', () => {
  for (const [path, count, lang] of [
    ['/rss.xml', 8, 'en-US'],
    ['/fr/rss.xml', 8, 'fr-FR'],
  ] as const) {
    test(`${path} is valid RSS`, async ({ page, request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const xml = await res.text();
      const info = await page.evaluate((xml) => {
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        return {
          error: doc.querySelector('parsererror')?.textContent ?? null,
          version: doc.documentElement.getAttribute('version'),
          title: doc.querySelector('channel > title')?.textContent,
          language: doc.querySelector('channel > language')?.textContent,
          items: [...doc.querySelectorAll('item')].map((i) => ({
            title: i.querySelector('title')?.textContent,
            link: i.querySelector('link')?.textContent,
            pubDate: i.querySelector('pubDate')?.textContent,
          })),
        };
      }, xml);
      expect(info.error).toBeNull();
      expect(info.version).toBe('2.0');
      expect(info.title).toBeTruthy();
      expect(info.language).toBe(lang);
      expect(info.items).toHaveLength(count);
      for (const item of info.items) {
        expect(item.title).toBeTruthy();
        expect(item.link).toMatch(/^https:\/\/.+\/articles\/.+\/$/);
        expect(Number.isNaN(Date.parse(item.pubDate!))).toBe(false);
        // Every feed item points at a page that exists.
        const local = await request.get(new URL(item.link!).pathname);
        expect(local.status()).toBe(200);
      }
    });
  }

  test('sitemap is valid and every URL exists', async ({ page, request }) => {
    const index = await (await request.get('/sitemap-index.xml')).text();
    expect(index).toContain('<sitemapindex');
    const xml = await (await request.get('/sitemap-0.xml')).text();
    const error = await page.evaluate(
      (xml) => new DOMParser().parseFromString(xml, 'application/xml').querySelector('parsererror')?.textContent ?? null,
      xml,
    );
    expect(error).toBeNull();
    const paths = sitemapPaths();
    // Home, about, disclaimer, topics index, 4 topics, 8 articles; in 2 languages.
    expect(paths).toHaveLength(32);
    expect(paths.some((p) => p.includes('404'))).toBe(false);
    for (const path of paths) expect((await request.get(path)).status(), path).toBe(200);
  });
});

test.describe('SEO tags', () => {
  test('every page has a title, description, canonical, hreflang and Open Graph tags', async ({ page, request }) => {
    for (const path of sitemapPaths()) {
      await page.goto(path);
      const title = await page.title();
      expect(title.length, path).toBeGreaterThan(5);
      expect(title.length, path).toBeLessThanOrEqual(70);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length, path).toBeGreaterThan(40);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1);
      for (const prop of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'og:locale']) {
        await expect(page.locator(`meta[property="${prop}"]`), `${prop} on ${path}`).toHaveCount(1);
      }
    }
    for (const img of ['/og-en.png', '/og-fr.png']) expect((await request.get(img)).status()).toBe(200);
  });
});

test('no page shows "undefined", "null" or "NaN" from a missing label', async ({ page }) => {
  for (const path of sitemapPaths()) {
    await page.goto(path);
    const html = await page.content();
    expect(html, path).not.toMatch(/\b(undefined|null|NaN)\b/);
  }
});
