import { DealsManager, type EditableDeal } from "../../_components/deals-manager";
import { DemoNotice, PageHeading } from "../../_components/ui";
import { db, isDatabaseConfigured } from "@/lib/db";
import { defaultDealBanners } from "@/lib/deals";

export default async function DealsPage() {
  let connected = isDatabaseConfigured;
  let rows: EditableDeal[] = defaultDealBanners.map((deal, sortOrder) => ({ ...deal, sortOrder, isActive: true }));

  if (connected) {
    try {
      const deals = await db.dealBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
      rows = deals.map((deal) => ({ id: deal.id, title: deal.title, imageUrl: deal.imageUrl, alt: deal.alt || "", linkUrl: deal.linkUrl || "/shop", sortOrder: deal.sortOrder, isActive: deal.isActive }));
    } catch {
      connected = false;
    }
  }

  return <><PageHeading eyebrow="Storefront promotion" title="Deals slider" description="Upload, order, activate, and link promotional banners shown on the homepage. Active banners rotate automatically every five seconds." />{!connected && <DemoNotice />}<DealsManager initialDeals={rows} disabled={!connected} /></>;
}
