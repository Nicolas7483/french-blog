import fs from 'node:fs';

/** Every page path listed in the built sitemap, e.g. "/fr/articles/trouver-un-logement/". */
export function sitemapPaths(): string[] {
  const xml = fs.readFileSync('dist/sitemap-0.xml', 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

export const articlePaths = () => sitemapPaths().filter((p) => /\/articles\/[^/]+\/$/.test(p));
