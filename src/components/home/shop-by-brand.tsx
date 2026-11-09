import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface BrandCardData {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  mainHref: string;
  popularCategories: { label: string; href: string }[];
}

export const BRAND_SHOWCASE: BrandCardData[] = [
  {
    id: "rose-petal",
    name: "Rose Petal",
    subtitle: "Pakistan's #1 Tissue Brand",
    image: "/images/brands/rose-petal.jpg",
    mainHref: "/brand/rose-petal",
    popularCategories: [
      { label: "Facial Tissues (Peach & Luxury)", href: "/shop?brand=Rose+Petal&category=facial-tissues" },
      { label: "Soft Pack Tissues (Pocket & Party)", href: "/shop?brand=Rose+Petal&category=soft-pack-tissues" },
      { label: "Zzoop Kitchen & Maxi Rolls", href: "/shop?brand=Rose+Petal&category=tissue-rolls" },
    ],
  },
  {
    id: "nozomi",
    name: "Nozomi",
    subtitle: "Commercial Pure Soft Tissues",
    image: "/images/brands/nozomi-logo-transparent.png",
    mainHref: "/brand/nozomi",
    popularCategories: [
      { label: "Pop-Up Tissues (100 Sheets x 2Ply)", href: "/shop?brand=Nozomi&category=facial-tissues" },
      { label: "Luxury & Executive Facial Boxes", href: "/shop?brand=Nozomi&category=facial-tissues" },
      { label: "Twin Soft Packs & Commercial Rolls", href: "/shop?brand=Nozomi&category=soft-pack-tissues" },
    ],
  },
  {
    id: "tissue-craft",
    name: "Tissue Craft",
    subtitle: "Premium Hygiene & Craft Paper",
    image: "/images/brands/tissue-craft.jpg",
    mainHref: "/shop?category=tissue-paper-products",
    popularCategories: [
      { label: "Craft Packs & Kitchen Towels", href: "/shop?category=tissue-rolls" },
      { label: "Commercial Toilet Paper Rolls", href: "/shop?category=tissue-rolls" },
      { label: "Custom Branded Cartons", href: "/request-quote" },
    ],
  },
  {
    id: "reckitt",
    name: "Reckitt",
    subtitle: "Household & Infection Control",
    image: "/images/brands/reckitt.jpg",
    mainHref: "/shop?category=cleaning-products",
    popularCategories: [
      { label: "Dettol Surface & Infection Control", href: "/shop?category=cleaning-products" },
      { label: "Harpic Power Plus Cleaner", href: "/shop?category=cleaning-products" },
      { label: "Mortein PowerGard Protection", href: "/shop?category=cleaning-products" },
    ],
  },
  {
    id: "cleaning-items",
    name: "Cleaning Items",
    subtitle: "Floor, Surface & Janitorial Care",
    image: "/images/brands/cleaning-items-tools.jpg",
    mainHref: "/shop?category=cleaning-products",
    popularCategories: [
      { label: "Floor & Surface Cleaners", href: "/shop?category=floor-surface-care" },
      { label: "Mops, Wipers & Microfiber", href: "/shop?category=cleaning-tools" },
      { label: "Commercial Bleach & Phenyl", href: "/shop?category=cleaning-products" },
    ],
  },
];

export function ShopByBrand() {
  return (
    <section className="border-t border-line bg-surface py-7 sm:py-9" id="shop-by-brand">
      <div className="site-shell">
        {/* Section Header */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mobile-section-title font-serif text-2xl font-normal text-content sm:text-3xl">
              Shop by Brand
            </h2>
            <p className="mt-0.5 text-xs text-secondary sm:text-sm">
              Official Bulk &amp; Retail Brand Collections with Direct Wholesale Rates
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-line bg-surface px-3.5 py-1.5 text-xs font-bold text-content shadow-xs transition hover:border-action hover:text-action sm:self-auto"
          >
            <span>Browse all brands</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 7-Column Responsive Cards Grid with Full-Box Brand Images */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 sm:gap-4">
          {BRAND_SHOWCASE.map((brand, idx) => (
            <Link
              key={brand.id}
              href={brand.mainHref}
              title={brand.name}
              aria-label={`Shop ${brand.name} products`}
              className={`shine-card group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-0 bg-white p-3 shadow-2xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 animate-page-enter stagger-${Math.min(idx + 1, 6)}`}
            >
              <Image
                src={brand.image}
                alt={brand.name}
                width={240}
                height={240}
                loading="lazy"
                unoptimized
                className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="sr-only">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
