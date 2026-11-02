import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ProductStatus } from "@prisma/client";
import { z } from "zod";
import { requireDatabase } from "@/lib/db";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest } from "@/app/api/_utils";

type Context = { params: Promise<{ id: string }> };

const visibilitySchema = z.object({ visible: z.boolean() }).strict();

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    if (request.headers.get("sec-fetch-site") === "cross-site") return jsonError("Request rejected.", 403);

    const parsed = visibilitySchema.safeParse(await readJson(request, 1_000));
    if (!parsed.success) return jsonError("Visible must be true or false.", 400);

    const { id } = await context.params;
    const database = requireDatabase();
    const existing = await database.product.findUnique({ where: { id }, select: { id: true, slug: true } });
    if (!existing) return jsonError("Product not found.", 404);

    const status = parsed.data.visible ? ProductStatus.ACTIVE : ProductStatus.ARCHIVED;
    await database.product.update({ where: { id }, data: { status } });

    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/shop/[category]", "page");
    revalidatePath("/rate-list");
    revalidatePath("/brands/[slug]", "page");
    revalidatePath("/api/catalog");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${existing.slug}`);

    return NextResponse.json({ ok: true, status, visible: parsed.data.visible }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
