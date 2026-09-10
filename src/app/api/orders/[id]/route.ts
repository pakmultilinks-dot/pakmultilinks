import { NextResponse, type NextRequest } from "next/server";
import { OrderStatus } from "@prisma/client";
import { requireDatabase } from "@/lib/db";
import { orderStatusSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const { id } = await context.params;
    const order = await requireDatabase().order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return jsonError("Order not found.", 404);
    return NextResponse.json({ order: serialize(order) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = orderStatusSchema.safeParse(await readJson(request, 4_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const database = requireDatabase();
    const order = await database.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!existing) throw new MissingOrderError();
      if (existing.status === OrderStatus.CANCELLED && parsed.data.status !== OrderStatus.CANCELLED) {
        throw new InvalidOrderTransitionError("Cancelled orders cannot be reopened. Create a new order so stock is checked again.");
      }
      if (existing.status !== OrderStatus.CANCELLED && parsed.data.status === OrderStatus.CANCELLED) {
        for (const item of existing.items) {
          if (item.productId) {
            await tx.product.updateMany({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
            await tx.product.updateMany({
              where: { id: item.productId, soldQuantity: { gte: item.quantity } },
              data: { soldQuantity: { decrement: item.quantity } },
            });
          }
        }
      }
      return tx.order.update({
        where: { id },
        data: { status: parsed.data.status, paymentStatus: parsed.data.paymentStatus },
        include: { items: true },
      });
    });
    return NextResponse.json({ order: serialize(order) }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof MissingOrderError) return jsonError("Order not found.", 404);
    if (error instanceof InvalidOrderTransitionError) return jsonError(error.message, 409);
    return apiFailure(error);
  }
}

class MissingOrderError extends Error {}
class InvalidOrderTransitionError extends Error {}
