
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

// Tissue Craft products the owner asked to add. They are created in the DB
// the first time the shop loads, so they show without an admin step.
// Price is left on request; the owner sets prices from the admin panel.
const TISSUE_CRAFT_PRODUCTS = [
  { slug: "eco-fresh-toilet-paper-2-rolls", name: "Eco Fresh Toilet Paper (2 Rolls)", shortDescription: "2-roll toilet paper pack", description: "Eco Fresh toilet paper, 2-roll pack. Price on request.", categorySlug: "tissue-rolls", imageUrl: "/images/products/eco-fresh-toilet-paper-2-rolls.jpg" },
  { slug: "eco-fresh-multi-purpose-towel", name: "Eco Fresh Multi Purpose Towel", shortDescription: "Multi purpose towel roll", description: "Eco Fresh multi purpose towel roll. Price on request.", categorySlug: "tissue-rolls", imageUrl: "/images/products/eco-fresh-multi-purpose-towel.jpg" },
  { slug: "for-you-facial-tissues-400", name: "For You Facial Tissues (400 Sheets)", shortDescription: "Facial tissues, 400 sheets", description: "For You facial tissues, 400 sheets. Price on request.", categorySlug: "facial-tissues", imageUrl: "/images/products/for-you-facial-tissues-400.jpg" },
  { slug: "for-you-pop-up-300", name: "For You Pop Up Ultra Strong (300 Sheets)", shortDescription: "Pop up tissues, ultra strong, 300 sheets", description: "For You pop up tissues, ultra strong, 300 sheets. Price on request.", categorySlug: "facial-tissues", imageUrl: "/images/products/for-you-pop-up-300.jpg" },
];

let tissueCraftPromise: Promise<void> | undefined;

export function ensureTissueCraftProducts() {
  if (!isDatabaseConfigured) return Promise.resolve();
  tissueCraftPromise ??= (async () => {
    const brand = await db.brand.upsert({
      where: { slug: "tissue-craft" },
      update: {},
      create: { name: "Tissue Craft", slug: "tissue-craft", logoUrl: "/images/brands/tissue-craft.jpg", isActive: true },
    });
    for (const item of TISSUE_CRAFT_PRODUCTS) {
      const category = await db.category.findUnique({ where: { slug: item.categorySlug }, select: { id: true } });
      if (!category) continue;
      const product = await db.product.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          name: item.name,
          slug: item.slug,
          sku: item.slug,
          shortDescription: item.shortDescription,
          description: item.description,
          price: 0,
          priceOnRequest: true,
          minimumOrderCartons: 1,
          status: "ACTIVE",
          categoryId: category.id,
          brandId: brand.id,
        },
      });
      const existingImage = await db.productImage.findFirst({ where: { productId: product.id }, select: { id: true } });
      if (!existingImage) {
        await db.productImage.create({ data: { productId: product.id, url: item.imageUrl, alt: item.name, sortOrder: 0 } });
      }
    }
  })().catch((error) => { tissueCraftPromise = undefined; throw error; });
  return tissueCraftPromise;
}

