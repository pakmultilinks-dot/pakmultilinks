
import "server-only";
import type { Prisma } from "@prisma/client";

import {
  categories as developmentCategories,
  getCategory as getDevelopmentCategory,
  getProduct as getDevelopmentProduct,
  products as developmentProducts,
} from "@/lib/catalog";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
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
  category: { select: { name: true, slug: true, parent: { select: { slug: true } } } },
  brand: { select: { name: true } },
  images: { orderBy: { sortOrder: "asc" as const }, select: { url: true, alt: true } },
  attributes: {
    orderBy: { sortOrder: "asc" as const },
    select: { name: true, value: true },
  },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      productId: true,
      label: true,
      sku: true,
      price: true,
      salePrice: true,
      unitsPerCarton: true,
      minimumOrderCartons: true,
      stock: true,
      imageUrl: true,
      sortOrder: true,
      isActive: true,
    },
  },
} satisfies Prisma.ProductSelect;

type PublicProductRow = Prisma.ProductGetPayload<{
  select: typeof publicProductSelect;
}>;

export function inferProductTaxonomy(name: string, currentCategory: { name: string; slug: string; parent?: { slug: string } | null }) {
  if (currentCategory.slug && currentCategory.slug !== "general" && currentCategory.slug !== "uncategorized") {
    return {
      category: currentCategory.name,
      categorySlug: currentCategory.slug,
      parentCategorySlug: currentCategory.parent?.slug || currentCategory.slug,
    };
  }

  const lower = name.toLowerCase();

  // Tissue & Paper subcategories
  if (lower.includes("pop up") || lower.includes("popup") || lower.includes("essential") || lower.includes("perfumed") || lower.includes("facial") || lower.includes("ciblure") || lower.includes("luxury")) {
    return { category: "Facial Tissues", categorySlug: "facial-tissues", parentCategorySlug: "tissue-paper-products" };
  }
  if (lower.includes("pocket pack") || lower.includes("party pack") || lower.includes("soft") || lower.includes("flu pack") || lower.includes("party white")) {
    return { category: "Soft Pack Tissues", categorySlug: "soft-pack-tissues", parentCategorySlug: "tissue-paper-products" };
  }
  if (lower.includes("roll") || lower.includes("maxob") || lower.includes("toilet") || lower.includes("mambo") || lower.includes("jumbo roll")) {
    return { category: "Tissue Rolls", categorySlug: "tissue-rolls", parentCategorySlug: "tissue-paper-products" };
  }
  if (lower.includes("napkin") || lower.includes("towel") || lower.includes("zzoop")) {
    return { category: "Paper Napkins", categorySlug: "paper-napkins", parentCategorySlug: "tissue-paper-products" };
  }

  // Washroom & Personal care
  if (lower.includes("hand wash") || lower.includes("handwash") || lower.includes("soap") || lower.includes("dispenser") || lower.includes("tiki") || lower.includes("freshener") || lower.includes("antiseptic")) {
    return { category: "Hand Wash & Hygiene", categorySlug: "hand-wash", parentCategorySlug: "washroom-supplies" };
  }

  // Cleaning Products
  if (lower.includes("cleaner") || lower.includes("harpic") || lower.includes("phenyl") || lower.includes("glint") || lower.includes("vim") || lower.includes("detergent") || lower.includes("bonus") || lower.includes("mop") || lower.includes("wiper") || lower.includes("broom") || lower.includes("brush") || lower.includes("sponge") || lower.includes("cloth") || lower.includes("sweep")) {
    return { category: "Floor & Surface Care", categorySlug: "floor-surface-care", parentCategorySlug: "cleaning-products" };
  }

  // Disposable Items
  if (lower.includes("plate") || lower.includes("cup") || lower.includes("cutlery") || lower.includes("garbage") || lower.includes("glove") || lower.includes("foil") || lower.includes("cling") || lower.includes("container") || lower.includes("wipe")) {
    return { category: "Disposable Items", categorySlug: "disposable-items", parentCategorySlug: "disposable-items" };
  }

  return {
    category: currentCategory.name || "Facial Tissues",
    categorySlug: currentCategory.slug || "facial-tissues",
    parentCategorySlug: currentCategory.parent?.slug || "tissue-paper-products",
  };
}

