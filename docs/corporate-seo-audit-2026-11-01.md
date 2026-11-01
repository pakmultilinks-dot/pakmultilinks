# Corporate SEO, AEO and GEO audit — 1 November 2026

Scope: `/corporate-orders`, its links to products/guides/quotation, and shared storefront alignment. This is an implementation and browser audit, not a ranking or Lighthouse report.

## Implemented and verified

| Area | Result and evidence |
| --- | --- |
| Intent | Clear corporate tissue, washroom and cleaning procurement offer for Lahore workplaces, hotels and institutions. |
| Page structure | One H1, service range, industries, ordering steps, visible FAQs and quotation/contact calls to action. |
| Visual alignment | Corporate layout now shares blog shell, typography and spacing. Hero and header edges match at tested sizes. |
| Metadata | Dedicated title/description, canonical, Open Graph and Twitter metadata. |
| Structured data | Service and BreadcrumbList linked to the site's business identity. No fabricated reviews or ratings were introduced. |
| Internal links | Product exploration, quotation and relevant blog buying checklist links connect commercial and informational intent. |
| Mobile usability | HTTP 200, one H1 and no horizontal page overflow at 320, 390, 1024 and 1440 px; desktop/mobile hero visually reviewed. |
| Conversion support | Product categories and quote/contact paths are prominent. Actual conversion rates were not measured. |
| AEO/GEO | Visible concise service information, ordering steps and FAQs support retrieval and comprehension; no special AI ranking claims. |

## Related storefront fixes

Long brand and category buying information now follows the product listing. Filter sidebar is in normal document flow. Category matching handles names, slugs and parent categories; initial URL selections can be cleared. Empty category choices within a brand are omitted, and incompatible brand selection resets when changing category. Availability and numeric price filtering account for active variants. Mobile/desktop catalog tests cover populated categories, initial-filter reset and brand-page content ordering.

The administrator can edit their display name in Settings. The API persists it to the database, validates input, checks authorization and refreshes the session/header. Profile save, reload and subsequent login were verified with a temporary account that was removed after testing. Built-in production password shortcuts were removed; existing database passwords were not changed.

## Remaining measurement and content checks

- Search Console, real-user Core Web Vitals, leads and Google business-profile visibility were not measured.
- Business claims elsewhere in the existing brand/catalog copy (for example official status, market leadership or delivery promises) were not independently certified by this audit. The business owner should substantiate those claims and keep rates/stock accurate.
- Sitewide product-image accuracy depends on catalog records; this release does not claim an audit of every catalog image or SKU.
- Google ranking and AI inclusion are not guaranteed. Use real search and enquiry data to prioritize follow-up improvements.

Primary guidance: [Google helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [AI features](https://developers.google.com/search/docs/appearance/ai-features), and [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies). See the [research inventory](seo-research-2026-11-01.md).

## Release verification

Production-build Playwright run: **16 passed, 0 failed** (desktop and mobile, 15.3 seconds). A development-server run encountered one early-interaction timing failure; the production build passed the complete suite. Reproducible check summaries: [verification evidence](seo-verification-2026-11-01.json).
