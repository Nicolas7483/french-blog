import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

export type Post = CollectionEntry<'posts'>;

export async function getPosts(lang: Lang): Promise<Post[]> {
  const posts = await getCollection('posts', (p) => p.data.lang === lang && !p.data.draft);
  return posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.order - b.data.order,
  );
}

export async function getPostByKey(lang: Lang, key: string): Promise<Post | undefined> {
  return (await getPosts(lang)).find((p) => p.data.key === key);
}

/** Two related posts: the ones listed in frontmatter first, then same topic, then newest. */
export async function getRelated(post: Post, count = 2): Promise<Post[]> {
  const all = (await getPosts(post.data.lang)).filter((p) => p.data.key !== post.data.key);
  const picked: Post[] = [];
  const add = (p?: Post) => {
    if (p && !picked.includes(p) && picked.length < count) picked.push(p);
  };
  for (const key of post.data.related ?? []) add(all.find((p) => p.data.key === key));
  for (const p of all.filter((p) => p.data.topic === post.data.topic)) add(p);
  for (const p of all) add(p);
  return picked;
}

/** Reading time in minutes, at about 220 words per minute. */
export function readingTime(body = ''): number {
  const words = body.replace(/\]\([^)]*\)/g, ']').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
