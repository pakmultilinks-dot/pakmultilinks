import "server-only";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";

let setupPromise: Promise<void> | undefined;

/** Additive bootstrap for deployments that use Prisma db push instead of migrations. */
export function ensureBlogPostsTable() {
  if (!isDatabaseConfigured) return Promise.resolve();
  setupPromise ??= (async () => {
    await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BlogPost" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "excerpt" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'Buying Guide',
      "imageUrl" TEXT,
      "imageAlt" TEXT,
      "isPublished" BOOLEAN NOT NULL DEFAULT FALSE,
      "publishedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`);
    await db.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug")');
    await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "BlogPost_isPublished_publishedAt_idx" ON "BlogPost"("isPublished", "publishedAt")');
    await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "BlogPost_category_idx" ON "BlogPost"("category")');
  })().catch((error) => { setupPromise = undefined; throw error; });
  return setupPromise;
}

export async function listPublishedBlogPosts() {
  if (!isDatabaseConfigured) return [];
  try {
    await ensureBlogPostsTable();
    return await withDatabaseRetry(() => db.blogPost.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }));
  } catch (error) {
    console.error("[blogs] Could not load published posts", error);
    return [];
  }
}

export async function getPublishedBlogPost(slug: string) {
  if (!isDatabaseConfigured) return null;
  try {
    await ensureBlogPostsTable();
    return await withDatabaseRetry(() => db.blogPost.findFirst({ where: { slug, isPublished: true } }));
  } catch (error) {
    console.error("[blogs] Could not load post", error);
    return null;
  }
}
