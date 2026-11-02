import { products } from "@/lib/catalog";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
import { EntityManager } from "../../_components/entity-manager";
import { DemoNotice, PageHeading } from "../../_components/ui";
import { syncStorefrontTaxonomy } from "@/lib/admin-catalog-sync";

export default async function BrandsPage() {
  let connected = isDatabaseConfigured;
  let rows = [{ id: "brand-demo", name: "Demo / Unbranded", slug: "demo-unbranded", logoUrl: "", isActive: true, productCount: products.length }];
  if (connected) {
    try {
      await syncStorefrontTaxonomy();
      const records = await withDatabaseRetry(() =>
        db.brand.findMany({
          orderBy: { name: "asc" },
          include: { _count: { select: { products: true } } },
        })
      );
      rows = records.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        logoUrl: item.logoUrl || "",
        isActive: item.isActive,
        productCount: item._count.products,
      }));
    } catch (error) {
      console.error("Failed to load brands from database:", error);
      connected = false;
    }
  }
  return <><PageHeading eyebrow="Catalogue" title="Brands" description="Maintain verified brand labels and logos without implying unconfirmed partnerships." />{!connected && <DemoNotice />}<EntityManager kind="brands" rows={rows} disabled={!connected} /></>;
}

