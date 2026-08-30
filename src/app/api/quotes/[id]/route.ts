import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { quoteStatusSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = quoteStatusSchema.safeParse(await readJson(request, 6_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const exists = await requireDatabase().quoteRequest.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return jsonError("Quotation request not found.", 404);
    const quote = await requireDatabase().quoteRequest.update({
      where: { id },
      data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes || null },
      include: { items: true },
    });
    return NextResponse.json({ quote: serialize(quote) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
