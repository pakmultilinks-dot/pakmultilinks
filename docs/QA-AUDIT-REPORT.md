# Pak-Multilinks QA Audit Report

> **Status:** 11 of 14 bugs fixed. Build passes clean. See `docs/DEPLOYMENT-READINESS-REPORT.md` for full fix details and deployment readiness assessment.

**Audit Date:** 2026-09-12  
**Application:** Pak-Multilinks Hygiene — E-commerce Platform  
**Stack:** Next.js 16.3.2 / React 19.2.8 / TypeScript 5.7+ / Prisma 6.12.0 / PostgreSQL (Railway) / Vercel Blob / Vercel Deployment  
**Audit Scope:** Full end-to-end inspection — Architecture, Admin, Customer-Facing, API, Database, Security, Production  
**Methodology:** Code-only inspection. No running instances were modified. Build/typecheck/lint executed successfully.

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| Total files inspected | 80+ source files |
| Build status | ✅ Passes (`typecheck` + `lint` + `build` all clean) |
| CRITICAL bugs | **2** |
| HIGH bugs | **3** |
| MEDIUM bugs | **4** |
| LOW bugs | **5** |
| Total bugs | **14** |
| Missing features | **3** |
| Security concerns | **3** |
| Production readiness | **Conditional** — functional but requires CRITICAL and HIGH fixes before any real-customer use |

**Bottom line:** The application compiles cleanly and has a solid architectural foundation with good separation of concerns, input validation (Zod), rate limiting, and structured error handling. However, there are **2 critical bugs that block core admin functionality** (product creation/editing fails silently without a properly seeded database) and **3 high-severity issues** (payment method locked to Cash on Delivery, postal code never collected, Vercel Blob images lack remote pattern config). The application is suitable for demo/staging but not production until CRITICAL and HIGH issues are resolved.

---

## 2. CRITICAL Bugs

### BUG-001: Category & Brand Dropdowns Empty Without Properly Seeded Database

| Field | Detail |
|---|---|
| **Severity** | 🔴 CRITICAL |
| **Area** | Admin → Product Management |
| **Symptom** | When creating or editing a product, the Category and Brand dropdowns show only 1 category ("Tissue & Paper Wholesale") and zero brands. Admin cannot assign categories or brands to products. |
| **Root cause** | The Add Product page (`src/app/admin/(protected)/products/new/page.tsx`) queries the database for categories/brands. If the database is not configured (`isDatabaseConfigured = false`) or the query fails silently (catch block sets `connected = false`), it falls back to the hardcoded seed data: exactly 1 category from `src/lib/catalog.ts` and an empty brands array. The seed script (`prisma/seed.ts`) only creates 1 category and 1 brand. There is **no mechanism to bulk-import or create additional categories/brands from the UI** without first having them in the database. |
| **Affected files** | `src/app/admin/(protected)/products/new/page.tsx` (lines 18-22), `src/app/admin/(protected)/products/[id]/page.tsx` (lines 21-22), `src/lib/catalog.ts` (only 1 category defined), `prisma/seed.ts` (only 1 category, 1 brand) |
| **Reproduction** | 1. Deploy to Vercel without `DATABASE_URL` env var → seed fallback activates. 2. OR: Deploy with database but run seed only once → only 1 category/brand exists. 3. OR: Database query throws (connection timeout, etc.) → silent catch → seed fallback. |
| **Impact** | Admin cannot properly manage product catalog. Every product gets assigned to the single hardcoded category. Brand assignment is impossible. Product organization on storefront is broken. |
| **Fix** | 1. Add a bulk category/brand creation UI in admin settings. 2. Expand seed data with a realistic set of categories/brands. 3. Show a visible warning banner when dropdowns are populated from seed fallback (not just `DemoNotice`). 4. Never silently swallow DB errors — show them to admin. |
| **Verification** | After fix, verify: Add Product page shows all database categories/brands. Seed fallback shows clear warning. Admin can create new categories/brands from UI. |

---

### BUG-002: No `remotePatterns` for Vercel Blob — `next/image` Breaks for Uploaded Images

