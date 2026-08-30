# Pak Multilinks Hygiene

A responsive Next.js wholesale commerce application for **Pak Multilinks Hygiene — Corporate Supplies**, built around carton ordering and corporate quotation workflows.

The application includes a storefront, carton/MOQ product details, persistent bulk cart, guest order requests, quotation forms, customer authentication routes, a protected admin area, authenticated product media management, PostgreSQL/Prisma models, SEO routes and accessible responsive layouts.

> **Pre-launch status:** Seven business-provided product names are loaded. Exact pieces-per-carton, MOQ, carton prices, stock and operational policies must be verified in Admin before accepting live orders.

## Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- PostgreSQL with Prisma ORM
- Zod validation
- Signed HTTP-only session cookies and bcrypt password hashing
- Lucide icons

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Configure a PostgreSQL `DATABASE_URL` and replace `AUTH_SECRET` with a long random value.

4. Generate the Prisma client and apply the schema:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Seed development-only catalog records:

   ```bash
   npm run db:seed
   ```

6. Start the application:

   ```bash
   npm run dev
   ```

Open the URL printed by Next.js. It uses [http://localhost:3000](http://localhost:3000) when that port is available.

## Admin setup

The `/admin` area is protected. Configure:

- `ADMIN_EMAIL`
- `AUTH_SECRET`
- `ADMIN_PASSWORD` for local development only, or `ADMIN_PASSWORD_HASH` for production

Generate a bcrypt hash without storing the plain password in source control:

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'your-strong-password'
```

Place the result in `ADMIN_PASSWORD_HASH`. The development plain-password fallback is rejected in production.

Password-reset email delivery is adapter-based: configure `PASSWORD_RESET_WEBHOOK_URL`
to a trusted transactional-email endpoint and optionally set
`PASSWORD_RESET_WEBHOOK_SECRET`. The endpoint receives the destination email and
reset URL. Production reset requests fail explicitly when delivery is not configured.

Bank transfer remains rejected by both the UI and API until it is enabled in site
settings or with `ENABLE_BANK_TRANSFER=true` after verified account instructions
have been configured.

## Data behavior

- With PostgreSQL configured, server endpoints validate and store customers, orders, quotes and inventory updates in the database.
- Without a database, the customer-facing experience remains previewable and explicitly identifies development-mode local persistence where it is used. Local fallback data is not production storage.
- Cart state is persisted in the browser and enforces carton MOQ and known carton-stock limits.
- Delivery charges, tax, bank details, WhatsApp and business policies remain unconfigured until verified values are supplied through environment variables or Admin > Settings.

## Key routes

| Area | Routes |
| --- | --- |
| Storefront | `/`, `/shop`, `/shop/[category]`, `/product/[slug]`, `/search` |
| Commerce | `/cart`, `/checkout`, `/order-confirmation/[id]` |
| Corporate | `/corporate-orders`, `/request-quote` |
| Account | `/login`, `/register`, `/forgot-password` (reset token flow), `/account` |
| Admin | `/admin`, `/admin/products`, `/admin/categories`, `/admin/brands`, `/admin/orders`, `/admin/quotes`, `/admin/customers`, `/admin/settings` |
| Support | `/about`, `/contact`, `/privacy`, `/terms`, `/returns` |

## Verification

Run before deployment:

```bash
npm run db:generate
npm run lint
npm run typecheck
npm run build
```

See [Launch checklist](docs/LAUNCH-CHECKLIST.md) for business information that must be confirmed.

## Media architecture

Product images are optional. Products without media use an intentional storefront placeholder. Admin product editing supports authenticated drag/drop and multi-file upload, preview, alt text, primary-image selection, ordering, URL entry and removal from the product record. Local uploads accept signature-validated JPG, PNG and WebP files up to 5 MB and are stored under `public/uploads/products/`.

For multi-instance production deployment, replace local upload storage with Cloudinary, S3 or equivalent durable object storage while keeping the stored URL model.
# Pak-Multilinks
