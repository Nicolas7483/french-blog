# QA report

Date: 2026-09-27. This covers the launch build: 8 articles in English and French, 32 pages plus the 404, two RSS feeds and a sitemap.

## Summary

| Check | Result |
|---|---|
| `npm run build` (type check, build, privacy check) | Pass: 0 errors, 0 warnings, 0 hints |
| HTML validation (html-validate, recommended rules, 33 pages) | Pass, after 1 fix |
| Links (every page, asset, feed, sitemap and `#fragment`) | Internal: 39 unique URLs, 0 broken. External: see note below |
| Playwright functional tests | 41 of 41 pass |
| axe (WCAG 2.0/2.1/2.2 A and AA plus best practices), light and dark mode, every page | 0 violations of any impact |
| Responsive at 375, 768 and 1280 px | No horizontal scroll, lines of 85 characters or fewer, tap targets OK |
| Lighthouse, mobile, 7 key pages | Performance 98 to 100, Accessibility 100, Best Practices 100, SEO 100 |
| `npm run check:privacy` | Pass: no em dashes, no forbidden terms |

## What was tested

- **Pages:** the English and French home pages load, with the right `lang`, headline and the 3 "Start here" posts in order. All 16 articles load with their topic label, date, read time, body and 2 related posts. Each article's language switch leads to its translation.
- **Cross references:** "see the tipping article" and the other references in the copy are real links, and they go to the right article in both languages.
- **Topic filters:** "All" shows 8 posts, Culture 2, Money 3, Settling in 2, Getting here 1. The active filter is marked with `aria-current`. Topic labels on articles lead to their topic page. The French filters work too.
- **Navigation:** header, footer and wordmark links work, and the language switch keeps you on the same page for every page in the sitemap.
- **404:** unknown URLs return a real 404 status, with bilingual copy and `noindex`.
- **RSS and sitemap:** both feeds parse as RSS 2.0, have the right `<language>` and 8 items with absolute links that resolve. The sitemap parses, lists 32 URLs, leaves out the 404, and every URL returns 200.
- **SEO:** every page has a title of 70 characters or fewer, a meta description, a canonical URL, `hreflang` for en, fr and x-default, and Open Graph and Twitter tags. Both share images exist.
- **Accessibility:** axe runs on every page in light and dark mode, and color contrast passes in both. Each page has one h1 and no skipped heading levels. All images have alt text. On the keyboard, the skip link comes first, is visible and moves focus to the content. Every link on the home page can be reached with Tab and shows a 3px focus ring in both modes.
- **Responsive:** tested at 375, 768 and 1280 px. There is no horizontal scroll, and body text stays within 85 characters per line. Links outside running text are at least 24 px (WCAG 2.2). Header, footer and filter links are at least 44 px tall.
- **Privacy:** the check fails the build on any em dash, or on any term from the private `forbidden-terms.txt`, in the built site or the sources. I tested it by adding a test term and confirmed the build failed. I also swept the build and sources for the identifying terms I know of: no hits.

## What failed and what was fixed

1. **Home page `<title>` too long** (HTML validation, over 70 characters). The title used the full tagline, so I added a shorter per-language home title.
2. **Topic section headings were small tap targets** (18 px tall) on the topic index. I gave them more padding and they now pass 24 px.
3. **Meta descriptions on some topic pages were too short** (37 characters). I added a short site line after each topic description.
4. **A missing French label rendered as "undefined"** on French topic pages. I fixed the label, then added two safeguards: a type check that fails the build if the French labels are missing any English key (or the reverse), and a test that fails if any page contains "undefined", "null" or "NaN".
5. **The focus test counted duplicate links as one** (a test bug, not a site bug). The site was fine; the test now numbers each link.

## Notes and limits

- **External links:** this build environment's network policy blocks outside sites, so the 4 external links could not be checked from here: mon-vie-via.businessfrance.fr, travel.state.gov, uscis.gov and fr.usembassy.gov. The GitHub Actions QA workflow checks them on every push from a runner with normal internet access.
- **Design research:** the design galleries named in the brief (Awwwards, Godly, SiteInspire, Land-book, One Page Love, Minimal Gallery, Lapa Ninja) and the reference sites were blocked by the same network policy. References were confirmed through web search instead. The shortlist was: Craig Mod, Robin Rendle, Frank Chimero, Rest of World, Maggie Appleton, Jim Nielsen and Manuel Moreale. Nicolas picked the "Carnet" direction from 3 mockups.
- **Publish dates:** every article is dated 2026-09-27, the launch date. Change `date` in the frontmatter if you want to stagger them.
