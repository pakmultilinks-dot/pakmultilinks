import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { categoryInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = categoryInputSchema.safeParse(await readJson(request, 12_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const data = parsed.data;
    const category = await requireDatabase().category.update({ where: { id }, data: { ...data, description: data.description || null, imageUrl: data.imageUrl || null, icon: data.icon || null } });
    return NextResponse.json({ category: serialize(category) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const { id } = await context.params;
    const category = await requireDatabase().category.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ category: serialize(category) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
