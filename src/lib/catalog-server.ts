import "server-only";

import type { Prisma } from "@prisma/client";

import {
  categories as developmentCategories,
  getCategory as getDevelopmentCategory,
  getProduct as getDevelopmentProduct,
  products as developmentProducts,
} from "@/lib/catalog";
import { db, isDatabaseConfigured } from "@/lib/db";
import type { Category, Product } from "@/lib/types";

const publicProductSelect = {
  id: true,
  slug: true,
  name: true,
  sku: true,
  shortDescription: true,
  description: true,
  price: true,
  salePrice: true,
  priceOnRequest: true,
  unitsPerCarton: true,
  minimumOrderCartons: true,
  stock: true,
  lowStockThreshold: true,
  allowBackorder: true,
  featured: true,
  bestSeller: true,
  bulkPricing: true,
  updatedAt: true,
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true } },
  images: { orderBy: { sortOrder: "asc" as const }, select: { url: true, alt: true } },
  attributes: {
    orderBy: { sortOrder: "asc" as const },
    select: { name: true, value: true },
  },
} satisfies Prisma.ProductSelect;

type PublicProductRow = Prisma.ProductGetPayload<{
  select: typeof publicProductSelect;
}>;

function mapProduct(row: PublicProductRow): Product {
  const images = row.images.map((image) => image.url).filter(Boolean);
  const image = images[0] || "";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    shortDescription: row.shortDescription || "Product details available on request.",
    description: row.description,
    price: Number(row.price),
    salePrice: row.salePrice == null ? undefined : Number(row.salePrice),
    priceOnRequest: row.priceOnRequest,
    unitsPerCarton: row.unitsPerCarton,
    minimumOrderCartons: row.minimumOrderCartons,
    stock: row.stock,
    lowStockThreshold: row.lowStockThreshold,
    allowBackorder: row.allowBackorder,
    featured: row.featured,
    bestSeller: row.bestSeller,
    bulkPricing: row.bulkPricing,
    category: row.category.name,
    categorySlug: row.category.slug,
    brand: row.brand?.name || "Unbranded",
    image,
    imageAlt: row.images.find((item) => item.url === image)?.alt || row.name,
    gallery: images,
    updatedAt: row.updatedAt.toISOString(),
    attributes: row.attributes,
  };
}

function canUseDevelopmentFallback() {
  return !isDatabaseConfigured || process.env.NODE_ENV !== "production";
}

export async function listPublicProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured) return developmentProducts;
  try {
    const rows = await db.product.findMany({
      where: { status: "ACTIVE", category: { isActive: true } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: publicProductSelect,
    });
    return rows.map(mapProduct);
  } catch (error) {
    if (!canUseDevelopmentFallback()) throw error;
    console.warn("Using the development catalog because PostgreSQL is unavailable.");
    return developmentProducts;
  }
}

export async function getPublicProduct(slug: string): Promise<Product | undefined> {
  if (!isDatabaseConfigured) return getDevelopmentProduct(slug);
  try {
    const row = await db.product.findFirst({
      where: { slug, status: "ACTIVE", category: { isActive: true } },
      select: publicProductSelect,
    });
    return row ? mapProduct(row) : undefined;
  } catch (error) {
    if (!canUseDevelopmentFallback()) throw error;
    return getDevelopmentProduct(slug);
  }
}

export async function listPublicCategories(): Promise<Category[]> {
  if (!isDatabaseConfigured) return developmentCategories;
  try {
    const rows = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        updatedAt: true,
      },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || "Professional hygiene and workplace supplies.",
      icon: row.icon || "PackageCheck",
      tone: "mint",
      updatedAt: row.updatedAt.toISOString(),
    }));
  } catch (error) {
    if (!canUseDevelopmentFallback()) throw error;
    return developmentCategories;
  }
}

export async function getPublicCategory(slug: string): Promise<Category | undefined> {
  if (!isDatabaseConfigured) return getDevelopmentCategory(slug);
  const categories = await listPublicCategories();
  return categories.find((category) => category.slug === slug);
}

export function isDevelopmentProduct(product: Product) {
  return product.sku.startsWith("DEMO-");
}
