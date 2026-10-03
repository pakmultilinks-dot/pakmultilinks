import { categoryParentError } from "@/lib/category-tree";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { categoryInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const categories = await requireDatabase().category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } });
    return NextResponse.json({ categories: serialize(categories) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = categoryInputSchema.safeParse(await readJson(request, 12_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const data = parsed.data;
    const category = await requireDatabase().$transaction(async (tx) => {
      const error = await categoryParentError(tx, data.parentId);
      if (error) return { error };
      return tx.category.create({ data: { ...data, parentId: data.parentId || null, description: data.description || null, imageUrl: data.imageUrl || null, icon: data.icon || null } });
    }, { isolationLevel: "Serializable" });
    if ("error" in category) return jsonError(category.error, 400);
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    return NextResponse.json({ category: serialize(category) }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