// Nozomi original manufacturer photos. The main image of each mapped
// product is replaced with its photo from the zip. #2 and #14 are skipped
// (no file in the zip). Matches by product name, case-insensitive.
const NOZOMI_PHOTO_UPDATES: { name: string; imageUrl: string }[] = [
  { name: "SHINE WELL Car Polish Aerosol", imageUrl: "/images/products/nozomi/01-shine-well-car-polish-aerosol-400ml-desire.jpg" },
  { name: "Super Soft Tissue Box", imageUrl: "/images/products/nozomi/03-super-soft-tissue-box-supreme-200-tissues.jpg" },
  { name: "GLAD Tissue Box", imageUrl: "/images/products/nozomi/04-glad-tissue-box-popup-300-tissues-recycled.jpg" },
  { name: "Super Soft Soft Pack", imageUrl: "/images/products/nozomi/05-super-soft-soft-pack-mini-300-tissues.jpg" },
  { name: "FRESCO Air Freshener Aerosol", imageUrl: "/images/products/nozomi/06-fresco-air-freshener-aerosol-250ml-premium.jpg" },
  { name: "FRESCO Antibacterial Hand Wash Liquid", imageUrl: "/images/products/nozomi/07-fresco-antibacterial-hand-wash-liquid-500ml.jpg" },
  { name: "GERMI CURE Hand Wash Liquid", imageUrl: "/images/products/nozomi/08-germi-cure-hand-wash-liquid-500ml.jpg" },
  { name: "FRESCO Antibacterial Dish Wash Liquid", imageUrl: "/images/products/nozomi/09-fresco-antibacterial-dish-wash-liquid-500ml-lemon.jpg" },
  { name: "FRESCO Hand Sanitizer Gel", imageUrl: "/images/products/nozomi/10-fresco-hand-sanitizer-gel-500ml.jpg" },
  { name: "INSECTO GUARD Manual Insect Killer Spray", imageUrl: "/images/products/nozomi/11-insecto-guard-manual-insect-killer-spray-300ml.jpg" },
  { name: "Softex Hygiene Tissue Hand Towel 18gsm x 2 ply", imageUrl: "/images/products/nozomi/12-softex-hygiene-hand-towel-150-tissues-36gsm.jpg" },
  { name: "Softex Hygiene Tissue Hand Towel 24gsm x 2 ply = 48gsm 125 x 2 ply = 250 Tissues Tissue Size 215 x 220mm Pure Imported Paper 20/pkt per Carton", imageUrl: "/images/products/nozomi/13-softex-hygiene-hand-towel-250-tissues-48gsm.jpg" },
  { name: "SOFTEX Tissue Box Pop-UP Tissue Size 15x20cm 150x2 Ply =300 Tissues Pure Imported Paper 13.7gsm 36/Box per Carton", imageUrl: "/images/products/nozomi/15-softex-tissue-box-pop-up-300-tissues.jpg" },
  { name: "SOFTEX Tissue Box Multicolor Tissue Size 20x20cm 150x2 Ply = 300 Tissue Pure Imported Paper 13.7gsm 36/Box per carton", imageUrl: "/images/products/nozomi/16-softex-tissue-box-multicolor-300-tissues.jpg" },
  { name: "FRESCO Auto JET Hand Dryer Model K2201 Heat & Cool Option Water Resist Body", imageUrl: "/images/products/nozomi/17-fresco-auto-jet-hand-dryer-k2201.jpg" },
  { name: "FRESCO Auto Heavy Duty Hand Dryer Model V-182 Heat & Cool Option Water Resist Body", imageUrl: "/images/products/nozomi/18-fresco-auto-heavy-duty-hand-dryer-v-182.jpg" },
  { name: "SIEMENSE Auto Hand Dryer Model TH92001 Metal Body", imageUrl: "/images/products/nozomi/19-siemense-auto-hand-dryer-th92001.jpg" },
  { name: "Auto Hand Dryer Made in China", imageUrl: "/images/products/nozomi/20-auto-hand-dryer-made-in-china.jpg" },
  { name: "FRESCO Auto Sanitizer/Soap Dispenser Model PL-151045 Capacity: 600ml 30/Dispenser per Carton", imageUrl: "/images/products/nozomi/21-fresco-auto-sanitizer-soap-dispenser-pl-151045.jpg" },
  { name: "FRESCO Auto Sanitizer/Soap Dispenser Model V-410 Capacity: 600ml 16/Dispenser per Carton", imageUrl: "/images/products/nozomi/22-fresco-auto-sanitizer-soap-dispenser-v-410.jpg" },
  { name: "FRESCO Manual Sanitizer/Soap Dispenser Model AR-800 Capacity: 800ml 30/Dispenser per Carton", imageUrl: "/images/products/nozomi/23-fresco-manual-sanitizer-soap-dispenser-ar-800.jpg" },
  { name: "Germi Cure Hand Sanitizer Dispenser Model V-730 for 1000ml Pouch use 32/Dispenser per Carton", imageUrl: "/images/products/nozomi/24-germi-cure-hand-sanitizer-dispenser-v-730.jpg" },
];

let nozomiPhotoPromise: Promise<void> | undefined;

export function ensureNozomiProductPhotos() {
  if (!isDatabaseConfigured) return Promise.resolve();
  nozomiPhotoPromise ??= (async () => {
    for (const item of NOZOMI_PHOTO_UPDATES) {
      const product = await db.product.findFirst({
        where: { name: { startsWith: item.name, mode: "insensitive" } },
        select: { id: true },
      });
      if (!product) continue;
      const existing = await db.productImage.findFirst({ where: { productId: product.id }, orderBy: { sortOrder: "asc" }, select: { id: true, url: true } });
      if (!existing) {
        await db.productImage.create({ data: { productId: product.id, url: item.imageUrl, alt: item.name, sortOrder: 0 } });
      } else if (existing.url !== item.imageUrl) {
        await db.productImage.update({ where: { id: existing.id }, data: { url: item.imageUrl, alt: item.name } });
      }
      // Variant images override the product image on the product page, so
      // point them at the new photo too.
      await db.productVariant.updateMany({
        where: { productId: product.id, imageUrl: { not: item.imageUrl } },
        data: { imageUrl: item.imageUrl },
      });
    }
  })().catch((error) => { nozomiPhotoPromise = undefined; throw error; });
  return nozomiPhotoPromise;
}

export async function listPublicProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured) return developmentProducts;
  try {
    await ensureTissueCraftProducts();
    await ensureNozomiProductPhotos();
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
    await ensureTissueCraftProducts();
    await ensureNozomiProductPhotos();
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
