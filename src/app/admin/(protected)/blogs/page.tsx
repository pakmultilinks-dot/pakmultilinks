import { BlogManager, type EditableBlogPost } from "../../_components/blog-manager";
import { DemoNotice, PageHeading } from "../../_components/ui";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
import { ensureBlogPostsTable, ensureBuiltInBlogDrafts } from "@/lib/blog-posts-server";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  let connected = isDatabaseConfigured;
  let posts: EditableBlogPost[] = [];
  if (connected) {
    try {
      await ensureBlogPostsTable();
      await ensureBuiltInBlogDrafts();
      const rows = await withDatabaseRetry(() => db.blogPost.findMany({ orderBy: { updatedAt: "desc" } }));
      posts = rows.map((post) => ({ ...post, imageUrl: post.imageUrl || "", imageAlt: post.imageAlt || "" }));
    } catch (error) { console.error("[AdminBlogs]", error); connected = false; }
  }
  return <><PageHeading eyebrow="Content management" title="Blog posts" description="Write, edit, publish and remove SEO buying guides shown in the public Blogs section." />{!connected && <DemoNotice />}<BlogManager initialPosts={posts} disabled={!connected} /></>;
}
