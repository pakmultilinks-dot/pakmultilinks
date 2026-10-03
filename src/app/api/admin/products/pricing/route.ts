import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { pricingBatchSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest } from "@/app/api/_utils";

class PricingConflict extends Error {}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = pricingBatchSchema.safeParse(await readJson(request, 64_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const products = await requireDatabase().$transaction(async tx => {
      for (const row of parsed.data.products) {
        const { id, updatedAt, ...data } = row;
        const result = await tx.product.updateMany({ where: { id, updatedAt: new Date(updatedAt), status: { not: "ARCHIVED" } }, data });
        if (result.count !== 1) throw new PricingConflict();
      }
      return tx.product.findMany({ where: { id: { in: parsed.data.products.map(row => row.id) } }, select: { id: true, updatedAt: true } });
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ products }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof PricingConflict) return jsonError("A product changed since you opened this page. Reload to review the latest values. No changes were saved.", 409);
    return apiFailure(error);
  }
}
