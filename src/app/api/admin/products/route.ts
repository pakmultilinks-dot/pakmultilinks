import { NextResponse, type NextRequest } from "next/server";
import { ProductStatus } from "@prisma/client";
import { requireDatabase } from "@/lib/db";
import { productInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, pagination, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const database = requireDatabase();
    const { page, take, skip } = pagination(request);
    const search = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100);
    const where = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { sku: { contains: search, mode: "insensitive" as const } }] }
      : {};
    const [products, total] = await database.$transaction([
      database.product.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: { category: true, brand: true, images: { orderBy: { sortOrder: "asc" } }, attributes: { orderBy: { sortOrder: "asc" } } },
      }),
      database.product.count({ where }),
    ]);
    return NextResponse.json({ products: serialize(products), pagination: { page, limit: take, total } }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = productInputSchema.safeParse(await readJson(request, 64_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const data = parsed.data;
    const product = await requireDatabase().product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        shortDescription: data.shortDescription || null,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        priceOnRequest: data.priceOnRequest,
        unitsPerCarton: data.unitsPerCarton,
        minimumOrderCartons: data.minimumOrderCartons,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        allowBackorder: data.allowBackorder,
        featured: data.featured,
        bestSeller: data.bestSeller,
        bulkPricing: data.bulkPricing,
        status: data.status as ProductStatus,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        images: { create: data.images.map((image, sortOrder) => ({ ...image, alt: image.alt || null, sortOrder })) },
        attributes: { create: data.attributes.map((attribute, sortOrder) => ({ ...attribute, sortOrder })) },
      },
      include: { category: true, brand: true, images: true, attributes: true },
    });
    return NextResponse.json({ product: serialize(product) }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
