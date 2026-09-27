// The public address of the site, used for canonical URLs, the sitemap, RSS and share images.
// Order: SITE_URL if set (for a custom domain), then the production domain Vercel
// provides during its builds, then the default Vercel address.
export const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'https://pas-de-panique.vercel.app'
).replace(/\/$/, '');