| Field | Detail |
|---|---|
| **Severity** | 🔴 CRITICAL |
| **Area** | Image Delivery / All Pages |
| **Symptom** | `next.config.ts` has no `remotePatterns` configuration for Vercel Blob URLs (`*.public.blob.vercel-storage.com`). All 10 files using `next/image` with external URLs must use the `unoptimized` prop workaround. This means **zero image optimization** — no resizing, no WebP/AVIF conversion via Next.js image optimization, no CDN caching of optimized variants. Product images, deal banners, and admin previews all bypass the image optimization pipeline entirely. |
| **Root cause** | `next.config.ts` defines `images.formats` (avif, webp) and `minimumCacheTTL` but omits the required `remotePatterns` array for external blob storage domains. Components work around this with `unoptimized={image.startsWith("https://")}`. |
| **Affected files** | `next.config.ts` (missing `remotePatterns`), `src/components/catalog/product-card.tsx`, `src/components/catalog/product-gallery.tsx`, `src/components/catalog/product-quick-view.tsx`, `src/components/commerce/cart-page-client.tsx`, `src/components/home/deals-slider.tsx`, `src/components/layout/brand-mark.tsx` (local only), `src/app/admin/_components/product-editor.tsx`, `src/app/admin/_components/deals-manager.tsx`, `src/app/page.tsx` |
| **Reproduction** | 1. Upload a product image via admin. 2. View product on storefront — image loads at full original resolution with no optimization. 3. Check browser DevTools Network tab — no `/_next/image` requests for external URLs. |
| **Impact** | Largest images served at full resolution. Poor Lighthouse scores for Largest Contentful Paint (LCP) and image optimization. Higher bandwidth costs. Mobile users download unnecessarily large images. |
| **Fix** | Add `remotePatterns` to `next.config.ts`: |
| **Verification** | After fix, remove `unoptimized` props. Verify images load via `/_next/image` optimization endpoint. Run Lighthouse audit for image optimization. |

---

## 3. HIGH Bugs

### BUG-003: Checkout Form Hardcodes Payment Method to "Cash on Delivery"

| Field | Detail |
|---|---|
| **Severity** | 🟠 HIGH |
| **Area** | Customer-Facing → Checkout |
| **Symptom** | The checkout form (`src/components/commerce/checkout-form.tsx` line 68) hardcodes `const paymentMethod = "Cash on Delivery" as const;`. There is **no payment method selection UI** despite the backend supporting both "Cash on Delivery" and "Bank Transfer" via `PaymentMethod` enum. The `settingsInputSchema` includes `bankTransferEnabled`, and the order creation API checks it, but customers can never select bank transfer. |
| **Root cause** | Payment method selection was never implemented in the checkout form. |
| **Affected files** | `src/components/commerce/checkout-form.tsx` (line 68), `src/app/api/orders/route.ts` (validates but never receives bank transfer) |
| **Reproduction** | 1. Go to checkout. 2. Observe no payment method selector. 3. Inspect submitted payload — always `paymentMethod: "Cash on Delivery"`. |
| **Impact** | Bank transfer payment option is dead code. Admin settings for `bankTransferEnabled` have no effect on customer experience. Business loses a payment channel. |
| **Fix** | Add a payment method radio/select to checkout form, gated by the `bankTransferEnabled` setting fetched from `/api/settings/public`. |
| **Verification** | After fix, enable bank transfer in admin settings → verify customers see and can select the option → verify order is created with correct `paymentMethod`. |

---

### BUG-004: `CustomerDetails` Type Missing `postalCode` — Postal Code Never Collected

