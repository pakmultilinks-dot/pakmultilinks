import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, PackageCheck } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { VisualCategories } from "@/components/catalog/visual-categories";
import { SalesContactLink } from "@/components/commerce/sales-contact";
import { mobileCategories } from "@/lib/catalog-visuals";
import type { Category, Product } from "@/lib/types";

export function MobileHome({ categories, products }: { categories: Category[]; products: Product[] }) {
  const featured = [...products].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Number(Boolean(b.image)) - Number(Boolean(a.image))).slice(0, 4);
  return <div className="mobile-home md:hidden">
    <section className="site-shell pb-6 pt-5" aria-labelledby="mobile-home-title">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[.14em] text-[#63776a]">Hygiene essentials · By the carton</p>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 id="mobile-home-title" className="text-2xl font-semibold tracking-tight">What do you need?</h1>
        <Link href="/shop" className="focus-ring flex min-h-11 shrink-0 items-center gap-1 text-xs font-semibold">Shop all <ArrowRight className="size-4" /></Link>
      </div>
      <VisualCategories categories={mobileCategories(categories)} products={products} />
      <Link href="/shop" className="commerce-button commerce-button-primary mt-4 w-full">View full catalog <ArrowRight className="size-4" /></Link>
    </section>

    {featured.length > 0 && <section className="site-shell pb-7" aria-labelledby="mobile-featured-title">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 id="mobile-featured-title" className="text-xl font-semibold">Everyday essentials</h2><Link href="/shop" className="focus-ring flex min-h-11 items-center gap-1 text-xs font-semibold">View all <ArrowRight className="size-4" /></Link></div>
      <div className="grid grid-cols-2 gap-3">{featured.map(product => <ProductCard key={product.id} product={product} headingLevel="h3" />)}</div>
    </section>}

    <section id="mobile-services" className="site-shell pb-7" aria-labelledby="mobile-services-title">
      <h2 id="mobile-services-title" className="mb-4 text-xl font-semibold">For your business</h2>
      <div className="grid grid-cols-2 gap-3">
        {[{ title: "Workplace supplies", cta: "Explore service", href: "/corporate-orders", image: "/images/warehouse-team.webp", Icon: Building2 },
          { title: "Bulk quotations", cta: "Get bulk price", href: "/request-quote", image: "/images/about-product-range.png", Icon: PackageCheck }].map(({ title, cta, href, image, Icon }) =>
          <Link key={title} href={href} className="focus-ring overflow-hidden rounded-2xl border border-[#dde6dd] bg-white">
            <div className="relative aspect-[4/3]"><Image src={image} alt="" fill sizes="46vw" className="object-cover" /></div>
            <div className="p-3"><Icon aria-hidden="true" className="mb-2 size-5 text-[#38734d]" /><h3 className="text-sm font-semibold">{title}</h3><span className="mt-2 flex items-center gap-1 text-xs text-[#53735e]">{cta}<ArrowRight aria-hidden="true" className="size-3" /></span></div>
          </Link>)}
      </div>
      <div className="mt-4 rounded-2xl bg-[#e8f1e7] p-4"><h3 className="font-semibold">Need help choosing?</h3><p className="mb-3 mt-1 text-sm text-[#536b59]">Send your list. Let’s sort your supplies.</p><SalesContactLink className="commerce-button commerce-button-primary w-full">Get bulk price on WhatsApp</SalesContactLink></div>
    </section>
  </div>;
}
