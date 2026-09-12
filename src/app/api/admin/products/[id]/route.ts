import { NextResponse, type NextRequest } from "next/server";
import { ProductStatus } from "@prisma/client";
import { requireDatabase } from "@/lib/db";
import { productInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";
import { deleteBlobs } from "@/lib/blob";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = productInputSchema.safeParse(await readJson(request, 64_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const { id } = await context.params;
    const data = parsed.data;
    const database = requireDatabase();
    const existing = await database.product.findUnique({
      where: { id },
      select: { id: true, images: { select: { url: true } } },
    });
    if (!existing) return jsonError("Product not found.", 404);
    const [categoryExists, brandOk] = await Promise.all([
      database.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }),
      data.brandId ? database.brand.findUnique({ where: { id: data.brandId }, select: { id: true } }) : Promise.resolve({ id: true }),
    ]);
    if (!categoryExists) return jsonError("The selected category does not exist. Please refresh and choose a valid category.", 400);
    if (data.brandId && !brandOk) return jsonError("The selected brand does not exist. Please refresh and choose a valid brand.", 400);
    const oldImageUrls = existing.images.map((img) => img.url);
    const newImageUrls = data.images.map((img) => img.url);
    const product = await database.product.update({
      where: { id },
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
        images: { deleteMany: {}, create: data.images.map((image, sortOrder) => ({ ...image, alt: image.alt || null, sortOrder })) },
        attributes: { deleteMany: {}, create: data.attributes.map((attribute, sortOrder) => ({ ...attribute, sortOrder })) },
      },
      include: { category: true, brand: true, images: true, attributes: true },
    });
    // Best-effort cleanup of orphaned Vercel Blob images
    const removedUrls = oldImageUrls.filter((url) => !newImageUrls.includes(url));
    await deleteBlobs(removedUrls);
    return NextResponse.json({ product: serialize(product) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const { id } = await context.params;
    const database = requireDatabase();
    const existing = await database.product.findUnique({
      where: { id },
      select: { id: true, images: { select: { url: true } } },
    });
    if (!existing) return jsonError("Product not found.", 404);
    await database.product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED } });
    // Clean up Vercel Blob images on archive
    await deleteBlobs(existing.images.map((img) => img.url));
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