| Field | Detail |
|---|---|
| **Severity** | 🟠 HIGH |
| **Area** | Customer-Facing → Checkout / Data Model |
| **Symptom** | The TypeScript type `CustomerDetails` in `src/lib/types.ts` (line 63) does **not** include `postalCode`. The Zod schema (`orderCreateSchema` in `src/lib/validation.ts` line 64) accepts `postalCode` as optional. The database `Order` model has `postalCode String?`. The checkout form has **no postal code input field**. The `CustomerDetails` object constructed in the checkout form (line 66-77) does not include `postalCode`. Result: postal code is always `null` in orders. |
| **Root cause** | Type definition, checkout UI, and validation schema are out of sync. Postal code was added to the backend/schema but never propagated to the frontend type and form. |
| **Affected files** | `src/lib/types.ts` (line 63 — missing field), `src/components/commerce/checkout-form.tsx` (no postal code input), `src/lib/validation.ts` (accepts it), `prisma/schema.prisma` (stores it) |
| **Reproduction** | 1. Go to checkout. 2. Fill in all fields. 3. Inspect API payload — no `postalCode` in `customer` object. 4. Check database order record — `postalCode` is always `null`. |
| **Impact** | Delivery routing, tax calculations, and customer communication lose postal code data. Potential compliance issue for Pakistan Post / courier requirements. |
| **Fix** | 1. Add `postalCode` to `CustomerDetails` type. 2. Add postal code input to checkout form (optional field). 3. Wire the value through to the API payload. |
| **Verification** | After fix, submit checkout with postal code → verify API receives it → verify order record stores it → verify admin order view shows it. |

---

### BUG-005: Edit Product Page Shows Inactive Categories (Filter Inconsistency)

| Field | Detail |
|---|---|
| **Severity** | 🟠 HIGH |
| **Area** | Admin → Product Management |
| **Symptom** | The Add Product page queries categories with `where: { isActive: true }`, but the Edit Product page (`src/app/admin/(protected)/products/[id]/page.tsx` line 22) queries categories with **no `isActive` filter** — it fetches all categories including inactive/archived ones. Brands are correctly filtered on both pages. |
| **Root cause** | Inconsistent query construction between the two pages. |
| **Affected files** | `src/app/admin/(protected)/products/new/page.tsx` (correct: `where: { isActive: true }`), `src/app/admin/(protected)/products/[id]/page.tsx` (missing: `where: { isActive: true }`) |
| **Reproduction** | 1. Create a category. 2. Deactivate it (set `isActive: false`). 3. Edit an existing product — the deactivated category appears in the dropdown. 4. Create a new product — the deactivated category does NOT appear. |
| **Impact** | Admin can accidentally assign products to inactive categories. Products assigned to inactive categories may still appear on storefront depending on query logic. Inconsistent behavior confuses admins. |
| **Fix** | Add `where: { isActive: true }` to the `db.category.findMany()` call in the edit page, matching the new product page. |
| **Verification** | After fix, deactivate a category → verify it disappears from both Add and Edit product dropdowns. |

---

## 4. MEDIUM Bugs

### BUG-006: No Order Status Transition Lifecycle Validation

| Field | Detail |
|---|---|
| **Severity** | 🟡 MEDIUM |
| **Area** | API → Order Management |
| **Symptom** | The order PATCH endpoint (`src/app/api/orders/[id]/route.ts` lines 30-50) only validates one transition: blocks `CANCELLED` → non-cancelled. All other transitions are allowed, including invalid ones like `DELIVERED` → `CONFIRMED`, `SHIPPED` → `PENDING`, `CONFIRMED` → `PENDING`. |
| **Root cause** | No state machine validation. Only the cancelled-state guard is implemented. |
| **Affected files** | `src/app/api/orders/[id]/route.ts` |
| **Reproduction** | 1. Create an order (status: PENDING). 2. Move to DELIVERED. 3. PATCH back to PENDING or CONFIRMED — succeeds without error. |
| **Impact** | Admin can revert delivered orders to earlier states. Breaks audit trail integrity. Could cause stock accounting inconsistencies (stock is only restored on cancel, not on revert). |
| **Fix** | Implement a transition map: `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`. Allow `CANCELLED` from any non-terminal state. Reject all other backward transitions. |
| **Verification** | After fix, attempt invalid transition → verify 409 error. Verify valid transitions work. |

---

### BUG-007: `QuoteRequestItem.quantity` Typed as `string` Instead of `number`

