import type { Category, Product } from "./types";
import { getEffectivePrice, isProductAvailable } from "./pricing";

export function normalizeCatalogValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function matchesBrand(product: Product, brand: string) {
  return (
    !brand ||
    normalizeCatalogValue(product.brand) === normalizeCatalogValue(brand)
  );
}

export function matchesCategory(
  product: Product,
  slug: string,
  categories: Category[],
) {
  if (!slug) return true;
  const selected = normalizeCatalogValue(slug);
  if (
    [
      product.categorySlug,
      product.parentCategorySlug ?? "",
      product.category,
    ].some((value) => normalizeCatalogValue(value) === selected)
  )
    return true;
  let current = categories.find(
    (item) =>
      normalizeCatalogValue(item.slug) ===
        normalizeCatalogValue(product.categorySlug) ||
      item.name.toLowerCase() === product.category.toLowerCase(),
  );
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    if (normalizeCatalogValue(current.slug) === selected) return true;
    visited.add(current.id);
    current = categories.find((item) => item.id === current?.parentId);
  }
  return false;
}

export function isCatalogProductAvailable(product: Product) {
  const variants = product.variants?.filter((variant) => variant.isActive);
  return variants?.length
    ? variants.some((variant) =>
        isProductAvailable({
          ...variant,
          allowBackorder: product.allowBackorder,
        }),
      )
    : isProductAvailable(product);
}

export function catalogProductPrices(product: Product) {
  const variants = product.variants?.filter((variant) => variant.isActive);
  return variants?.length
    ? variants.map((variant) =>
        getEffectivePrice(variant.price, variant.salePrice),
      )
    : [getEffectivePrice(product.price, product.salePrice)];
}
