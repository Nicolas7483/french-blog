// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is the public origin of the deployed site (no trailing slash).
// Set it in the host's environment variables once a domain is chosen.
const site = process.env.SITE_URL || 'https://pas-de-panique.netlify.app';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
});
