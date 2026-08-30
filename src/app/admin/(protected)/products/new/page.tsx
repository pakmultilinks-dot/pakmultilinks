import { categories as seedCategories } from "@/lib/catalog";
import { db, isDatabaseConfigured } from "@/lib/db";
import { DemoNotice, PageHeading } from "../../../_components/ui";
import { ProductEditor } from "../../../_components/product-editor";

export default async function NewProductPage() {
  let connected = isDatabaseConfigured;
  let categories = seedCategories.map(({ id, name }) => ({ id, name }));
  let brands: Array<{ id: string; name: string }> = [];
  if (connected) try { [categories, brands] = await Promise.all([db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }), db.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } })]); } catch { connected = false; }
  return <><PageHeading eyebrow="Catalogue" title="Add product" description="Create a product record with inventory, pricing, media, and flexible specifications." />{!connected && <DemoNotice />}<ProductEditor categories={categories} brands={brands} disabled={!connected} /></>;
}
