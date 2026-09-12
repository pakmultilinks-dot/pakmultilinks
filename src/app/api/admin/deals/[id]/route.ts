import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";
import { requireDatabase } from "@/lib/db";
import { deleteBlobs } from "@/lib/blob";
import { dealBannerInputSchema, validationError } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = dealBannerInputSchema.safeParse(await readJson(request, 12_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const data = parsed.data;
    const database = requireDatabase();
    const existing = await database.dealBanner.findUnique({ where: { id }, select: { imageUrl: true } });
    if (!existing) return jsonError("Deal banner not found.", 404);
    const deal = await database.dealBanner.update({
      where: { id },
      data: { ...data, alt: data.alt || null, linkUrl: data.linkUrl || "/shop" },
    });
    // Clean up old blob if the image URL changed
    if (existing.imageUrl !== deal.imageUrl) {
      await deleteBlobs([existing.imageUrl]);
    }
    revalidatePath("/");
    return NextResponse.json({ deal: serialize(deal) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const { id } = await context.params;
    const database = requireDatabase();
    const existing = await database.dealBanner.findUnique({ where: { id }, select: { imageUrl: true } });
    await database.dealBanner.delete({ where: { id } });
    if (existing) await deleteBlobs([existing.imageUrl]);
    revalidatePath("/");
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
