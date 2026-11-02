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
    revalidatePath("/rate-list");
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
    const existing = await database.brand.findUnique({
      where: { id },
      select: { id: true, isActive: true, logoUrl: true, _count: { select: { products: true } } },
    });
    if (!existing) return jsonError("Brand not found.", 404);

    if (existing.isActive) {
      const brand = await database.brand.update({ where: { id }, data: { isActive: false } });
      revalidatePath("/", "layout");
      revalidatePath("/shop");
      revalidatePath("/rate-list");
      revalidatePath("/admin/brands");
      return NextResponse.json({ brand: serialize(brand), deleted: false }, { headers: noStoreHeaders });
    }

    if (existing._count.products > 0) {
      return jsonError(
        `This archived brand still has ${existing._count.products} product${existing._count.products === 1 ? "" : "s"}. Move those products to another brand before deleting it.`,
        409,
      );
    }

    await database.brand.delete({ where: { id } });
    if (existing.logoUrl) await deleteBlobs([existing.logoUrl]);
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/rate-list");
    revalidatePath("/admin/brands");
    return NextResponse.json({ ok: true, deleted: true }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
