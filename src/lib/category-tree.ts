import type { Prisma } from "@prisma/client";

// Keep the catalogue to two levels, matching the storefront collection menu.
export async function categoryParentError(database: Prisma.TransactionClient, parentId: string | null | undefined, id?: string) {
  if (!parentId) return null;
  if (parentId === id) return "A category cannot be its own parent.";
  const parent = await database.category.findUnique({ where: { id: parentId }, select: { parentId: true, isActive: true } });
  if (!parent || !parent.isActive) return "Choose an active parent category.";
  if (parent.parentId) return "Select a main category. Subcategories cannot contain another level.";
  if (id && await database.category.count({ where: { parentId: id } })) return "Move this category’s subcategories first before making it a subcategory.";
  return null;
}
