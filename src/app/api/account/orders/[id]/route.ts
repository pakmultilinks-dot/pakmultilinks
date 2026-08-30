import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { requireDatabase } from "@/lib/db";
import { apiFailure, jsonError, noStoreHeaders, serialize } from "@/app/api/_utils";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const session = await getRequestSession(request);
    if (!session || session.role !== "CUSTOMER") return jsonError("Customer sign-in required.", 401);
    const { id } = await context.params;
    const order = await requireDatabase().order.findFirst({
      where: { id, userId: session.userId },
      include: { items: true },
    });
    if (!order) return jsonError("Order not found.", 404);
    return NextResponse.json({ order: serialize(order) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