| Field | Detail |
|---|---|
| **Severity** | 🟡 MEDIUM |
| **Area** | Types / Quote System |
| **Symptom** | In `src/lib/types.ts`, `QuoteItem.quantity` is typed as `string`, but the actual data from the database and the Zod schema (`quoteItemSchema`) both use `z.coerce.number()`. This causes TypeScript confusion — code may perform string comparisons or concatenations instead of numeric operations. |
| **Root cause** | Type definition does not match runtime data. |
| **Affected files** | `src/lib/types.ts` (line — `QuoteItem.quantity: string`) |
| **Fix** | Change type to `quantity: number`. |
| **Verification** | After fix, grep for any string arithmetic on quote quantities. |

---

### BUG-008: Middleware File Convention Deprecated in Next.js 16

| Field | Detail |
|---|---|
| **Severity** | 🟡 MEDIUM |
| **Area** | Production Compatibility |
| **Symptom** | Build output emits warning: `"The middleware file convention is deprecated. Please use 'proxy' instead."` Next.js 16 deprecated `middleware.ts` in favor of the new `proxy` convention. The app works now but may break in future Next.js versions. |
| **Root cause** | Using the legacy `middleware.ts` convention instead of the new `proxy` export. |
| **Affected files** | `src/middleware.ts` |
| **Reproduction** | Run `npm run build` — observe deprecation warning. |
| **Impact** | Will break on future Next.js major versions. Migration required eventually. |
| **Fix** | Run the codemod: `npx @next/codemod@canary middleware-to-proxy .` then verify all admin route protection still works. |
| **Verification** | After migration, verify: unauthenticated admin access redirects to login. Authenticated admin access works. |

---

### BUG-009: Password Reset Token Leaked in Dev Mode API Response

| Field | Detail |
|---|---|
| **Severity** | 🟡 MEDIUM |
| **Area** | Security → Auth |
| **Symptom** | The forgot-password endpoint (`src/app/api/auth/forgot-password/route.ts` line 43) returns `developmentResetToken` in the JSON response body when `NODE_ENV !== "production"`. On Vercel preview deployments (which may set `NODE_ENV=development` or use `VERCEL_ENV=preview`), this token could leak in browser network history, logs, or error monitoring services. |
| **Root cause** | Dev convenience is tied to `NODE_ENV` rather than explicitly checking for a dev/staging environment. |
| **Affected files** | `src/app/api/auth/forgot-password/route.ts` (line 43) |
| **Reproduction** | 1. Deploy to Vercel preview branch. 2. POST to `/api/auth/forgot-password` with a valid email. 3. Response body contains `developmentResetToken`. |
| **Impact** | Token exposure enables password reset without email access. |
| **Fix** | Only include the dev token when `VERCEL_ENV !== 'production'` AND explicitly also check `process.env.NODE_ENV !== "production"`, or remove from response and only log to server console. |

---

## 5. LOW Bugs

### BUG-010: `clientSubtotal` Sent but Never Used Server-Side

| Field | Detail |
|---|---|
| **Severity** | 🔵 LOW |
| **Area** | API → Orders |
| **Symptom** | The checkout form sends `clientSubtotal` in the order payload. The Zod schema validates it (`z.coerce.number().nonnegative().max(100_000_000).optional()`). The server **never reads or uses it** — the subtotal is computed server-side from product prices × quantities. |
| **Root cause** | Vestigial field from an earlier design. |
| **Fix** | Either use it for server/client reconciliation (compare and reject if mismatch > threshold) or remove from both form and schema. |
| **Verification** | Remove from payload and schema — verify order creation still works. |

---

### BUG-011: Generic Duplicate Email Error Message on Registration

| Field | Detail |
|---|---|
| **Severity** | 🔵 LOW |
| **Area** | API → Auth |
| **Symptom** | Registration endpoint catches Prisma P2002 (unique constraint) and returns: "A record with that email, SKU, or slug already exists." This is a generic message reused across all entity types. For registration, users see a confusing error mentioning "SKU" and "slug." |
| **Root cause** | Shared `apiFailure` handler in `src/app/api/_utils.ts` line 47 doesn't differentiate between entity types. |
| **Fix** | Catch P2002 specifically in the register route with a tailored message: "An account with this email already exists." |
| **Verification** | Register with duplicate email → verify user-friendly error. |

