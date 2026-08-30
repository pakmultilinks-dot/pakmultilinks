import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { apiFailure, jsonError, noStoreHeaders, pagination, requireAdminRequest, serialize } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const database = requireDatabase();
    const { page, take, skip } = pagination(request);
    const search = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100);
    const where = {
      role: "CUSTOMER" as const,
      ...(search
        ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] }
        : {}),
    };
    const [users, total] = await database.$transaction([
      database.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: { where: { status: { not: "CANCELLED" } } } } },
          orders: {
            where: { status: { not: "CANCELLED" } },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
          },
        },
      }),
      database.user.count({ where }),
    ]);
    const spending = users.length
      ? await database.order.groupBy({
          by: ["userId"],
          where: { userId: { in: users.map((user) => user.id) }, status: { not: "CANCELLED" } },
          _sum: { total: true },
        })
      : [];
    const spendingByUser = new Map(spending.map((entry) => [entry.userId, entry._sum.total]));
    const customers = users.map(({ orders, _count, ...user }) => ({
      ...user,
      orderCount: _count.orders,
      totalSpending: spendingByUser.get(user.id) ?? 0,
      recentOrders: orders,
    }));
    return NextResponse.json({ customers: serialize(customers), pagination: { page, limit: take, total } }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
