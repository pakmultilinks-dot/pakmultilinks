import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { brandInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";
import { deleteBlobs } from "@/lib/blob";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = brandInputSchema.safeParse(await readJson(request, 8_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const data = parsed.data;
    const database = requireDatabase();
    const existing = await database.brand.findUnique({ where: { id }, select: { logoUrl: true } });
    if (!existing) return jsonError("Brand not found.", 404);
    const brand = await database.brand.update({ where: { id }, data: { ...data, logoUrl: data.logoUrl || null } });
    if (existing.logoUrl && existing.logoUrl !== brand.logoUrl) {
      await deleteBlobs([existing.logoUrl]);
    }
    revalidatePath("/");
    revalidatePath("/shop");
    return NextResponse.json({ brand: serialize(brand) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const { id } = await context.params;
    const database = requireDatabase();
    const existing = await database.brand.findUnique({ where: { id }, select: { logoUrl: true } });
    const brand = await database.brand.update({ where: { id }, data: { isActive: false } });
    if (existing?.logoUrl) await deleteBlobs([existing.logoUrl]);
    return NextResponse.json({ brand: serialize(brand) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
