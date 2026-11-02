# Website speed, repository and deployment audit

**Audit date:** 2 November 2026  
**Production domain:** `https://www.pakmultilinks.com`  
**Method:** read-only repository inspection, live HTTP checks, a Chromium mobile viewport lab run, catalog asset checks, Git/GitHub remote inspection, and Vercel project inspection. No file, GitHub repository, Vercel project, or deployment was deleted or changed during this audit.

## Executive result

The website is slow mainly because it sends oversized images and too much catalog data, rather than because the Git repository contains many files. The most expensive repeated issue is the site logo: the light and dark 2039×771 PNG files are both marked as priority and unoptimized, so the browser downloads about **1.27 MB of logos on ordinary pages**. The homepage also serializes the full 129-product catalog into its HTML and client component, producing a generated homepage HTML file of about **1.17 MB**.

Deployment reliability needs attention. The current source folder and GitHub repository are named `pakmultilinks`, while the live domain is connected to the Vercel project `pakmultilinks-final`. A second old local clone and GitHub repository named `pakmultilinks-final` still exist. The live release also contains local changes that are not committed to GitHub, so the public deployment cannot currently be reproduced exactly from `origin/main`.

## Implemented after the audit

The following low-risk work was completed without changing the page layout, content structure or production data:

- The stale local `../pakmultilinks-final` clone was moved to the system Trash. It occupied about 765 MB and remains recoverable from Trash. The Vercel project serving the live domain was retained.
- Build-time database mutation was removed from `npm run build`. The old preparation script is available only through the explicit `db:prepare:legacy` command and was not executed.
- The two display logos were resized to their actual retina requirement and converted to transparent WebP. Their combined transfer size fell from about 1.27 MB to about 88 KB while retaining the same aspect ratio and rendered dimensions.
- Header and footer catalog consumers now share one browser request. The public endpoint has a 60-second CDN cache with stale-while-revalidate rather than `no-store`.
- Two duplicate root component files, shadowed by the real `src/components` versions, were removed.
- A GitHub quality workflow was added for clean install, TypeScript checking and production build. Full-repository ESLint currently has pre-existing errors, so it must be repaired before becoming a required CI gate; all files changed in this implementation pass targeted ESLint.
- Verification passed: production build, TypeScript, targeted ESLint, 18 desktop/mobile Playwright tests, one catalog request per page, unchanged logo render dimensions, and no horizontal overflow at 390 and 1440 px.

## Measured live performance

These are lab measurements from one Chromium run at a 390×844 viewport on the current connection. They are diagnostic figures, not Google field Core Web Vitals or a Lighthouse score.

| Route | TTFB | First content paint | Approx. same-origin resource transfer | Main finding |
| --- | ---: | ---: | ---: | --- |
| `/` | 317 ms | 2,600 ms | 2.20 MB | Two logos plus large product images; full catalog embedded in HTML |
| `/shop` | 616 ms | 1,292 ms | 0.62 MB | Dynamic route and cache miss; logo dominates transfer |
| `/blog` | 322 ms | 1,912 ms | 1.85 MB | Two logos, thumbnails, duplicate catalog requests |
| `/corporate-orders` | 297 ms | 1,056 ms | 1.77 MB | Two logos dominate; warehouse image is reasonable |
| `/brand/rose-petal` | 318 ms | 1,268 ms | 1.68 MB | Two logos and duplicate catalog requests |

The same run reported no layout shift. Static JavaScript and CSS were not the largest payloads; images and repeated catalog work were the stronger bottlenecks. Timing varies by cache state and network. A separate HTTP sample showed `/shop` as a Vercel cache miss with a 1.23-second TTFB, while cached blog and corporate pages were around 0.32 seconds.

## High-impact speed problems

### P0 — both full-size logos load on every page

- `public/images/pak-multilinks-logo.png`: 672,800 bytes.
- `public/images/pak-multilinks-logo-dark.png`: 592,829 bytes.
- Both are 2039×771 PNG files but display at roughly 155–280 px wide.
- `BrandMark` marks both images as `priority` and `unoptimized`.
- The component is rendered in the header, mobile menu and footer. The browser deduplicates identical URLs, but still preloads both theme versions.

**Recommended change:** produce correctly sized WebP/AVIF or an optimized SVG logo; let a `<picture>` theme media query select one source; make only the visible header logo high priority; remove `unoptimized` and priority from footer/menu instances. Expected cold-load saving is roughly **1.0–1.2 MB per page**.

### P0 — Next.js image optimization is disabled globally

`next.config.ts` has `images.unoptimized: true`. Several components additionally use `unoptimized`. The repository contains seven tracked files over 1 MB, and 62 public files over 100 KB. Examples include:

- `warehouse-quality.png`: 2.51 MB
- `about-product-range.png`: 2.48 MB
- `special-offer.png`: 2.14 MB
- `hero-products-green.png`: 2.08 MB
- `hero-workspace-hygiene.png`: 1.90 MB
- `hero-products.png`: 1.75 MB
- `moon-banquet-hall.png`: 1.29 MB

