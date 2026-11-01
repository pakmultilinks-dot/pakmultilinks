# Blog SEO, AEO and GEO audit — 1 November 2026

Scope: `/blog` and twenty article routes. This is an implementation and browser audit, not a Google ranking report or a Lighthouse score.

## Implemented and verified

| Area | Result and evidence |
| --- | --- |
| Discovery | Blogs navigation, crawlable article links, related guides and sitemap entries for all twenty posts. |
| Content | Twenty distinct procurement guides with direct answers, original checklists/comparisons, FAQs and sources. See the research inventory. |
| Metadata | Article-specific title/description, canonical, Open Graph article metadata and social image. Automated requests checked every article. |
| Structured data | CollectionPage/ItemList for archive; BlogPosting and BreadcrumbList for articles. Author, dates, image and citations reflect visible content. |
| Indexing errors | Unknown article slug returns HTTP 404 rather than a soft 200. |
| AEO/GEO | Visible concise answers, descriptive headings, source links and internal topic connections; ordinary crawlable HTML. |
| Mobile | No page-level horizontal overflow at 320, 390, 1024 and 1440 pixels. One H1; header and content edges align. Tables scroll within their containers. |
| Interaction | Archive search, topic filtering, empty-state reset, article navigation and carton calculator exercised on desktop and mobile. |
| Images | Fifteen relevant source assets converted to responsive-size WebP covers/thumbnails; combined generated files ~1.15 MB versus ~7.44 MB of source assets. This is asset-size evidence, not a measured page-speed improvement. |

## Verification

`tests/blog.spec.ts` covers archive discovery/filtering, all twenty article responses and metadata, article links/tables, calculator validation and missing-page status. Production compilation and TypeScript checks completed successfully. Scoped ESLint completed without diagnostics.

Browser layout audit: `/blog`, `/corporate-orders`, `/brand/rose-petal`, `/shop`, each at four widths. All sixteen checks returned HTTP 200, one H1 and no horizontal overflow. Header/content left edge: 80 px at 1440, 20 px at 1024 and 16 px at 390/320.

## Remaining measurement and editorial work

- Search Console indexing, submitted-sitemap processing, real search queries and ranking changes require the property's authenticated data; they were not measured.
- Field Core Web Vitals and Google Rich Results Test validation were not run. No performance score or rich-result eligibility guarantee is asserted.
- Review actual customer enquiries monthly and improve existing guides before adding repetitive pages. Update dates only for substantive changes.
- Long descriptive titles may be truncated or rewritten in search. Monitor real snippets and click-through data rather than targeting an arbitrary character count.
- Google ranking, AI citations and customer conversion cannot be guaranteed by implementation alone.

Research references and the twenty-page inventory: [SEO research](seo-research-2026-11-01.md).

## Release verification

Production-build Playwright run: **16 passed, 0 failed** (desktop and mobile, 15.3 seconds). A development-server run encountered one early-interaction timing failure; the production build passed the complete suite. Reproducible check summaries: [verification evidence](seo-verification-2026-11-01.json).
