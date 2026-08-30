import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma, ProductStatus } from "@prisma/client";
import { checkRateLimit, getRequestSession, requestFingerprint } from "@/lib/auth";
import { requireDatabase } from "@/lib/db";
import { orderCreateSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, pagination, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

function newOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `PMH-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`order:${requestFingerprint(request)}`, 12, 30 * 60_000);
  if (!rate.allowed) return jsonError("Too many order attempts. Please try again later.", 429, { retryAfter: rate.retryAfter });

  try {
    const parsed = orderCreateSchema.safeParse(await readJson(request, 40_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const database = requireDatabase();
    const quantities = new Map<string, number>();
    for (const item of parsed.data.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    if ([...quantities.values()].some((quantity) => quantity > 10_000)) return jsonError("A product quantity cannot exceed 10,000 cartons per order.", 400);
    const normalizedItems = [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
    const session = await getRequestSession(request);

    const created = await database.$transaction(
      async (tx) => {
        const products = await tx.product.findMany({
          where: { id: { in: normalizedItems.map((item) => item.productId) }, status: ProductStatus.ACTIVE },
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        });
        if (products.length !== normalizedItems.length) throw new OrderInputError("One or more products are no longer available.");

        const settings = await tx.siteSettings.findUnique({ where: { id: "main" }, select: { taxRate: true, bankTransferEnabled: true } });
        const requiresQuote = products.some((product) => product.priceOnRequest);
        const wantsBankTransfer = parsed.data.paymentMethod === "Bank Transfer" || parsed.data.paymentMethod === "BANK_TRANSFER";
        if (wantsBankTransfer && !settings?.bankTransferEnabled && process.env.ENABLE_BANK_TRANSFER !== "true") {
          throw new OrderInputError("Bank transfer is not currently configured. Please select Cash on Delivery.");
        }
        let subtotal = new Prisma.Decimal(0);
        const lines = [];
        for (const item of normalizedItems) {
          const product = products.find((candidate) => candidate.id === item.productId)!;
          if (item.quantity < product.minimumOrderCartons) {
            throw new OrderInputError(`${product.name} requires at least ${product.minimumOrderCartons} carton${product.minimumOrderCartons === 1 ? "" : "s"}.`);
          }
          if (!product.allowBackorder && product.stock < item.quantity) {
            throw new OrderInputError(`${product.name} has only ${product.stock} carton${product.stock === 1 ? "" : "s"} available.`);
          }
          const changed = await tx.product.updateMany({
            where: {
              id: product.id,
              ...(product.allowBackorder ? {} : { stock: { gte: item.quantity } }),
            },
            data: { stock: { decrement: item.quantity }, soldQuantity: { increment: item.quantity } },
          });
          if (changed.count !== 1) throw new OrderInputError(`${product.name} stock changed. Please review your quantity.`);
          const unitPrice = product.salePrice ?? product.price;
          const lineTotal = unitPrice.mul(item.quantity);
          subtotal = subtotal.add(lineTotal);
          lines.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            imageUrl: product.images[0]?.url,
            unitPrice,
            quantity: item.quantity,
            lineTotal,
          });
        }

        const deliveryFee = new Prisma.Decimal(0);
        const taxAmount = subtotal.mul(settings?.taxRate ?? 0).div(100).toDecimalPlaces(2);
        const customer = parsed.data.customer;
        return tx.order.create({
          data: {
            orderNumber: newOrderNumber(),
            userId: session?.role === "CUSTOMER" ? session.userId : null,
            customerName: customer.fullName,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            companyName: customer.companyName || null,
            ntn: customer.ntn || null,
            province: customer.province,
            city: customer.city,
            address: customer.address,
            postalCode: customer.postalCode || null,
            notes: customer.notes || null,
            subtotal,
            deliveryFee,
            taxAmount,
            total: subtotal.add(deliveryFee).add(taxAmount),
            requiresQuote,
            paymentMethod:
              wantsBankTransfer
                ? PaymentMethod.BANK_TRANSFER
                : PaymentMethod.CASH_ON_DELIVERY,
            paymentStatus:
              wantsBankTransfer
                ? PaymentStatus.AWAITING_TRANSFER
                : PaymentStatus.PENDING,
            items: { create: lines },
          },
          select: { id: true, orderNumber: true, status: true, total: true, requiresQuote: true, createdAt: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return NextResponse.json({ order: serialize(created) }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof OrderInputError) return jsonError(error.message, 409, { code: "STOCK_OR_PRODUCT_CHANGED" });
    return apiFailure(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminRequest(request);
    if (!admin) return jsonError("Administrator access required.", 401);
    const database = requireDatabase();
    const { page, take, skip } = pagination(request);
    const requestedStatus = request.nextUrl.searchParams.get("status");
    const status = Object.values(OrderStatus).includes(requestedStatus as OrderStatus) ? (requestedStatus as OrderStatus) : undefined;
    const where = status ? { status } : {};
    const [orders, total] = await database.$transaction([
      database.order.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { items: true } }),
      database.order.count({ where }),
    ]);
    return NextResponse.json({ orders: serialize(orders), pagination: { page, limit: take, total } }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

class OrderInputError extends Error {}
