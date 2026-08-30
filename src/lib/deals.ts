import { db, isDatabaseConfigured } from "@/lib/db";

export type PublicDealBanner = {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
  linkUrl: string;
};

export const defaultDealBanners: PublicDealBanner[] = [
  {
    id: "deal-warehouse-quality",
    title: "Quality hygiene supply",
    imageUrl: "/images/deals/warehouse-quality.png",
    alt: "Pak Multilinks bulk hygiene products and warehouse supply",
    linkUrl: "/shop",
  },
  {
    id: "deal-special-offer",
    title: "Special hygiene offer",
    imageUrl: "/images/deals/special-offer.png",
    alt: "Pak Multilinks special offer on selected hygiene products",
    linkUrl: "/shop",
  },
];

export async function listPublicDeals(): Promise<PublicDealBanner[]> {
  if (!isDatabaseConfigured) return defaultDealBanners;

  try {
    const rows = await db.dealBanner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows
      .filter((row) => row.isActive)
      .map((row) => ({
        id: row.id,
        title: row.title,
        imageUrl: row.imageUrl,
        alt: row.alt || row.title,
        linkUrl: row.linkUrl || "/shop",
      }));
  } catch {
    return defaultDealBanners;
  }
}
