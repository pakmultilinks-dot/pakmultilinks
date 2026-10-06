import type { Category, Product } from "@/lib/types";

// Existing illustrations are collection artwork, never substitute product photos.
export function categoryArtwork(category: Category, products: Product[]) {
  const photo = products.find(product => product.image &&
    (product.categorySlug === category.slug || product.parentCategorySlug === category.slug));
  if (photo) return photo.image;
  const name = `${category.slug} ${category.name}`.toLowerCase();
  const illustrations: [RegExp, string][] = [
    [/bag|garbage|waste/, "garbage-bags"], [/mop|tool|brush/, "mop"],
    [/dispenser/, "dispenser"], [/tissue|paper|napkin|roll/, "tissue"],
    [/clean|floor|surface/, "floor-cleaner"], [/disposable|glove/, "gloves"],
    [/sanitiz/, "sanitizer"], [/wash|personal|soap/, "hand-wash"],
  ];
  return `/images/products/${illustrations.find(([pattern]) => pattern.test(name))?.[1] ?? "refill"}.svg`;
}

export function mobileCategories(categories: Category[]) {
  // Promote useful subcollections without inventing categories absent from the catalog.
  return categories.filter(category => !category.parentId || /garbage|mop|tool/.test(category.slug));
}
