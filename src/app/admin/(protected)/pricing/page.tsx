import { db, isDatabaseConfigured } from "@/lib/db";
import { products } from "@/lib/catalog";
import { PricingEditor, type PricingRow } from "../../_components/pricing-editor";
import { DemoNotice, PageHeading } from "../../_components/ui";

export default async function PricingPage() {
  let connected = isDatabaseConfigured;
  let rows: PricingRow[] = products.map(row => ({ ...row, category: row.category, salePrice: row.salePrice ?? null, updatedAt: new Date(0).toISOString() }));
  if (connected) try {
    const records = await db.product.findMany({ where: { status: { not: "ARCHIVED" } }, orderBy: { name: "asc" }, select: { id: true, name: true, sku: true, price: true, salePrice: true, priceOnRequest: true, stock: true, unitsPerCarton: true, minimumOrderCartons: true, updatedAt: true, category: { select: { name: true } } } });
    rows = records.map(row => ({ ...row, category: row.category.name, price: Number(row.price), salePrice: row.salePrice === null ? null : Number(row.salePrice), updatedAt: row.updatedAt.toISOString() }));
  } catch { connected = false; }
  return <><PageHeading title="Pricing & inventory" description="Set carton prices, run a sale and keep stock up to date. Edit several products and save them together." />{!connected && <DemoNotice />}<PricingEditor initialRows={rows} disabled={!connected} /></>;
}
