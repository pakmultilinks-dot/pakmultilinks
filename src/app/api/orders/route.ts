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
    const lineMap = new Map<string, { productId: string; variantId?: string; quantity: number }>();
    for (const item of parsed.data.items) {
      const key = `${item.productId}:${item.variantId || ""}`;
      const existing = lineMap.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        lineMap.set(key, { productId: item.productId, variantId: item.variantId, quantity: item.quantity });
      }
    }
    if ([...lineMap.values()].some((item) => item.quantity > 10_000)) {
      return jsonError("A product quantity cannot exceed 10,000 cartons per order.", 400);
    }
    const normalizedItems = [...lineMap.values()];
    const session = await getRequestSession(request);

    const created = await database.$transaction(
      async (tx) => {
        const uniqueProductIds = [...new Set(normalizedItems.map((item) => item.productId))];
        const products = await tx.product.findMany({
          where: {
            id: { in: uniqueProductIds },
            status: ProductStatus.ACTIVE,
            category: { isActive: true, OR: [{ parentId: null }, { parent: { isActive: true } }] },
          },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            variants: { where: { isActive: true } },
          },
        });
        if (products.length !== uniqueProductIds.length) {
          throw new OrderInputError("One or more products are no longer available.");
        }

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

          if (item.variantId) {
            const variant = product.variants.find((v) => v.id === item.variantId);
            if (!variant) {
              throw new OrderInputError(`The selected variant for ${product.name} is no longer available.`);
            }
            if (item.quantity < variant.minimumOrderCartons) {
              throw new OrderInputError(`${product.name} (${variant.label}) requires at least ${variant.minimumOrderCartons} carton${variant.minimumOrderCartons === 1 ? "" : "s"}.`);
            }
            if (!product.allowBackorder && variant.stock < item.quantity) {
              throw new OrderInputError(`${product.name} (${variant.label}) has only ${variant.stock} carton${variant.stock === 1 ? "" : "s"} available.`);
            }

            const changed = await tx.productVariant.updateMany({
              where: {
                id: variant.id,
                ...(product.allowBackorder ? {} : { stock: { gte: item.quantity } }),
              },
              data: { stock: { decrement: item.quantity } },
            });
            if (changed.count !== 1) {
              throw new OrderInputError(`${product.name} (${variant.label}) stock changed. Please review your quantity.`);
            }

            await tx.product.update({
              where: { id: product.id },
              data: { soldQuantity: { increment: item.quantity } },
            });

            const unitPrice = variant.salePrice ?? variant.price;
            const lineTotal = unitPrice.mul(item.quantity);
            subtotal = subtotal.add(lineTotal);
            lines.push({
              productId: product.id,
              variantId: variant.id,
              variantLabel: variant.label,
              variantSku: variant.sku,
              productName: `${product.name} — ${variant.label}`,
              sku: variant.sku,
              imageUrl: variant.imageUrl || product.images[0]?.url,
              unitPrice,
              quantity: item.quantity,
              lineTotal,
            });
          } else {
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
        }

        if (!requiresQuote && subtotal.lt(5000)) {
          throw new OrderInputError("Minimum order value is PKR 5,000. Orders below PKR 5,000 cannot be processed.");
        }

        const deliveryFee = new Prisma.Decimal(0);
        const taxAmount = subtotal.mul(settings?.taxRate ?? 0).div(100).toDecimalPlaces(2);
        const customer = parsed.data.customer;

        if (session?.role === "CUSTOMER") {
          await tx.user.update({
            where: { id: session.userId },
            data: { name: customer.fullName, phone: customer.phone },
          });
          const savedAddress = await tx.address.findFirst({
            where: { userId: session.userId },
            orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
            select: { id: true },
          });
          const addressData = {
            label: "Delivery",
            fullName: customer.fullName,
            phone: customer.phone,
            company: customer.companyName || null,
            province: customer.province,
            city: customer.city,
            line1: customer.address,
            postalCode: customer.postalCode || null,
            isDefault: true,
          };
          await tx.address.updateMany({
            where: { userId: session.userId, isDefault: true },
            data: { isDefault: false },
          });
          if (savedAddress) {
            await tx.address.update({ where: { id: savedAddress.id }, data: addressData });
          } else {
            await tx.address.create({ data: { ...addressData, userId: session.userId } });
          }
        }

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
    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    const status = validStatuses.includes(requestedStatus as string) ? (requestedStatus as OrderStatus) : undefined;
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
