import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { brandInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = brandInputSchema.safeParse(await readJson(request, 8_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const data = parsed.data;
    const brand = await requireDatabase().brand.update({ where: { id }, data: { ...data, logoUrl: data.logoUrl || null } });
    return NextResponse.json({ brand: serialize(brand) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const { id } = await context.params;
    const brand = await requireDatabase().brand.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ brand: serialize(brand) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
