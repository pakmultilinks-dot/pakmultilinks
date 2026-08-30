import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { QuoteStatus } from "@prisma/client";
import { checkRateLimit, requestFingerprint } from "@/lib/auth";
import { requireDatabase } from "@/lib/db";
import { quoteCreateSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, pagination, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

function newQuoteNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `RFQ-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`quote:${requestFingerprint(request)}`, 8, 30 * 60_000);
  if (!rate.allowed) return jsonError("Too many quotation requests. Please try again later.", 429, { retryAfter: rate.retryAfter });
  try {
    const parsed = quoteCreateSchema.safeParse(await readJson(request, 40_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const data = parsed.data;
    const quote = await requireDatabase().quoteRequest.create({
      data: {
        quoteNumber: newQuoteNumber(),
        customerName: data.customerName,
        companyName: data.companyName,
        phone: data.phone,
        email: data.email,
        city: data.city,
        notes: data.notes || null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            productName: item.product,
            quantity: item.quantity,
            details: item.details || null,
          })),
        },
      },
      select: { id: true, quoteNumber: true, status: true, createdAt: true },
    });
    return NextResponse.json({ quote: serialize(quote) }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const database = requireDatabase();
    const { page, take, skip } = pagination(request);
    const requestedStatus = request.nextUrl.searchParams.get("status");
    const status = Object.values(QuoteStatus).includes(requestedStatus as QuoteStatus) ? (requestedStatus as QuoteStatus) : undefined;
    const where = status ? { status } : {};
    const [quotes, total] = await database.$transaction([
      database.quoteRequest.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { items: true } }),
      database.quoteRequest.count({ where }),
    ]);
    return NextResponse.json({ quotes: serialize(quotes), pagination: { page, limit: take, total } }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
