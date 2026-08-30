import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { requireDatabase } from "@/lib/db";
import { accountAddressSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson } from "@/app/api/_utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getRequestSession(request);
    if (!session || session.role !== "CUSTOMER") return jsonError("Customer sign-in required.", 401);
    if (request.headers.get("sec-fetch-site") === "cross-site") return jsonError("Request rejected.", 403);
    const parsed = accountAddressSchema.safeParse(await readJson(request, 8_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const database = requireDatabase();
    const profile = await database.user.findUnique({ where: { id: session.userId }, select: { name: true, phone: true } });
    if (!profile) return jsonError("Account not found.", 404);
    const address = await database.$transaction(async (tx) => {
      if (parsed.data.isDefault) await tx.address.updateMany({ where: { userId: session.userId }, data: { isDefault: false } });
      return tx.address.create({
        data: {
          label: parsed.data.label,
          line1: parsed.data.address,
          city: parsed.data.city,
          province: parsed.data.province,
          isDefault: parsed.data.isDefault,
          fullName: parsed.data.fullName || profile.name,
          phone: parsed.data.phone || profile.phone || "Not provided",
          company: parsed.data.company || null,
          postalCode: parsed.data.postalCode || null,
          userId: session.userId,
        },
      });
    });
    const { line1, ...rest } = address;
    return NextResponse.json({ address: { ...rest, address: line1 } }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
