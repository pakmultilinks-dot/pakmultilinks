import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";
import { requireDatabase, withDatabaseRetry } from "@/lib/db";
import { blogPostUpdateSchema, validationError } from "@/lib/validation";
import { ensureBlogPostsTable } from "@/lib/blog-posts-server";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    await ensureBlogPostsTable();
    const parsed = blogPostUpdateSchema.safeParse(await readJson(request, 100_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const id = (await params).id;
    const previous = await requireDatabase().blogPost.findUniqueOrThrow({ where: { id } });
    const data = parsed.data;
    const post = await withDatabaseRetry(() => requireDatabase().blogPost.update({ where: { id }, data: {
      ...data,
      imageUrl: data.imageUrl === undefined ? undefined : data.imageUrl || null,
      imageAlt: data.imageAlt === undefined ? undefined : data.imageAlt || null,
      publishedAt: data.isPublished === undefined ? undefined : data.isPublished ? previous.publishedAt ?? new Date() : null,
    } }));
    revalidatePath("/blog"); revalidatePath(`/blog/${previous.slug}`); revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json({ post: serialize(post) }, { headers: noStoreHeaders });
  } catch (error) { return apiFailure(error); }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    await ensureBlogPostsTable();
    const id = (await params).id;
    const post = await withDatabaseRetry(() => requireDatabase().blogPost.delete({ where: { id } }));
    revalidatePath("/blog"); revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) { return apiFailure(error); }
}
