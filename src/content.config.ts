import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    lang: z.enum(['en', 'fr']),
    // Shared by an article and its translation. Use the English slug.
    key: z.string(),
    topic: z.enum(['culture', 'money', 'settling-in', 'getting-here']),
    summary: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    // Keys of related articles, shown at the bottom of the article.
    related: z.array(z.string()).optional(),
    // Position in the list when several posts share a date.
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['en', 'fr']),
  }),
});

export const collections = { posts, pages };