---

### BUG-012: Header/Footer Flash of Static Content Before API Fetch

| Field | Detail |
|---|---|
| **Severity** | 🔵 LOW |
| **Area** | Customer-Facing → Layout |
| **Symptom** | The header component (`src/components/layout/header.tsx`) initializes from static catalog data (`src/lib/catalog.ts` — 1 category, 7 products), then fetches fresh data from `/api/catalog` and `/api/settings/public` on mount. This causes a brief flash where the navigation shows stale/seed data before updating. |
| **Root cause** | Client-side hydration pattern with static initial state + async fetch. |
| **Fix** | Pass catalog data as server component props, or use Next.js `server-component` pattern for the header to avoid the flash. |
| **Verification** | After fix, observe no content flash on initial page load. |

---

### BUG-013: Cart System Uses Client-Only localStorage — Server Cart Model Unused

| Field | Detail |
|---|---|
| **Severity** | 🔵 LOW |
| **Area** | Cart System / Database |
| **Symptom** | The database has `Cart` and `CartItem` models with relations to `User`. However, the actual cart system (`src/components/providers/store-provider.tsx`) uses **only** `localStorage` — the database cart tables are completely unused. No API endpoints exist for cart operations. User accounts have no benefit for cart persistence. |
| **Root cause** | The cart was built as a client-side feature. The database schema was designed for future server-side cart but never connected. |
| **Fix** | Either implement server-side cart sync (add cart API endpoints, sync on login) or remove the unused `Cart`/`CartItem` models from the schema to avoid confusion. |

---

### BUG-014: No Email Verification on Customer Registration

| Field | Detail |
|---|---|
| **Severity** | 🔵 LOW |
| **Area** | Auth / Customer Accounts |
| **Symptom** | The `User` model has `emailVerified DateTime?` field but it is never set. Registration (`src/app/api/auth/register/route.ts`) creates users without any email verification flow. Anyone can register with any email address. |
| **Root cause** | Email verification was planned but not implemented. |
| **Fix** | Implement email verification flow with token generation and verification endpoint. |

---

## 6. Missing Features

| # | Feature | Impact |
|---|---|---|
| MF-1 | **Bulk category/brand management UI** — Admin can create categories/brands individually, but there's no bulk import, and the initial seed only creates 1 of each. Without a populated database, the product management workflow is broken. | Critical for initial setup |
| MF-2 | **Payment method selection at checkout** — Bank transfer is configured in admin settings and validated in the API, but customers can never select it. | Lost revenue channel |
| MF-3 | **Server-side cart persistence** — Cart exists only in browser localStorage. Users lose their cart on different devices, incognito mode, or cache clearing. The database `Cart`/`CartItem` models exist but are dead code. | Poor UX for returning customers |

---

## 7. Database Problems

| # | Problem | Detail |
|---|---|---|
| DB-1 | **Insufficient seed data** | Only 1 category, 1 brand, 7 demo products. Not representative of a real wholesale catalog. New deployments show a nearly empty storefront. |
| DB-2 | **Cart tables completely unused** | `Cart` and `CartItem` models exist with full relations but no application code reads/writes to them. |
| DB-3 | **No database migration history** | No `prisma/migrations/` directory observed — using `db push` instead of proper migrations. Risk of schema drift between environments. |
| DB-4 | **No soft-delete for categories/brands** | Categories and brands use `isActive` boolean but can be hard-deleted. Products reference them with `onDelete: Restrict`, so deletion fails if products exist. No archival mechanism. |

---

## 8. API Problems

