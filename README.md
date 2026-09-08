# HomeBasedGelatoNibby

**Nibby Gelato** — a playful, illustrated, mobile-first storefront for a home-based gelato business in Melaka.

## Current status

This is a working **design preview**, not a live shop. It deliberately has no connected WhatsApp number, numeric prices, currency or promised delivery/pickup arrangement. Draft pages use `noindex, nofollow`, and the generated robots response disallows crawling. These are indexing hints, not access control; keep unpublished previews private if necessary.

Initial menu: **Lemon Almond Nibs**, **Dark Chocolate**, **Pistachio My Love**. Planned serving size: approximately **140 ml**, in a lidded container. All artwork is original concept illustration, not photography or confirmed packaging.

## Local development

Use a supported even-numbered Node.js release **22.12+** (tested with Node 24) and npm. In this repository folder:

1. Install the locked dependencies with `npm ci`.
2. Start the local site with `npm run dev`. Default address: http://127.0.0.1:4321.
3. Check Astro/TypeScript with `npm run check`.
4. Run unit tests with `npm run test`.
5. Produce a static site with `npm run build`; output goes into `dist`.
6. Inspect the production build with `npm run preview`.
7. Install test browsers once with `npx playwright install chromium webkit`; after a build, run `npm run test:e2e`.

The Playwright suite starts its own production preview on port 4322 through Astro’s public `preview()` API, keeping the server attached to the test process even in AI-agent environments. It covers desktop Chromium and mobile WebKit, keyboard/dialog behaviour, quantities, clipboard fallback, no-JavaScript browsing, responsive overflow and automated accessibility checks. Tests never send a WhatsApp message. A VS Code preview task is also available when opening the parent Gelato workspace. If Astro reports an existing background preview, inspect it with `npx astro preview status`; stop it with `npx astro preview stop` only when you no longer need that preview.

## Edit the business and menu

- [src/data/business.ts](src/data/business.ts): brand, service area, draft/live mode, currency, WhatsApp number, public site URL, fulfilment wording and review flags.
- [src/data/flavours.ts](src/data/flavours.ts): exact product names, cup volume, illustration paths, prices, availability and confirmed ingredient/allergen text.
- [src/styles/global.css](src/styles/global.css): design tokens, layouts, typography and motion preferences.
- [src/pages/index.astro](src/pages/index.astro): brand introduction, ordering guide and FAQ.
- [src/components](src/components): reusable header, hero, product cards, order dialog and footer.

Use `null` for unknown prices/currency/contact; never enter dummy values. Prices are integer currency minor units, e.g. **1250** represents **12.50** for MYR. `0` is a genuine zero price, not a placeholder. Do not enter currency symbols or decimals in the numeric field. The displayed subtotal is unknown if any selected price or currency is unknown.

WhatsApp numbers must be 8–15 international digits only, with country code and without `+`, punctuation or the local trunk zero. Format validation does **not** establish that the number exists or belongs to the business. Verify it manually before launch.

Availability is owner-maintained, not real-time inventory. The limit of 99 cups per flavour is a request-interface limit, not a stock claim. A data/content change requires rebuilding and redeploying.

## How ordering works

The visitor selects flavours and quantities, reviews the order panel, and previews a generated message. Selections live **only in memory** and reset on a page reload; there is no local storage, tracking, account, database or collection of names/addresses on the site.

In draft mode, visitors can copy a message explicitly marked as a preview, but cannot open a WhatsApp order link—even if a number is accidentally populated. In live mode the link opens WhatsApp with the message prefilled; the visitor must still send it. Opening a link does not confirm an order or clear the selection. The owner confirms availability, final amount and fulfilment. WhatsApp’s privacy terms apply after the handoff.

Copying uses the browser clipboard on secure origins (HTTPS or localhost). If permission is denied, the message is selected for manual copying. Product information and native expandable sections remain accessible without JavaScript; the quantity builder requires it.

## Before switching to live

The build rejects incomplete live configuration. Do not bypass validation just to remove the draft banner.

- Check business name/trademark and domain availability; this project does not establish ownership.
- Supply confirmed currency, all prices, exact serving volumes and availability statuses.
- Replace generic product detail copy with reviewed descriptions and complete allergen information, including relevant cross-contact advice. Do not infer dietary suitability from a flavour name.
- Update the FAQ’s draft-specific serving/allergen/photography wording when details change.
- Supply and manually verify the business WhatsApp number on mobile and desktop, without sending an automated message.
- Supply a real public HTTPS site URL and clear pickup/delivery/fee/lead-time wording; no home address is required on the site.
- Confirm actual contact ownership with `contactVerified`, each product with `contentReviewed`, and final business/content review with `launchReviewed`. Set each `volumeApproximate` to false only after the serving volume is confirmed.
- Set `mode` to `live`, rebuild and inspect all copy, canonical URL and indexing behaviour.
- Complete manual keyboard, screen-reader, contrast, zoom and physical-device checks. Automated axe tests are useful but do not certify full accessibility compliance.
- Measure production performance; mobile Lighthouse 90+ is a target, not a guarantee on every device. Real-user Core Web Vitals require post-launch data.

## Hosting

The site exports ordinary static assets; no server adapter, API, credentials or database is needed. On a commercial-use-compatible static host, use this repository root as the base directory, `npm ci && npm run build` as the build command and `dist` as the publish directory. Use the supported Node version above. If importing the parent workspace rather than this Git repository, set the base directory to `HomeBasedGelatoNibby`.

Check the chosen provider’s current commercial-use terms, limits and costs before using a free plan. Do not publish until the launch checklist is complete. No deployment, domain purchase or Git push is performed by this project setup.

### Temporary GitHub Pages preview

This repository includes [.github/workflows/deploy.yml](.github/workflows/deploy.yml). Once it is committed and pushed to `main`, the workflow builds and deploys the static site to **https://danieltan995-create.github.io/HomeBasedGelatoNibby/**.

Before the first deployment, open the repository on GitHub, select **Settings** → **Pages**, and choose **GitHub Actions** as the publishing source. Thereafter, every push to `main` deploys; use **Actions** → **Deploy to GitHub Pages** → **Run workflow** to deploy the existing `main` branch manually. Watch that workflow for the published URL and failures.

The Astro configuration automatically uses `/HomeBasedGelatoNibby/` only inside GitHub Actions; local preview continues to use `/`. Do not change `base` merely to test locally. GitHub Pages is publicly reachable even when a repository is private on plans that permit private Pages, so do not place private details in the preview. The draft site remains `noindex`, but that does not make the URL private.

## Artwork and fonts

See [public/ASSETS.md](public/ASSETS.md) for original artwork notes. Replace concept images with your own licensed product photos when ready, preserve their layout dimensions, and update alt text and illustration disclaimers accordingly. Photography and packaging claims must match the actual products.

Fraunces and DM Sans are self-hosted through Fontsource; see their packages’ `LICENSE` files (SIL Open Font License). No third-party font requests or stock-photo hotlinks are used. The social artwork source is [public/social-card.svg](public/social-card.svg).

## Design references

Original layout inspired by contemporary food-site design, not copied from a reference:
- [Sunbeam Bagels & Coffee — Awwwards, July 2026](https://www.awwwards.com/sites/sunbeam-bagels-coffee): playful product interactions.
- [Partake Foods — Awwwards, August 2026](https://www.awwwards.com/sites/partake-foods): consistent, colourful product branding.

No ratings, testimonials, artificial scarcity, sourcing/health claims or unverified founder history are included. The initial scope excludes payments, CMS, accounts, live inventory, analytics and multilingual content.
