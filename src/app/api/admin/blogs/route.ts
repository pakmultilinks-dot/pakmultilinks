import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";
import { requireDatabase, withDatabaseRetry } from "@/lib/db";
import { blogPostInputSchema, validationError } from "@/lib/validation";
import { ensureBlogPostsTable } from "@/lib/blog-posts-server";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    await ensureBlogPostsTable();
    const posts = await withDatabaseRetry(() => requireDatabase().blogPost.findMany({ orderBy: { updatedAt: "desc" } }));
    return NextResponse.json({ posts: serialize(posts) }, { headers: noStoreHeaders });
  } catch (error) { return apiFailure(error); }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    await ensureBlogPostsTable();
    const parsed = blogPostInputSchema.safeParse(await readJson(request, 100_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const data = parsed.data;
    const post = await withDatabaseRetry(() => requireDatabase().blogPost.create({ data: {
      ...data,
      imageUrl: data.imageUrl || null,
      imageAlt: data.imageAlt || null,
      publishedAt: data.isPublished ? new Date() : null,
    } }));
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json({ post: serialize(post) }, { status: 201, headers: noStoreHeaders });
  } catch (error) { return apiFailure(error); }
}