| # | Problem | Detail |
|---|---|---|
| API-1 | **No CSRF tokens for customer mutations** | Customer-facing POST endpoints (orders, quotes, registration) rely solely on rate limiting. Admin endpoints check `sec-fetch-site`/`origin` headers. Customer endpoints do not have this check. `sameSite: "lax"` cookies provide browser-level CSRF protection for form submissions but not for `fetch()` POST requests from third-party origins. |
| API-2 | **Process-local rate limiting only** | `checkRateLimit` uses an in-memory `Map`. On Vercel serverless, each instance has its own map. Effective rate limit is `limit × N_instances` where N can be high during cold starts. Not suitable for production abuse prevention. |
| API-3 | **No API versioning** | All endpoints are unversioned (`/api/orders`, `/api/admin/products`). Breaking changes require coordinated frontend/backend updates. |
| API-4 | **Quote PATCH endpoint at `[id]` level exists but no `[id]` GET** | Quote detail view for admin only gets data via the list endpoint. Single-quote detail endpoint is missing. |

---

## 9. Admin Problems

| # | Problem | Detail |
|---|---|---|
| ADM-1 | **No admin user management UI** | The admin panel has pages for customers, products, categories, brands, deals, quotes, orders, and settings — but **no page to manage admin users**. Cannot create new admins or deactivate existing ones from the UI. |
| ADM-2 | **No order export/reporting** | Admin can view orders but cannot export to CSV/Excel. No date-range filtering. No revenue reports beyond the dashboard summary. |
| ADM-3 | **Dashboard metrics lack date range** | Dashboard (`/api/admin/dashboard`) returns all-time totals. No way to filter by date range, compare periods, or track trends. |

---

## 10. Customer-Facing Problems

| # | Problem | Detail |
|---|---|---|
| CUS-1 | **No wishlist/favorites** | Customers cannot save products for later. |
| CUS-2 | **No order tracking for customers** | Registered customers have an account page but no way to track order status. The account page exists but order history integration may be incomplete. |
| CUS-3 | **Product search is basic** | Search uses simple `contains` with `insensitive` mode. No full-text search, no fuzzy matching, no relevance ranking. |
| CUS-4 | **No product reviews/ratings** | No mechanism for customer feedback on products. |

---

## 11. Security Concerns

| # | Concern | Severity | Detail |
|---|---|---|---|
| SEC-1 | **JWT secret fallback in middleware** | HIGH | `src/middleware.ts` `secret()` returns `null` if `AUTH_SECRET` is not set in production. When `null`, the middleware silently skips verification and redirects ALL admin routes to login. This is secure (denies access) but confusing — no error is logged or surfaced. In contrast, `src/lib/auth.ts` `jwtSecret()` **throws** an error in production without the secret. Inconsistent behavior. |
| SEC-2 | **Dev token in API response** | MEDIUM | Forgot-password returns reset token in response body when `NODE_ENV !== "production"`. Vercel preview deploys may leak this. |
| SEC-3 | **No account lockout** | LOW | Rate limiting is per-IP (8 login attempts per 15 minutes). No per-account lockout. Distributed attacks could brute-force passwords. Password policy (10 chars, uppercase, lowercase, number) mitigates this somewhat. |

---

## 12. Production Problems

| # | Problem | Detail |
|---|---|---|
| PRD-1 | **Middleware deprecation** | Next.js 16 deprecates `middleware.ts` in favor of `proxy`. Must migrate before Next.js 17. |
| PRD-2 | **`experimental.cpus: 1`** | Limits Turbopack to 1 CPU. Fine for small deployments but could bottleneck build times on larger codebases. |
| PRD-3 | **No Sentry/error tracking** | No error monitoring service integrated. Production errors go to `console.error` only. No alerting. |
| PRD-4 | **No health check endpoint** | No `/api/health` or `/api/ready` endpoint for uptime monitoring, load balancer health checks, or Railway/Vercel diagnostics. |
| PRD-5 | **Image optimization bypassed** | All external images served unoptimized due to missing `remotePatterns` (see BUG-002). |
| PRD-6 | **Static product pages with 60s revalidation** | Product pages have `export const revalidate = 60`. After an admin updates a product (stock change, price change, status change), storefront may show stale data for up to 60 seconds. No on-demand revalidation (`revalidatePath`/`revalidateTag`) is triggered from admin mutations except deals. |
| PRD-7 | **Only deals trigger `revalidatePath("/")`** | The deals API calls `revalidatePath("/")` on create/update. Product creation/update, category changes, and settings changes do **not** trigger revalidation. Stale homepage/shop content possible. |

