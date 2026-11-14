import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";

export type PublicDealBanner = {
  id: string;
  title: string;
  imageUrl: string;
  mobileImageUrl?: string;
  alt: string;
  linkUrl: string;
};

const MOBILE_IMAGE_MAP: Record<string, string> = {
  "/images/deals/hero-tissue-paper-range.jpg": "/images/deals/hero-tissue-paper-range-mobile.jpg",
  "/images/deals/hero-cleaning-solutions.jpg": "/images/deals/hero-cleaning-solutions-mobile.jpg",
  "/images/deals/hero-freshness-hygiene.jpg": "/images/deals/hero-freshness-hygiene-mobile.jpg",
  "/images/deals/warehouse-quality.png": "/images/deals/warehouse-quality-mobile.jpg",
  "/images/deals/special-offer.png": "/images/deals/special-offer-mobile.jpg",
};

export const defaultDealBanners: PublicDealBanner[] = [
  {
    id: "deal-tissue-paper-range",
    title: "Premium Tissue & Paper Range",
    imageUrl: "/images/deals/hero-tissue-paper-range.jpg",
    mobileImageUrl: "/images/deals/hero-tissue-paper-range-mobile.jpg",
    alt: "Pak Multilinks Premium Tissue & Paper Range - Facial Tissues, Hand Towels, Kitchen Rolls & Wholesale Essentials",
    linkUrl: "/shop?category=tissue-paper-products",
  },
  {
    id: "deal-cleaning-solutions",
    title: "Impeccable Cleaning Solution",
    imageUrl: "/images/deals/hero-cleaning-solutions.jpg",
    mobileImageUrl: "/images/deals/hero-cleaning-solutions-mobile.jpg",
    alt: "Pak Multilinks Impeccable Cleaning Solution - Premium Grade Disinfectants, Detergents & Cleaning Supplies",
    linkUrl: "/shop?category=cleaning-products",
  },
  {
    id: "deal-freshness-hygiene",
    title: "Freshness You Can Trust",
    imageUrl: "/images/deals/hero-freshness-hygiene.jpg",
    mobileImageUrl: "/images/deals/hero-freshness-hygiene-mobile.jpg",
    alt: "Pak Multilinks Freshness You Can Trust - Premium Hygiene & Wholesale Essentials",
    linkUrl: "/shop",
  },
  {
    id: "deal-warehouse-quality",
    title: "Quality hygiene supply",
    imageUrl: "/images/deals/warehouse-quality.png",
    mobileImageUrl: "/images/deals/warehouse-quality-mobile.jpg",
    alt: "Pak Multilinks bulk hygiene products and warehouse supply",
    linkUrl: "/shop",
  },
  {
    id: "deal-special-offer",
    title: "Special hygiene offer",
    imageUrl: "/images/deals/special-offer.png",
    mobileImageUrl: "/images/deals/special-offer-mobile.jpg",
    alt: "Pak Multilinks special offer on selected hygiene products",
    linkUrl: "/shop",
  },
];

export async function listPublicDeals(): Promise<PublicDealBanner[]> {
  if (!isDatabaseConfigured) return defaultDealBanners;

  try {
    const rows = await withDatabaseRetry(() =>
      db.dealBanner.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    );
    const active = rows
      .filter((row) => row.isActive && row.title.trim().toLowerCase() !== "fine life" && !row.imageUrl.toLowerCase().includes("fine-life"))
      .map((row) => ({
        id: row.id,
        title: row.title,
        imageUrl: row.imageUrl,
        mobileImageUrl: MOBILE_IMAGE_MAP[row.imageUrl] || row.imageUrl,
        alt: row.alt || row.title,
        linkUrl: row.linkUrl || "/shop",
      }));
    return active.length > 0 ? active : defaultDealBanners;
  } catch (error) {
    console.error("[listPublicDeals] Database error fetching deals:", error);
    return defaultDealBanners;
  }
}
