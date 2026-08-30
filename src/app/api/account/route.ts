import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { requireDatabase } from "@/lib/db";
import { profileSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, serialize } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getRequestSession(request);
    if (!session || session.role !== "CUSTOMER") return jsonError("Customer sign-in required.", 401);
    const user = await requireDatabase().user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, orderNumber: true, status: true, paymentStatus: true, total: true, requiresQuote: true, createdAt: true, _count: { select: { items: true } } },
        },
      },
    });
    if (!user) return jsonError("Account not found.", 404);
    const { addresses, orders, ...profile } = user;
    return NextResponse.json(
      {
        user: serialize(profile),
        addresses: addresses.map(({ line1, ...address }) => ({ ...address, address: line1 })),
        orders: serialize(orders),
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getRequestSession(request);
    if (!session || session.role !== "CUSTOMER") return jsonError("Customer sign-in required.", 401);
    if (request.headers.get("sec-fetch-site") === "cross-site") return jsonError("Request rejected.", 403);
    const parsed = profileSchema.safeParse(await readJson(request, 4_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const user = await requireDatabase().user.update({
      where: { id: session.userId },
      data: { name: parsed.data.name, phone: parsed.data.phone || null },
      select: { id: true, name: true, email: true, phone: true },
    });
    return NextResponse.json({ user }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
