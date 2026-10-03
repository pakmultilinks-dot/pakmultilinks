import { categoryParentError } from "@/lib/category-tree";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { categoryInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";
import { deleteBlobs } from "@/lib/blob";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = categoryInputSchema.safeParse(await readJson(request, 12_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const data = parsed.data;
    const database = requireDatabase();
    const existing = await database.category.findUnique({ where: { id }, select: { imageUrl: true } });
    if (!existing) return jsonError("Category not found.", 404);
    const category = await database.$transaction(async (tx) => {
      const error = await categoryParentError(tx, data.parentId, id);
      if (error) return { error };
      return tx.category.update({ where: { id }, data: { ...data, description: data.description || null, imageUrl: data.imageUrl || null, icon: data.icon || null } });
    }, { isolationLevel: "Serializable" });
    if ("error" in category) return jsonError(category.error, 400);
    if (existing.imageUrl && existing.imageUrl !== category.imageUrl) {
      await deleteBlobs([existing.imageUrl]);
    }
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    return NextResponse.json({ category: serialize(category) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const { id } = await context.params;
    const database = requireDatabase();
    const category = await database.category.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/", "layout");
    return NextResponse.json({ category: serialize(category) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
