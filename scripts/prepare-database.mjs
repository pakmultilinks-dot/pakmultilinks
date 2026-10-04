import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';

nextEnv.loadEnvConfig(process.cwd());

// The existing production catalogue predates category nesting. Apply only this
// additive change before Next.js queries the catalogue during prerendering.
// Do not run db push or seed here: both can affect unrelated production data.
if (!process.env.DATABASE_URL?.trim()) {
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error('Production requires DATABASE_URL. Configure it in Vercel before deploying.');
  }
  console.log('No database configured; skipping the category schema update.');
} else {
  const db = new PrismaClient();
  try {
    await db.$transaction(async tx => {
      // Serialise overlapping builds before acquiring table locks.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(731245819)`;
      await tx.$executeRaw`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "parentId" TEXT`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category" ("parentId")`;
      await tx.$executeRaw`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'Category_parentId_fkey'
              AND conrelid = '"Category"'::regclass
          ) THEN
            ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey"
              FOREIGN KEY ("parentId") REFERENCES "Category"("id")
              ON DELETE RESTRICT ON UPDATE CASCADE;
          END IF;
        END $$
      `;
    }, { timeout: 30000, maxWait: 10000 });
    console.log('Category schema is ready; existing products, prices and categories preserved.');
  } catch (error) {
    console.error('Category schema update failed. Verify the production database connection and ALTER permissions before redeploying.');
    throw error;
  } finally {
    await db.$disconnect();
  }
}
