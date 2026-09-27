# Pas de Panique

A small, fast, static blog for young French people moving to the US. It comes in English (`/`) and French (`/fr/`).

Built with [Astro](https://astro.build), plain CSS and Markdown. It has no JavaScript on the page, no tracking, no backend and no database.

## Quick start

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # type check, build to dist/, then privacy check
npm run preview    # serve the built site
```

This needs Node 22.12 or newer.

## Project layout

```
src/
  content/
    posts/en/*.md        one file per English article
    posts/fr/*.md        one file per French article
    pages/en|fr/*.md     About and Disclaimer copy
  i18n.ts                site name, URLs, topic names, interface labels, home page copy
  views/                 page templates shared by both languages
  pages/                 routes (thin wrappers around views/)
  styles/global.css      design tokens (colors, type, spacing) and all styles
scripts/                 privacy check, link checker, Lighthouse, share images
tests/                   Playwright tests
```

## How to add a post

1. Create `src/content/posts/en/<slug>.md`:

   ```md
   ---
   title: "Opening a phone plan"
   slug: "opening-a-phone-plan"
   lang: "en"
   key: "opening-a-phone-plan"
   topic: "settling-in"          # culture | money | settling-in | getting-here
   summary: "One or two sentences. Used on cards, in search results and in social previews."
   date: 2026-10-15
   related: ["finding-a-place-to-live", "building-a-credit-score-from-zero"]   # optional
   ---

   Your text in Markdown. Use `## Headings` for sections.
   ```

2. Create the French version in `src/content/posts/fr/<french-slug>.md`. It needs the same `key`, the same `topic` and `lang: "fr"`. The `slug` can be in French. The language switch links the two versions through `key`.
   A post can exist in one language only. The language switch then falls back to the other language's home page.

3. To link to another article from inside the text, use a relative link to its slug:
   `[the housing article](../finding-a-place-to-live/)`. In French articles, use the French slug.

4. `related` lists the `key`s of articles to show under "Keep reading". If you leave it out, or list fewer than 2, the page fills in from the same topic automatically.

5. Run `npm run build`. The type check catches missing or misspelled frontmatter fields.

Other fields you can use: `updated` (a date), `draft: true` (hides the post) and `order` (sort order when posts share a date).

**Writing rules:** never use em dashes. The build fails if one slips in.
In French, put a non-breaking space before `: ; ? !` and use the typographic apostrophe `’`. The existing French files show the pattern.

## Changing the site name, home page or labels

Everything that differs between languages is in `src/i18n.ts`. That covers the site name (`SITE_NAME`), the home headline and intro, the "Start here" list, topic names and every interface label. The type check fails if the French labels are missing a key that the English ones have.

After changing the name or tagline, regenerate the social preview images with `npm run og`.

## Privacy guardrails

Create a file named `forbidden-terms.txt` at the root, with one term per line (employer, city, neighborhood, street, last name, and so on). `forbidden-terms.example.txt` shows the format. The file is in `.gitignore`, so never commit it and never remove that line.

```sh
npm run check:privacy
```

This scans the built site and all source files. It fails if it finds any forbidden term (ignoring case) or any em dash. It prints the file and line, and only a number for the term, so CI logs never leak the term itself. It also runs as part of every `npm run build`. The hosting build does not have the private file, so there it only checks for em dashes. Run the check locally before you push.

## QA

Build once, then run the checks:

```sh
npm run build
npm run qa:html                     # HTML validation (html-validate)
npm run qa:links                    # every internal and external link, plus #fragments
npm test                            # Playwright: pages, navigation, filters, 404, RSS, sitemap,
                                    #   SEO tags, axe in light and dark mode, heading order,
                                    #   keyboard focus, 375/768/1280 layouts, tap targets
npm run qa:lighthouse               # mobile Lighthouse on key pages, fails under 90
npm run qa                          # all of the above
```

The first time, run `npx playwright install chromium`. If you already have a Chromium binary, point to it with `CHROMIUM_PATH=/path/to/chrome`.
If your network blocks outside sites, use `node scripts/check-links.mjs --internal-only`.

GitHub Actions runs the full QA on every push (`.github/workflows/qa.yml`). The Lighthouse HTML reports are attached to each run.

## Deploy (Netlify, free tier)

Why Netlify and not GitHub Pages: a GitHub Pages address would be `<github-username>.github.io/french-blog`, and that puts the GitHub username in every link. A Netlify subdomain does not.

1. Log in at [app.netlify.com](https://app.netlify.com) and choose **Add new site > Import an existing project > GitHub**. Pick this repository.
2. Netlify reads `netlify.toml`, so the build command (`npm run build`), the publish folder (`dist`) and Node 22 are already set. Click **Deploy**.
3. Under **Site configuration > Change site name**, set the subdomain to `pas-de-panique`, so the site is at `https://pas-de-panique.netlify.app`.
   If that name is taken, pick another one. Then add an environment variable `SITE_URL=https://<your-name>.netlify.app` (with no trailing slash) and redeploy, so canonical URLs, the sitemap, RSS and share images point to the right address.
4. For a custom domain, add it under **Domain management** and set `SITE_URL` to it.

Every push to the production branch redeploys. Pull requests get preview URLs.

The 404 page (`dist/404.html`) is served automatically. Security headers and long caching for hashed assets are set in `netlify.toml`.
