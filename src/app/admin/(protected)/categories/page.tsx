import { categories as seedCategories, products } from "@/lib/catalog";
import { db, isDatabaseConfigured } from "@/lib/db";
import { EntityManager } from "../../_components/entity-manager";
import { DemoNotice, PageHeading } from "../../_components/ui";

export default async function CategoriesPage() {
  let connected = isDatabaseConfigured;
  let rows = seedCategories.map((item) => ({ id: item.id, parentId: item.parentId ?? null, name: item.name, slug: item.slug, description: item.description, imageUrl: "", icon: item.icon, sortOrder: 0, isActive: true, productCount: products.filter((product) => product.categorySlug === item.slug).length }));
  if (connected) try { const records = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } }); rows = records.map((item) => ({ id: item.id, parentId: item.parentId ?? null, name: item.name, slug: item.slug, description: item.description || "", imageUrl: item.imageUrl || "", icon: item.icon || "", sortOrder: item.sortOrder, isActive: item.isActive, productCount: item._count.products })); } catch { connected = false; }
  return <><PageHeading eyebrow="Catalogue" title="Categories & subcategories" description="Group products into collections. Add subcategories under a main category to build your storefront menu." />{!connected && <DemoNotice />}<EntityManager kind="categories" rows={rows} disabled={!connected} /></>;
}
