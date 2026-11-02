import "server-only";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
import { inferBrand, inferProductTaxonomy } from "@/lib/catalog-server";

const parentNames: Record<string, string> = {
  "tissue-paper-products": "Tissue Paper Products",
  "washroom-supplies": "Washroom Supplies",
  "cleaning-products": "Cleaning Products",
  "disposable-items": "Disposable Items",
};

let syncPromise: Promise<void> | undefined;

/** Makes the admin taxonomy tables match the categories and brands customers see. */
export function syncStorefrontTaxonomy() {
  if (!isDatabaseConfigured) return Promise.resolve();
  syncPromise ??= withDatabaseRetry(async () => {
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        categoryId: true,
        brandId: true,
        category: { select: { name: true, slug: true, parent: { select: { slug: true } } } },
        brand: { select: { name: true } },
      },
    });

    const resolved = products.map((product) => ({
      product,
      taxonomy: inferProductTaxonomy(product.name, product.category),
      brandName: inferBrand(product.name, product.brand?.name),
    }));
    const categoryIds = new Map<string, string>();
    const parentSlugs = [...new Set(resolved.map(({ taxonomy }) => taxonomy.parentCategorySlug || taxonomy.categorySlug))];
    for (const parentSlug of parentSlugs) {
      const example = resolved.find(({ taxonomy }) => (taxonomy.parentCategorySlug || taxonomy.categorySlug) === parentSlug)!;
      const parent = await db.category.upsert({
        where: { slug: parentSlug },
        update: { isActive: true },
        create: { name: parentNames[parentSlug] || example.taxonomy.category, slug: parentSlug, isActive: true },
      });
      categoryIds.set(parentSlug, parent.id);
    }
    for (const { taxonomy } of resolved) {
      if (categoryIds.has(taxonomy.categorySlug)) continue;
      const parentId = categoryIds.get(taxonomy.parentCategorySlug || taxonomy.categorySlug)!;
      const category = await db.category.upsert({
        where: { slug: taxonomy.categorySlug },
        update: { name: taxonomy.category, parentId, isActive: true },
        create: { name: taxonomy.category, slug: taxonomy.categorySlug, parentId, isActive: true },
      });
      categoryIds.set(taxonomy.categorySlug, category.id);
    }
    const brandIds = new Map<string, string>();
    for (const brandName of [...new Set(resolved.map((item) => item.brandName))]) {
      const brandSlug = brandName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const brand = await db.brand.upsert({
        where: { slug: brandSlug },
        update: { name: brandName, isActive: true },
        create: { name: brandName, slug: brandSlug, isActive: true },
      });
      brandIds.set(brandName, brand.id);
    }
    for (const { product, taxonomy, brandName } of resolved) {
      const categoryId = categoryIds.get(taxonomy.categorySlug)!;
      const brandId = brandIds.get(brandName)!;
      if (product.categoryId !== categoryId || product.brandId !== brandId) {
        await db.product.update({ where: { id: product.id }, data: { categoryId, brandId } });
      }
    }
  }).catch((error) => { syncPromise = undefined; throw error; });
  return syncPromise;
}