---

## 13. Exact Fix Plan

Ordered by dependency (foundations first) and priority (critical/impactful first).

### Phase 1: CRITICAL — Unblock Core Functionality

| Step | Fix | Files | Effort | Bug |
|---|---|---|---|---|
| 1.1 | Add `remotePatterns` to `next.config.ts` for `*.public.blob.vercel-storage.com` | `next.config.ts` | 10 min | BUG-002 |
| 1.2 | Remove `unoptimized` workarounds from all components | 10 files | 30 min | BUG-002 |
| 1.3 | Expand seed data with 15+ realistic wholesale categories and 5+ brands | `prisma/seed.ts`, `src/lib/catalog.ts` | 1 hr | BUG-001 |
| 1.4 | Add category/brand management UI to admin settings (create, edit, toggle active) | New admin components | 3 hrs | BUG-001 |
| 1.5 | Add `where: { isActive: true }` filter to edit product page category query | `src/app/admin/(protected)/products/[id]/page.tsx` | 5 min | BUG-005 |
| 1.6 | Show warning banner when dropdowns use seed fallback data | `src/app/admin/(protected)/products/new/page.tsx` | 15 min | BUG-001 |

### Phase 2: HIGH — Core Business Logic

| Step | Fix | Files | Effort | Bug |
|---|---|---|---|---|
| 2.1 | Add payment method selection to checkout form | `src/components/commerce/checkout-form.tsx` | 1 hr | BUG-003 |
| 2.2 | Add `postalCode` to `CustomerDetails` type and checkout form | `src/lib/types.ts`, `src/components/commerce/checkout-form.tsx` | 30 min | BUG-004 |
| 2.3 | Implement order status state machine validation | `src/app/api/orders/[id]/route.ts` | 1 hr | BUG-006 |

### Phase 3: MEDIUM — Quality & Compatibility

| Step | Fix | Files | Effort | Bug |
|---|---|---|---|---|
| 3.1 | Fix `QuoteItem.quantity` type to `number` | `src/lib/types.ts` | 2 min | BUG-007 |
| 3.2 | Migrate middleware to proxy convention | `src/middleware.ts` → new proxy file | 2 hrs | BUG-008 |
| 3.3 | Remove dev token from forgot-password response (log to console only) | `src/app/api/auth/forgot-password/route.ts` | 10 min | BUG-009 |
| 3.4 | Unify middleware/auth secret handling (both throw or both degrade gracefully) | `src/middleware.ts`, `src/lib/auth.ts` | 15 min | SEC-1 |
| 3.5 | Add `revalidatePath`/`revalidateTag` to product, category, settings, and order APIs | `src/app/api/admin/products/route.ts`, `categories/route.ts`, `settings/route.ts`, `orders/[id]/route.ts` | 1 hr | PRD-6, PRD-7 |

### Phase 4: LOW — Polish & Hardening

| Step | Fix | Files | Effort | Bug |
|---|---|---|---|---|
| 4.1 | Remove `clientSubtotal` from checkout payload and validation schema (or implement reconciliation) | `checkout-form.tsx`, `validation.ts` | 15 min | BUG-010 |
| 4.2 | Add specific P2002 error message for registration | `src/app/api/auth/register/route.ts` | 10 min | BUG-011 |
| 4.3 | Fix header flash by passing server data as props | `src/components/layout/header.tsx`, layout files | 2 hrs | BUG-012 |
| 4.4 | Either connect cart to server-side DB or remove unused Cart/CartItem models | `store-provider.tsx`, `prisma/schema.prisma` | 3-8 hrs | BUG-013 |
| 4.5 | Implement email verification flow | New API endpoints + UI | 4-8 hrs | BUG-014 |