export function inferBrand(name: string, currentBrandName?: string | null): string {
  if (currentBrandName && currentBrandName !== "Pak Multilinks" && currentBrandName !== "Unbranded") {
    return currentBrandName;
  }
  const lower = name.toLowerCase();
  if (lower.includes("rose petal") || lower.includes("hi-jeen") || lower.includes("zzoop") || lower.includes("maxob")) {
    return "Rose Petal";
  }
  if (lower.includes("nozomi")) {
    return "Nozomi";
  }
  if (lower.includes("fresco")) {
    return "Fresco";
  }
  if (lower.includes("germi cure") || lower.includes("germicure")) {
    return "Germi Cure";
  }
  if (lower.includes("shine well") || lower.includes("shinewell")) {
    return "Shine Well";
  }
  if (lower.includes("airnergy") || lower.includes("air energy")) {
    return "Airnergy";
  }
  if (lower.includes("super soft") || lower.includes("supersoft")) {
    return "Super Soft";
  }
  if (lower.includes("softex")) {
    return "Softex";
  }
  if (lower.includes("sicura")) {
    return "Sicura";
  }
  if (lower.includes("glad")) {
    return "Glad";
  }
  if (lower.includes("harpic")) return "Harpic";
  if (lower.includes("dettol")) return "Dettol";
  if (lower.includes("vim")) return "Vim";
  if (lower.includes("bonus")) return "Bonus";
  if (lower.includes("glint")) return "Glint";
  if (lower.includes("colin")) return "Colin";
  if (lower.includes("finis")) return "Finis";
  if (lower.includes("shield")) return "Shield";
  if (lower.includes("robin")) return "Robin";
  if (lower.includes("ariel")) return "Ariel";
  if (lower.includes("surf excel")) return "Surf Excel";
  if (lower.includes("safeguard")) return "Safeguard";
  if (lower.includes("lifebuoy")) return "Lifebuoy";
  return currentBrandName || "Pak Multilinks";
}

function mapProduct(row: PublicProductRow): Product {
  const images = row.images.map((image) => image.url).filter(Boolean);
  const image = images[0] || "";
  const taxonomy = inferProductTaxonomy(row.name, row.category);

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
    category: taxonomy.category,
    categorySlug: taxonomy.categorySlug,
    parentCategorySlug: taxonomy.parentCategorySlug,
    brand: inferBrand(row.name, row.brand?.name),
    image,
    imageAlt: row.images.find((item) => item.url === image)?.alt || row.name,
    gallery: images,
    updatedAt: row.updatedAt.toISOString(),
    attributes: row.attributes,
    variants: row.variants?.map((v) => ({
      id: v.id,
      productId: v.productId,
      label: v.label,
      sku: v.sku,
      price: Number(v.price),
      salePrice: v.salePrice == null ? undefined : Number(v.salePrice),
      unitsPerCarton: v.unitsPerCarton,
      minimumOrderCartons: v.minimumOrderCartons,
      stock: v.stock,
      imageUrl: v.imageUrl || undefined,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
    })) || [],
  };
}

function canUseDevelopmentFallback() {
  return true;
}

export async function listPublicProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured) return developmentProducts;
  try {
    const rows = await withDatabaseRetry(() =>
      db.product.findMany({
        where: {
          status: "ACTIVE",
          category: { isActive: true, OR: [{ parentId: null }, { parent: { isActive: true } }] },
          NOT: [{ brand: { slug: "fine-life" } }, { name: { contains: "fine life", mode: "insensitive" } }],
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        select: publicProductSelect,
      })
    );
    return rows.map(mapProduct);
  } catch (error) {
    console.error("Failed to fetch public products from database:", error);
    if (!canUseDevelopmentFallback()) throw error;
    console.warn("Using the development catalog because PostgreSQL is unavailable.");
    return developmentProducts;
  }
}

export async function getPublicProduct(slug: string): Promise<Product | undefined> {
  if (!isDatabaseConfigured) return getDevelopmentProduct(slug);
  try {
    const row = await withDatabaseRetry(() =>
      db.product.findFirst({
        where: {
          slug,
          status: "ACTIVE",
          category: { isActive: true, OR: [{ parentId: null }, { parent: { isActive: true } }] },
          NOT: [{ brand: { slug: "fine-life" } }, { name: { contains: "fine life", mode: "insensitive" } }],
        },
        select: publicProductSelect,
      })
    );
    return row ? mapProduct(row) : undefined;
  } catch (error) {
    console.error(`Failed to fetch public product ${slug} from database:`, error);
    if (!canUseDevelopmentFallback()) throw error;
    return getDevelopmentProduct(slug);
  }
}

export async function listPublicCategories(): Promise<Category[]> {
  if (!isDatabaseConfigured) return developmentCategories;
  try {
    const rows = await withDatabaseRetry(() =>
      db.category.findMany({
        where: { isActive: true, OR: [{ parentId: null }, { parent: { isActive: true } }] },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          parentId: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          updatedAt: true,
        },
      })
    );


    // If database only has a single generic category without subcategories, provide the rich curated taxonomy
    const hasSubcategories = rows.some((row) => row.parentId !== null);
    if (rows.length <= 1 || !hasSubcategories) {
      return developmentCategories;
    }

    return rows.map((row) => ({
      id: row.id,
      parentId: row.parentId,
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
