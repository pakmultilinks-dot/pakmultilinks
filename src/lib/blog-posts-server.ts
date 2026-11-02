import "server-only";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";

export async function listPublishedBlogPosts() {
  if (!isDatabaseConfigured) return [];
  try {
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
    return await withDatabaseRetry(() => db.blogPost.findFirst({ where: { slug, isPublished: true } }));
  } catch (error) {
    console.error("[blogs] Could not load post", error);
    return null;
  }
}
