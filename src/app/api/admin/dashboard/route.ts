import { NextResponse, type NextRequest } from "next/server";
import { OrderStatus, QuoteStatus } from "@prisma/client";
import { requireDatabase } from "@/lib/db";
import { apiFailure, jsonError, noStoreHeaders, requireAdminRequest, serialize } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const database = requireDatabase();
    const [totalOrders, revenue, totalProducts, customers, pendingOrders, quoteRequests, lowStockProducts] = await database.$transaction([
      database.order.count(),
      database.order.aggregate({ where: { status: { not: OrderStatus.CANCELLED } }, _sum: { total: true } }),
      database.product.count({ where: { status: { not: "ARCHIVED" } } }),
      database.user.count({ where: { role: "CUSTOMER" } }),
      database.order.count({ where: { status: OrderStatus.PENDING } }),
      database.quoteRequest.count({ where: { status: { in: [QuoteStatus.NEW, QuoteStatus.CONTACTED] } } }),
      database.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "Product" WHERE "status" <> 'ARCHIVED' AND "stock" <= "lowStockThreshold"`,
    ]);
    return NextResponse.json(
      {
        metrics: serialize({
          totalOrders,
          totalRevenue: revenue._sum.total ?? 0,
          totalProducts,
          customers,
          pendingOrders,
          quoteRequests,
          lowStockProducts: Number(lowStockProducts[0]?.count ?? 0),
        }),
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return apiFailure(error);
  }
}
