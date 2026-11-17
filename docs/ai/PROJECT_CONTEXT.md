# Shark Exterior: shared project context

This file is the same in all three Shark Exterior repos. It is the brief any AI coding tool (Claude Code, ChatGPT Codex, Cursor) reads before touching code, so it never has to relearn the business. If you change it, copy the change into the other two repos in the same pull request round.

- Website: `E8Easton/Shark-Exterior-Cleaning-Website`
- Staff CRM + calendar: `E8Easton/Shark-Exterior-Calendar-Tracker`
- Estimator (retired): `E8Easton/Shark-Estimator`

## The business

- Shark Exterior Cleaning: window cleaning (exterior, interior, screens, tracks) and power washing, plus soft wash, gutters, solar, Christmas lights. Lincoln, NE (home) and Kearney, NE.
- Owner and CEO: Easton. Operations manager: Noah. Easton is not a programmer: explain changes in plain English and show screenshots (computer and phone).
- Public phone (402) 309-0128. Public email dirtysharkexterior@gmail.com. Hours Mon–Sat 8–6.
- Goal: the best service company locally, then statewide, then a model others copy. Built to be sold someday, so everything must look premium, be documented, and run without Easton.
- "Company in a box": the stack is meant to be copied to new cities and later to new trades (electrical, detailing, landscaping). The CRM is already multi-company.

## Brand

- Colors: Shark Blue `#0463EE`, Signal Orange `#F86A05`, Deep Navy `#04143C`, Sky `#0FA3E0`. Font: Lexend.
- Official logo files: website repo `brand-kit/` (traced vector artwork). Never redraw, recolor outside the listed versions, or stretch the logo.
- Logo layout: fin on a wave, "SHARK" wordmark, "— EXTERIOR —" in spaced orange caps.
- Look: premium, clean, consistent. No plain or generic pages, no emoji used as icons, no lorem ipsum, no fake reviews or stock claims presented as real.
- Voice: confident, quick, a little playful. Plain English. Never pushy, never jokes about price, safety or damage.
- Old name was "Dirty Leaf" / "Leaf Cleaning". Remove leftover Leaf naming when you see it in customer-facing text (account logins on the old Gmail stay until summer 2027).

### Brand family (in progress, not approved yet)

A parent brand system is being designed so future trades share one look: each company gets its own animal mark and main color, and shares the wave, the logo layout, Lexend, Deep Navy, the orange "— TRADE —" line, the uniform cut, the truck layout, eight customer moments and a four-step crew ladder. Concept page: https://claude.ai/artifact/RU2G5E6awz57xjmrcvwa6Z (working names Eel Electric and Orca Detailing; naming is still open, Easton may choose a different name style). **Do not apply any of this to the website or CRM until Easton approves a direction.** When approved, the decisions get written here.

## Prices and policies (one source of truth)

- All prices, membership terms, guarantees, Terms and Privacy live in the CRM Admin Hub (Supabase). The website reads them live through `site-config.js` (RPC `public_rulebook`). Don't hardcode new prices anywhere.
- Memberships: Monthly $150 off per visit (12 visits), Quarterly $100 off (4), Bi-Annual $50 off (2). No Tri-Annual. 12-month plans, cancel with 30 days' notice. Bundles: 10% / 15% / 20% for 2 / 3 / 4+ services.
- Quoting lives only in the CRM (`/quote-tool`). The old Estimator just redirects there.

## How the apps connect

- Website (static HTML/CSS/JS on Netlify, deploys from `main`) → quote form posts to the CRM `lead-intake` Supabase edge function and emails the alert inbox through EmailJS.
- CRM (React 19 + Vite + Tailwind 4 + Supabase, Netlify auto-deploys from `main`): bookings, calendar, dispatch, leads, texts (Twilio), payments (Stripe), QuickBooks, Meta lead ads, payroll, training, SOPs.
- Supabase project ref `bpvvzipsnbrxyarnncnx`. Publishable keys in front-end code are fine; service-role keys and other secrets never go in the repo.

## Rules for every AI tool

1. **Branch and pull request, never straight to `main`.** `main` is live for customers and staff. Nothing merges until Easton says "publish" (or "merge") after seeing previews.
2. **Database changes: write SQL, don't run it.** Put one SQL file in the CRM repo (`supabase/sql_to_paste/YYYY-MM-DD_name.sql`), tell Easton to paste it into the Supabase SQL editor, then verify with read-only queries.
3. **Never** run `netlify deploy` from a CLI. Git pushes deploy.
4. **Never** add a `netlify.app` → `.com` redirect to the website `_redirects` (it caused an endless reload loop on the live site).
5. Keep secrets, API keys and passwords out of commits, docs and screenshots.
6. Don't change payment, texting or lead-intake behavior without saying so in plain words in the PR.
7. Give options (2–3) for redesigns. Show phone and computer screenshots for anything visual.
8. When you finish a session, add a dated entry to `docs/ai/HANDOFF.md` in that repo: what changed, what's open, what's waiting on Easton.
