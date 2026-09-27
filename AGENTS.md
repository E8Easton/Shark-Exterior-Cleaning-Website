# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **static marketing website** for "Leaf Cleaning" (a window-cleaning
business). There is no build step and no application server — the deliverable is the
set of static `*.html`, `styles.css`, and `script.js` files at the repo root, plus
assets in `images/`.

### Services / how to run

- There is a single "service": the static site. Run a local static file server from the
  repo root and open `index.html`:
  - `python3 -m http.server 8000` (then visit `http://localhost:8000/index.html`)
- Core user flow is the multi-step quote wizard at `quote.html` ("Get a Free Quote").
  The wizard validates inputs client-side and ends on a "YOU'RE ALL SET!" confirmation.

### Lint / test / build

- There is **no lint config, no test suite, and no build/bundler** in this repo.
  `package.json` only declares `sharp` as a devDependency, used by the standalone image
  utility scripts (e.g. `optimize.js`).
- The closest thing to a lint check is a JS syntax check: `node --check <file>.js`.

### Non-obvious notes

- The quote form (`script.js`) submits via **client-side EmailJS** loaded from a CDN.
  EmailJS is not configured with real credentials here, so no email is actually sent —
  the wizard still completes and shows the success screen. This is expected, not a bug.
- The root-level helper scripts (`perf-fix.js`, `rewrite-quote.js`, `update-images.js`,
  `update-qp-css.js`, `wire-images.js`) are **one-off content/codegen tools** that
  rewrite HTML/CSS. They are not part of running the site; do not run them as part of
  normal development unless intentionally regenerating content.
