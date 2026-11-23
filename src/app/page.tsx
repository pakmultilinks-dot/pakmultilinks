import { HomeProductsExplorer } from "@/components/home/home-products-explorer";
import { DealsSlider } from "@/components/home/deals-slider";
import { PerksStrip } from "@/components/home/perks-strip";
import { ShopByBrand } from "@/components/home/shop-by-brand";
import { BrandShowcase } from "@/components/home/brand-showcase";
import { listPublicCategories, listPublicProducts } from "@/lib/catalog-server";
import { company } from "@/lib/company";
import { listPublicDeals } from "@/lib/deals";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/", title: `${company.name} | ${company.tagline}` } };
export const revalidate = 3600;

// Real product photos for the desktop category cards (same as the mobile grid).
const CATEGORY_IMAGES: Record<string, string> = {
  "tissue-paper-products": "/rate-products/rose-petal-pop-up.jpg",
  "washroom-supplies": "/rate-products/germicure-toilet-cleaner.jpg",
  "cleaning-products": "/rate-products/fresco-dish-wash-liquid.jpg",
  "garbage-bags": "/images/products/garbage-bags-real.jpg",
  "dispensers": "/rate-products/fresco-air-freshener-dispenser.jpg",
  "cleaning-tools": "/images/products/mop-tools-real.jpg",
  "soaps-sanitizers": "/rate-products/germicure-hand-wash.jpg",
  "wet-wipes-fresheners": "/rate-products/air-energy-aerosol-refill.jpg",
  "disposable-items": "/images/products/garbage-bags-real.jpg",
  "all": "/images/about-product-range.png",
};

export default async function HomePage() {
  const [products, categories, deals] = await Promise.all([listPublicProducts(), listPublicCategories(), listPublicDeals()]);
  const roots = categories.filter(category => !category.parentId);

  return (
    <>
      {/* Desktop Hero Section & Strips (Hidden on mobile as requested) */}
      <div className="hidden md:block">
        <DealsSlider deals={deals} />
        <PerksStrip />
        <section className="border-b border-line bg-surface py-10 sm:py-12">
          <div className="site-shell max-w-4xl">
            <h1 className="font-serif text-2xl text-content sm:text-3xl">Wholesale tissue &amp; hygiene supplies, supplied by the carton</h1>
            <p className="mt-4 text-sm leading-7 text-secondary sm:text-base sm:leading-8">
              Pak Multilinks Hygiene is a Lahore wholesale supplier of tissue paper products, washroom supplies, cleaning
              chemicals and disposable items for offices, hotels, restaurants, hospitals, schools and factories. We stock
              Rose Petal, Nozomi, Fresco, Germi Cure and Shine Well, sold by the carton at wholesale rates with
              a minimum order of one carton or PKR 5,000.
            </p>
            <p className="mt-3 text-sm leading-7 text-secondary sm:text-base sm:leading-8">
              Orders in Lahore are delivered the same day or the next day, and cartons are dispatched nationwide. Check the{" "}
              <Link href="/rate-list" className="font-semibold text-accent hover:underline">wholesale rate list</Link> for
              current prices, see the{" "}
              <Link href="/industries" className="font-semibold text-accent hover:underline">industries we serve</Link>, or
              send your list on WhatsApp for an instant quotation.
            </p>
          </div>
        </section>
        <ShopByBrand />

        {/* Desktop Category Navigation */}
        <section className="site-shell py-8 sm:py-12 border-b border-line">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <h2 className="font-serif text-2xl text-content sm:text-3xl">Shop by category</h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1.5 text-xs font-bold text-action hover:underline">
              Shop all<ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-4">
            {roots.map((category, idx) => (
              <div key={category.id} className={`overflow-hidden rounded-xl bg-surface/60 shadow-2xs hover:bg-surface hover:shadow-xs transition animate-page-enter stagger-${Math.min(idx + 1, 4)}`}>
                <Link href={`/shop/${category.slug}`} className="relative block h-36 w-full overflow-hidden" aria-label={category.name}>
                  <Image src={CATEGORY_IMAGES[category.slug] || "/images/about-product-range.png"} alt={category.name} fill className="object-cover transition-transform duration-300 hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px" />
                </Link>
                <div className="p-4">
                <Link href={`/shop/${category.slug}`} className="flex items-center justify-between gap-3 text-sm font-bold text-accent hover:text-action">
                  {category.name}<ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1" />
                </Link>
                <ul className="mt-3 space-y-2">
                  {categories.filter(child => child.parentId === category.id).slice(0, 5).map(child => (
                    <li key={child.id}>
                      <Link href={`/shop/${child.slug}`} className="inline-block p-0 text-xs text-secondary hover:text-accent hover:underline transition-colors">
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Brand showcases: Rose Petal + Tissue Craft with circular scrolling products (all screens) */}
      <section className="site-shell py-6 sm:py-8">
        <BrandShowcase />
      </section>

      {/* Main Products Explorer: Shows ALL products with rates on site opening (prominently at top on mobile) */}
      <HomeProductsExplorer products={products} categories={categories} />

    </>
  );
}
