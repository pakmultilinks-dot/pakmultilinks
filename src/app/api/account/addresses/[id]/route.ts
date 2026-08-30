import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { requireDatabase } from "@/lib/db";
import { accountAddressSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson } from "@/app/api/_utils";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const session = await getRequestSession(request);
    if (!session || session.role !== "CUSTOMER") return jsonError("Customer sign-in required.", 401);
    if (request.headers.get("sec-fetch-site") === "cross-site") return jsonError("Request rejected.", 403);
    const parsed = accountAddressSchema.safeParse(await readJson(request, 8_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const database = requireDatabase();
    const owned = await database.address.findFirst({ where: { id, userId: session.userId } });
    if (!owned) return jsonError("Address not found.", 404);
    const address = await database.$transaction(async (tx) => {
      if (parsed.data.isDefault) await tx.address.updateMany({ where: { userId: session.userId }, data: { isDefault: false } });
      return tx.address.update({
        where: { id },
        data: {
          label: parsed.data.label,
          line1: parsed.data.address,
          city: parsed.data.city,
          province: parsed.data.province,
          isDefault: parsed.data.isDefault,
          fullName: parsed.data.fullName || owned.fullName,
          phone: parsed.data.phone || owned.phone,
          company: parsed.data.company || null,
          postalCode: parsed.data.postalCode || null,
        },
      });
    });
    const { line1, ...rest } = address;
    return NextResponse.json({ address: { ...rest, address: line1 } }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const session = await getRequestSession(request);
    if (!session || session.role !== "CUSTOMER") return jsonError("Customer sign-in required.", 401);
    if (request.headers.get("sec-fetch-site") === "cross-site") return jsonError("Request rejected.", 403);
    const { id } = await context.params;
    const deleted = await requireDatabase().address.deleteMany({ where: { id, userId: session.userId } });
    if (!deleted.count) return jsonError("Address not found.", 404);
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
