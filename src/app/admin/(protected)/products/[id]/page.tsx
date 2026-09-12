import { notFound } from "next/navigation";
import { categories as seedCategories, products as seedProducts } from "@/lib/catalog";
import { db, isDatabaseConfigured } from "@/lib/db";
import { DemoNotice, PageHeading } from "../../../_components/ui";
import { ProductEditor, type EditableProduct } from "../../../_components/product-editor";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let connected = isDatabaseConfigured;
  let categories = seedCategories.map(({ id: categoryId, name }) => ({ id: categoryId, name }));
  let brands: Array<{ id: string; name: string }> = [];
  let product: EditableProduct | undefined;
  if (connected) try {
    const [row, categoryRows, brandRows] = await Promise.all([db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, attributes: { orderBy: { sortOrder: "asc" } } } }), db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }), db.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } })]);
    categories = categoryRows; brands = brandRows;
    if (row) product = { id: row.id, name: row.name, slug: row.slug, sku: row.sku, shortDescription: row.shortDescription || "", description: row.description, price: Number(row.price), salePrice: row.salePrice == null ? null : Number(row.salePrice), priceOnRequest: row.priceOnRequest, unitsPerCarton: row.unitsPerCarton, minimumOrderCartons: row.minimumOrderCartons, stock: row.stock, lowStockThreshold: row.lowStockThreshold, categoryId: row.categoryId, brandId: row.brandId, status: row.status, allowBackorder: row.allowBackorder, featured: row.featured, bestSeller: row.bestSeller, bulkPricing: row.bulkPricing, images: row.images.map(({ url, alt }) => ({ url, alt: alt || "" })), attributes: row.attributes.map(({ name, value }) => ({ name, value })) };
  } catch { connected = false; }
  if (!connected) { const row = seedProducts.find((item) => item.id === id); if (row) product = { id: row.id, name: row.name, slug: row.slug, sku: row.sku, shortDescription: row.shortDescription, description: row.description, price: row.price, salePrice: row.salePrice ?? null, priceOnRequest: row.priceOnRequest, unitsPerCarton: row.unitsPerCarton, minimumOrderCartons: row.minimumOrderCartons, stock: row.stock, lowStockThreshold: row.lowStockThreshold, categoryId: seedCategories.find((category) => category.slug === row.categorySlug)?.id || "", brandId: null, status: "ACTIVE", allowBackorder: row.allowBackorder ?? false, featured: row.featured ?? false, bestSeller: row.bestSeller ?? false, bulkPricing: row.bulkPricing ?? false, images: row.gallery.map((url) => ({ url, alt: row.name })), attributes: row.attributes }; }
  if (!product) notFound();
  return <><PageHeading eyebrow="Catalogue" title={`Edit ${product.name}`} description="Update product content, price, stock, media, and storefront visibility." />{!connected && <DemoNotice />}<ProductEditor product={product} categories={categories} brands={brands} disabled={!connected} /></>;
}