**Recommended change:** enable the Next image optimizer, remove component-level opt-outs where unnecessary, convert large PNG/JPEG assets to WebP/AVIF, set accurate `sizes`, and keep only the first above-the-fold image eager. Keep original high-resolution files outside the deployed `public` tree if they are source material rather than runtime assets.

### P0 — homepage sends the full product catalog

The production build generated `app/index.html` at about **1.17 MB**. `HomePage` loads all products and passes them to a client component, which serializes product descriptions, attributes, galleries and variants into the response. The page presents all products instead of an initial page.

**Recommended change:** render only 12–24 featured products initially; load later pages or filtered results from a cached endpoint; send a compact card DTO containing only card fields. Keep full descriptions, galleries and attributes on product detail pages. This should substantially reduce HTML, React payload, parse time and hydration work.

### P1 — catalog API is requested twice on every storefront page

The header and footer independently call `/api/catalog`. The live endpoint is `Cache-Control: no-store`, and each response is about 33 KB in the measured browser run. Blog and corporate pages do not need full product data merely to render the footer.

**Recommended change:** fetch catalog navigation once in a shared provider or server layout; give the footer categories as server data; use a compact search endpoint for header suggestions; add a short revalidation window and tag-based invalidation after admin catalog updates. This removes a request, database work and duplicate JSON parsing on every page.

### P1 — `/shop` is dynamic and misses cache

The page awaits `searchParams`, making the base shop route request-rendered. It also serializes the complete product set into the client explorer.

**Recommended change:** make the base `/shop` shell and first product page cacheable, keep query/filter state in the client URL, and retrieve compact paginated results. Revalidate product data after admin changes. Confirm that the chosen design preserves indexable category URLs.

### P1 — one catalog image is externally unreliable

The live catalog contained 138 unique image URLs. A HEAD check succeeded for 137; `https://prodimages.metro-online.pk/Products/OKPopUpBlackTissue.png` failed to fetch. External product hosts add latency and can break independently.

**Recommended change:** move approved product images to the managed Vercel Blob store or local optimized assets, validate uploads in admin, and run a scheduled broken-image check.

### P2 — broad client boundary and eager prefetching

`RouteShell` is a client component wrapping the whole storefront. There are 46 client modules. Links visible in large archive/category sections can trigger RSC prefetch traffic; the browser run observed extra home/catalog fetches and aborted prefetch requests.

**Recommended change:** keep the root shell server-rendered and isolate navigation, cart and support controls into smaller client islands. Disable prefetch on dense grids where measurement shows it has little value. Use bundle analysis after the image/data fixes; JavaScript is a secondary issue today.

## Repository findings

### What is actually on GitHub

- Current repository: 409 tracked files, approximately **41 MB** in the checked-out content.
- Tracked `public` content: 168 files, approximately **37.46 MB**.
- Git object data: approximately 44 MB locally; no Git garbage was reported.
- `origin/main` and local `HEAD` were aligned at audit time.
- The active repository remote is `pakmultilinks-dot/pakmultilinks`.

Large tracked assets account for almost all repository weight. Documentation and tests are small and are not slowing the website merely by being in Git.

### Local-only folders are not GitHub bloat

The active workspace occupied about **2.8 GB**, consisting mainly of:

- `.next`: 1.8 GB (including about 1.3 GB of development output and 454 MB cache)
- `node_modules`: 901 MB
- tracked project files: about 41 MB

`.next`, `node_modules`, test output, `.vercel` and local environment files are ignored by Git. They use local disk space but are not committed to GitHub and do not directly increase browser download size. They can be recreated.

### The old `pakmultilinks-final` folder still exists

Yes. A sibling folder exists at `../pakmultilinks-final` and occupies about **765 MB**:

- `node_modules`: 625 MB
- `.next`: 57 MB
- `.git`: 47 MB
- `public`: 36 MB

It points to the separate GitHub repository `pakmultilinks-dot/pakmultilinks-final`. Its latest local commit was dated 11 October 2026, so it is stale relative to the active project. It should be archived or removed only after confirming that no unique code, environment notes or assets are needed. Removing the active `.next` plus the stale clone would recover roughly **2.5 GB** locally; deleting and reinstalling dependencies can recover more temporarily.

### Duplicate and unused candidates

Static reference analysis found **16 public-file candidates totalling about 3.79 MB** with no direct reference in current source/scripts. This is a candidate list, not an automatic-delete list, because admin/database content can refer to paths dynamically.

Largest candidates:

| Candidate | Size |
| --- | ---: |
| `public/images/hero-products.png` | 1.75 MB |
| `public/images/brands/cleaning-items.jpg` | 536 KB |
| `public/images/custom-branded-tissue-box-cutout.png` | 414 KB |
| `public/images/custom-branded-tissue-box-transparent.png` | 370 KB |
| `public/images/deals/test-mobile-tissue.jpg` | 186 KB |
| `public/fonts/BadScript-Regular.ttf` | 184 KB |
| `public/images/brands/rose-petal-popup.jpg` | 168 KB |
| `public/images/custom-branded-tissue-box-cropped.jpg` | 106 KB |
| `public/images/custom-branded-tissue-box.jpg` | 81 KB |

