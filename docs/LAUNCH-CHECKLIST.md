# Production launch checklist

The following information was not supplied in the original brief. The application deliberately does not guess it.

## Catalog

- [ ] Confirm exact product categories
- [ ] Replace every `DEMO-*` SKU and development product
- [ ] Confirm product names, descriptions, attributes and safety information
- [ ] Confirm pieces/packs per carton for every product
- [ ] Confirm minimum order cartons (MOQ)
- [ ] Confirm carton and sale prices, or keep “price on request” enabled
- [ ] Confirm carton stock, order-request rules and low-stock thresholds
- [ ] Upload final product images with accurate alt text
- [ ] Confirm available brands and obtain permission for any brand assets

## Orders and delivery

- [ ] Confirm Pakistan-wide or city-specific delivery coverage
- [ ] Confirm delivery charges and any free-delivery threshold
- [ ] Confirm delivery timeframes
- [ ] Confirm whether Cash on Delivery is available and where
- [ ] Confirm minimum wholesale order
- [ ] Confirm invoice requirements
- [ ] Confirm tax/GST rules with a qualified professional

## Payments

- [ ] Add verified bank transfer details before enabling Bank Transfer
- [ ] Decide whether an online card/payment gateway is required
- [ ] Test the chosen provider in its official sandbox—never represent a simulated payment as successful

## Customer communication and policies

- [ ] Confirm WhatsApp number before enabling WhatsApp calls to action
- [ ] Confirm return/refund policy
- [ ] Review privacy policy and retention requirements
- [ ] Approve full terms and conditions
- [ ] Confirm social media URLs before showing icons
- [ ] Configure transactional email for confirmations and password resets

## Brand and infrastructure

- [ ] Replace the temporary droplet brand mark with the approved logo file
- [ ] Confirm final domain and set `NEXT_PUBLIC_SITE_URL`
- [ ] Replace the localhost value in production; indexing intentionally stays disabled until a public site URL is configured
- [ ] Verify the domain in Google Search Console and add `GOOGLE_SITE_VERIFICATION`
- [ ] Verify the domain in Bing Webmaster Tools and add `BING_SITE_VERIFICATION`
- [ ] Submit `/sitemap.xml` in both webmaster consoles
- [ ] Inspect the homepage, shop, category and product URLs after deployment and request indexing
- [ ] Create or claim the Google Business Profile with the exact website name, address and phone details
- [ ] Configure Google Merchant Center only after live prices, stock, shipping and returns are verified
- [ ] Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` only after analytics and privacy approval
- [ ] Test product pages in Google Rich Results Test and fix any live-data warnings
- [ ] Provision managed PostgreSQL with backups
- [ ] Set production `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`
- [ ] Configure managed media storage (Cloudinary, S3 or equivalent)
- [ ] Add rate limiting backed by shared storage for multi-instance deployment
- [ ] Add error reporting, uptime monitoring and an analytics provider only after privacy review
- [ ] Run accessibility, mobile-device and checkout acceptance testing
- [ ] Run `npm run lint`, `npm run typecheck` and `npm run build`