### Phase 5: Production Readiness

| Step | Fix | Files | Effort |
|---|---|---|---|
| 5.1 | Add `/api/health` endpoint | New route | 15 min |
| 5.2 | Add distributed rate limiting (Redis/Upstash) | `src/lib/auth.ts` | 2 hrs |
| 5.3 | Integrate error tracking (Sentry or equivalent) | `next.config.ts`, new integration | 2 hrs |
| 5.4 | Add admin user management page | New admin page | 3 hrs |
| 5.5 | Add order CSV export | New API endpoint + admin UI | 3 hrs |
| 5.6 | Initialize Prisma migrations directory (`prisma migrate dev --name init`) | `prisma/migrations/` | 15 min |

---

## Appendix A: Build Output Summary

```
✅ tsc --noEmit     → 0 errors
✅ eslint .         → 0 errors/warnings
✅ next build       → Compiled successfully, 64 pages generated, 0 errors
⚠️ Deprecation: "middleware" file convention deprecated (→ use "proxy")
```

## Appendix B: Files Inspected

| Category | Files |
|---|---|
| Config | `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `prisma/schema.prisma`, `prisma/seed.ts` |
| Auth | `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/me/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts` |
| Admin Pages | `src/app/admin/layout.tsx`, `src/app/admin/(protected)/layout.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/(protected)/products/new/page.tsx`, `src/app/admin/(protected)/products/[id]/page.tsx`, `src/app/admin/(protected)/products/page.tsx` |
| Admin APIs | `src/app/api/admin/products/route.ts`, `src/app/api/admin/products/[id]/route.ts`, `src/app/api/admin/categories/route.ts`, `src/app/api/admin/brands/route.ts`, `src/app/api/admin/deals/route.ts`, `src/app/api/admin/deals/[id]/route.ts`, `src/app/api/admin/customers/route.ts`, `src/app/api/admin/settings/route.ts`, `src/app/api/admin/media/route.ts`, `src/app/api/admin/dashboard/route.ts` |
| Admin Components | `src/app/admin/_components/product-editor.tsx`, `src/app/admin/_components/deals-manager.tsx` |
| Customer Pages | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/shop/page.tsx`, `src/app/shop/[category]/page.tsx`, `src/app/product/[slug]/page.tsx`, `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`, `src/app/account/page.tsx`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/search/page.tsx`, `src/app/contact/page.tsx`, `src/app/about/page.tsx`, `src/app/corporate-orders/page.tsx`, `src/app/request-quote/page.tsx` |
| Customer APIs | `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`, `src/app/api/quotes/route.ts`, `src/app/api/quotes/[id]/route.ts`, `src/app/api/catalog/route.ts`, `src/app/api/settings/public/route.ts`, `src/app/api/account/route.ts`, `src/app/api/account/addresses/route.ts` |
| Shared Libs | `src/lib/auth.ts`, `src/lib/db.ts`, `src/lib/catalog.ts`, `src/lib/catalog-server.ts`, `src/lib/types.ts`, `src/lib/validation.ts`, `src/lib/utils.ts`, `src/lib/blob.ts`, `src/lib/seo.ts`, `src/lib/company.ts`, `src/lib/analytics.ts`, `src/lib/deals.ts` |
| Components | `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`, `src/components/layout/brand-mark.tsx`, `src/components/providers/store-provider.tsx`, `src/components/commerce/checkout-form.tsx`, `src/components/commerce/cart-page-client.tsx`, `src/components/commerce/auth-forms.tsx`, `src/components/commerce/quote-form.tsx`, `src/components/catalog/product-card.tsx`, `src/components/catalog/product-gallery.tsx`, `src/components/catalog/product-quick-view.tsx`, `src/components/catalog/product-purchase.tsx`, `src/components/catalog/product-media-placeholder.tsx`, `src/components/catalog/stock-status.tsx`, `src/components/home/deals-slider.tsx`, `src/components/analytics/google-analytics.tsx` |

---

*End of QA Audit Report*
