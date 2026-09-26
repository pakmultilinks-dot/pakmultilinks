import {
  Boxes,
  BriefcaseBusiness,
  Factory,
  Handshake,
  Headphones,
  HeartPulse,
  Hotel,
  Landmark,
  PackageCheck,
  School,
  ShieldCheck,
  Store,
  Tags,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { ProductCard } from "@/components/catalog/product-card";
import { HomeHero } from "@/components/home/home-hero";
import { DealsSlider } from "@/components/home/deals-slider";
import { SectionHeading } from "@/components/ui/section-heading";
import { isDevelopmentProduct, listPublicProducts } from "@/lib/catalog-server";
import { company } from "@/lib/company";
import { listPublicDeals } from "@/lib/deals";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: `${company.name} | ${company.tagline}` },
};

// Refresh catalog-led homepage sections after admin inventory changes.
export const revalidate = 60;

const industries = [
  { icon: BriefcaseBusiness, label: "Offices" }, { icon: HeartPulse, label: "Hospitals" },
  { icon: UtensilsCrossed, label: "Restaurants" }, { icon: Hotel, label: "Hotels" },
  { icon: School, label: "Schools" }, { icon: Factory, label: "Factories" },
  { icon: Store, label: "Shopping centers" }, { icon: Landmark, label: "Commercial buildings" },
];

export default async function HomePage() {
  const [catalogProducts, dealBanners] = await Promise.all([
    listPublicProducts(),
    listPublicDeals(),
  ]);
  const featuredProducts = catalogProducts.filter((product) => product.featured);
  const homeProducts = (featuredProducts.length ? featuredProducts : catalogProducts).slice(0, 6);
  const demoCatalog = homeProducts.length > 0 && homeProducts.every(isDevelopmentProduct);
  return (
    <>
      <HomeHero />

      <DealsSlider deals={dealBanners} />

      <section className="bg-white py-20 sm:py-24">
        <div className="site-shell">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionHeading eyebrow="Wholesale range" title="Products available by carton" description="View our tissue and hygiene range. Contact us to confirm current packing, price and stock." /><Link href="/shop" className="commerce-button commerce-button-secondary focus-ring inline-flex w-fit items-center">View all products</Link></div>
          {demoCatalog && <div className="mt-10 rounded-2xl border border-[#e8dfbf] bg-[#fffaf0] px-4 py-3 text-xs leading-5 text-[#765e18]"><strong>Catalog setup:</strong> Product names are supplied by the business; exact carton packing, stock and prices must be entered from Admin before live fulfilment.</div>}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{homeProducts.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 3} headingLevel="h3" />)}</div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="site-shell overflow-hidden rounded-[2rem] bg-[#123f2a] text-white shadow-[0_30px_80px_rgba(17,75,47,.18)]">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-7 sm:p-12 lg:p-16">
              <p className="eyebrow !text-[#83c99c]">Corporate & B2B supply</p>
              <h2 className="balance mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Hygiene solutions for your business</h2>
              <p className="pretty mt-5 max-w-xl text-base leading-7 text-[#c8dfd0] sm:text-lg">Share the products, quantities and delivery location you need. Our team will review the details and send you a quotation.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/request-quote" className="commerce-button focus-ring inline-flex items-center justify-center border border-white bg-white text-[#12482e] hover:bg-[#eff8f2]">Request a quotation</Link><a href={`tel:${company.phoneHref}`} className="commerce-button focus-ring inline-flex items-center justify-center border border-white/40 text-white hover:bg-white/10">Call {company.phone}</a></div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/10 p-px lg:grid-cols-2">{industries.map(({ icon: Icon, label }) => <div key={label} className="flex min-h-28 items-center gap-3 bg-[#164830] p-5 sm:min-h-32"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#92d1a8]"><Icon className="size-5" /></span><span className="text-sm font-bold text-[#e6f2e9]">{label}</span></div>)}</div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dce8df] bg-[#eef7f0] py-20 sm:py-24">
        <div className="site-shell">
          <SectionHeading eyebrow="Built around business supply" title="Why choose Pak Multilinks Hygiene" description="Straightforward wholesale carton supply for teams and organizations." center />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [PackageCheck, "Reliable supply", "Practical support for routine and repeat requirements."],
              [Tags, "Competitive quotations", "Wholesale carton pricing reviewed for each requirement."],
              [ShieldCheck, "Quality-minded selection", "Product details can be reviewed before order confirmation."],
              [Boxes, "Bulk order support", "A dedicated quotation flow for larger or mixed requirements."],
              [Handshake, "Business-to-business service", "Structured support for offices and commercial facilities."],
              [Headphones, "Dedicated assistance", `Direct contact with ${company.contactPerson}, ${company.designation}.`],
            ].map(([Icon, title, text]) => { const C = Icon as typeof PackageCheck; return <article key={title as string} className="rounded-3xl border border-[#d8e6dc] bg-white p-6"><span className="grid size-11 place-items-center rounded-2xl bg-[#eaf6ed] text-[#17643a]"><C className="size-5" /></span><h3 className="mt-5 text-lg font-extrabold text-[#173c29]">{title as string}</h3><p className="mt-2 text-sm leading-6 text-[#68766d]">{text as string}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="site-shell grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#0c3d27_0%,#17643a_55%,#dfeee3_100%)] p-3 shadow-[0_24px_65px_rgba(18,63,42,.18)] sm:p-5">
            <div className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-[#63b47c]/35 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-white/35 blur-3xl" />
            <Image src="/images/about-product-range.png" alt="Pak Multilinks tissue product range featuring Rose Petal, Mamos 872, Soft Pack and jumbo tissue rolls" width={1536} height={1024} sizes="(min-width: 1024px) 50vw, 100vw" className="relative aspect-[3/2] h-auto w-full rounded-[1.35rem] border border-white/50 object-cover shadow-[0_16px_42px_rgba(4,29,17,.25)]" />
          </div>
          <div><SectionHeading eyebrow="About us" title="Wholesale hygiene supplies in Lahore" description={`${company.name} supplies tissue and hygiene products by carton to offices, institutions and commercial customers.`} /><p className="mt-5 text-base leading-7 text-[#64736a]">Browse available products or send us your quantities for a formal quotation.</p><Link href="/about" className="commerce-button commerce-button-primary focus-ring mt-7 inline-flex items-center">About Pak Multilinks</Link></div>
        </div>
      </section>

      <section className="bg-[#f3bb43] py-12 text-[#183528] sm:py-16">
        <div className="site-shell flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#6a5319]">Bulk orders</p><h2 className="balance mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Need a quotation?</h2><p className="mt-3 text-base text-[#5c4c24]">Send us your product quantities and delivery city.</p></div><div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"><Link href="/request-quote" className="commerce-button commerce-button-primary focus-ring inline-flex items-center justify-center">Get a quote</Link><a href={`tel:${company.phoneHref}`} className="commerce-button focus-ring inline-flex items-center justify-center border border-[#7d6426]/50 bg-white/50 text-[#183528] hover:bg-white/80">Call us</a></div></div>
      </section>
    </>
  );
}