Smaller candidates are `nozomi-logo-square.png`, `nozomi-logo.png`, `nozomi.jpg`, `hero-hygiene.svg`, `BadScript-LICENSE.txt`, `partners/SOURCES.md`, and `products/refill.svg`.

Exact duplicate byte pairs also exist:

- `cleaning-items.jpg` and `cleaning-items-tools.jpg` (536 KB each)
- `nozomi-logo.png` and `nozomi-logo-square.png` (75 KB each)
- `rate-list.pdf` and `downloads/pak-multilinks-master-rate-list.pdf` (794 KB each)
- two empty upload `.gitkeep` files (intentional and harmless)

Both PDF paths and one cleaning image path are currently referenced, so consolidation requires updating callers before deleting a copy.

The root `components/ui` directory duplicates two files under `src/components/ui` (about 12 KB). The `@/*` alias points to `src/*`, so the root copies are not the imported implementation. A public `/demo/image-stream-hero` route and its 3D demo components also remain in production; remove them if they are not part of the actual site.

## Deployment reliability findings

### P0 — source, GitHub and Vercel names are split

Current state:

| Layer | Active name |
| --- | --- |
| Working folder | `pakmultilinks` |
| Active GitHub repo | `pakmultilinks-dot/pakmultilinks` |
| Live Vercel project/domain | `pakmultilinks-final` / `www.pakmultilinks.com` |
| Old sibling folder/repo | `pakmultilinks-final` / `pakmultilinks-dot/pakmultilinks-final` |
| Additional Vercel projects | `pakmultilinks`, `pakmultilinks-flou` |

This naming split caused a release to be sent to the wrong Vercel project before the correct live project was identified. Choose one canonical GitHub repository and one Vercel project, connect them directly, and archive the stale alternatives after verification.

### P0 — production contains uncommitted code

At audit time, the live filter hydration fix and related reports/tests were present locally but not in GitHub `origin/main`. A future Git-triggered deployment can therefore omit or overwrite the live behavior.

**Required action:** review and commit the current changes, run the gates, push the exact commit, and redeploy from that commit. Record the Git SHA in deployment output and the audit report.

### P0 — standard build can mutate production data

`npm run build` executes `scripts/prepare-database.mjs` before `next build`. That script performs schema DDL and product migrations/archiving. A normal Git deployment can therefore change the database while building application code. Concurrent previews/builds can also contend for the same database.

**Recommended change:** make the build deterministic (`prisma generate && next build`). Put schema changes in reviewed Prisma migrations and run `prisma migrate deploy` as a controlled release step against the intended environment. Put one-time data migrations in versioned, idempotent jobs with an audit log and backup/rollback procedure.

### P1 — missing repeatable release gates

Adopt this release path:

1. `npm ci` with a pinned Node major and committed lockfile.
2. `prisma generate`.
3. Typecheck and scoped/full lint.
4. Unit/integration tests and the desktop/mobile storefront tests.
5. `next build` without database mutation.
6. Preview deploy with preview database/environment isolation.
7. Smoke-test canonical URLs, admin authorization, catalog/filter behavior, sitemap and broken assets.
8. Promote the already-tested immutable deployment to production.
9. Record Git SHA, deployment ID, migration version, test summary and rollback target.

Protect `main`, require checks, and prevent direct production deploys from a dirty worktree. Pin the same Node major locally, in GitHub Actions and Vercel. Keep preview deployments away from the production database.

### P1 — caching and region policy need to be explicit

The Vercel project reports build infrastructure in `iad1`, while `vercel.json` requests `sin1`. Confirm the actual runtime region and the database region, then colocate database-backed functions with the database. Static assets remain CDN-served. Add intentional cache headers/revalidation for catalog reads and invalidate them after admin writes.

## Recommended implementation order

1. **Make production reproducible:** commit current live changes, select one GitHub repo/Vercel project, connect them, and stop deploying from the stale clone.
2. **Remove database mutations from build:** use migrations and a separate controlled data migration step.
3. **Fix logos and image optimization:** this is the fastest large user-visible speed win.
4. **Reduce homepage/shop payloads:** compact DTOs, pagination and cacheable first render.
5. **Consolidate catalog fetching:** one cached source for header/footer/search.
6. **Repair the one external image and migrate external product assets.**
7. **Remove verified dead assets, duplicate root components and the demo route.**
8. **Run Lighthouse and field monitoring after changes:** capture mobile Lighthouse in a stable environment, add real-user Core Web Vitals reporting, and compare p75 LCP/INP/CLS over at least 28 days.

## Definition of a strong deployment

A strong release should be reproducible from a clean Git clone, tied to one reviewed commit, pass automated gates, avoid build-time database mutation, use an isolated preview environment, promote the tested artifact, and have a documented rollback. Performance targets should be validated after the fixes; reasonable initial budgets are under 200 KB of critical compressed JavaScript, under 500 KB of above-the-fold images on mobile, under 200 KB initial HTML where practical, and p75 Core Web Vitals in the “good” range using real-user data.
