import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_NAME, ui, routes, type Lang } from '../i18n';
import { getPosts } from './posts';

export async function feed(context: APIContext, lang: Lang) {
  const posts = await getPosts(lang);
  return rss({
    title: `${SITE_NAME} (${lang.toUpperCase()})`,
    description: ui[lang].description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: routes.article(lang, post.data.slug),
      categories: [post.data.topic],
    })),
    customData: `<language>${lang === 'fr' ? 'fr-FR' : 'en-US'}</language>`,
  });
}
