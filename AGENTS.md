# AGENTS.md: Shark Exterior website

Read `docs/ai/PROJECT_CONTEXT.md` first. It explains the business, the brand, prices and the rules every AI tool follows. Then read the latest entries in `docs/ai/HANDOFF.md` to see what the last session left open.

## What this repo is

The public site, https://sharkexteriorcleaning.com (Netlify site `sharkexteriorcleaning`, deploys from `main`). Plain HTML, CSS and JavaScript with no build step. About 31 pages.

## Map

- Pages: `index.html`, `service-*.html`, `lincoln.html`, `kearney.html`, `areas.html`, `about.html`, `careers.html`, `blog*.html`, `quote.html`, `terms.html`, `privacy.html`, `404.html`.
- Shared header and footer: `partials/nav.html`, `partials/footer.html`.
- Styles: `styles.css` (main), `theme.css` + `theme.js`, `brand-blue.css`, `quote.css`, `process.css`.
- Quote form: `quote.html` + `script.js` + `quote.css`. Sends leads to the CRM `lead-intake` function and an EmailJS alert (`SHARK_NOTIFY` in `script.js`).
- Live prices and policies: `site-config.js` reads the CRM Admin Hub. Pages keep baked-in values as a fallback; change prices in the Admin Hub, not here. Pay numbers on `careers.html` use `data-sx-pay` spans.
- Brand kit: `brand-kit/` (official logos, icons, social images, PDF guidelines). Treat as read-only artwork.
- SEO files: `sitemap.xml`, `robots.txt`, `llms.txt`, IndexNow key file, `BingSiteAuth.xml`. Keep the sitemap in step when you add or remove pages.

## Don't touch without asking Easton

- `_redirects` / Netlify redirect rules (see rule 4 in the project brief).
- Lead-intake URL, EmailJS IDs, GA4 `G-KT6TQTF33Q`, GTM `GTM-5JZLQ9XJ`, consent banner logic (`consent.js`).
- `brand-kit/` artwork, `BingSiteAuth.xml`, the IndexNow key file.
- Claims about insurance, bonding, reviews or testimonials. Don't add new ones; flag existing ones that may not be true.

## How to work

- Branch, then open a PR. Netlify builds a deploy preview for every PR; share that link and screenshots (computer about 1280px wide and phone about 390px wide).
- "Publish" from Easton means: merge the PR to `main`, then check https://sharkexteriorcleaning.netlify.app.
- Quote form: don't be pushy. Add-a-service pop-ups only when the customer hasn't added one; every choice card must look clearly unselected until tapped.
- Testing the form locally: set `localStorage.sx_consent` first and block the Supabase and EmailJS requests so no fake leads reach the CRM.
- Check every page you touch at phone width: no sideways scroll, no console errors, no dead links.
