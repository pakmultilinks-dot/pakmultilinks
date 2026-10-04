import { ArrowRight, PackageCheck, Phone, Truck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/catalog/product-card";
import { TrustedPartners } from "@/components/home/trusted-partners";
import { DealsSlider } from "@/components/home/deals-slider";
import { listPublicCategories, listPublicProducts } from "@/lib/catalog-server";
import { company } from "@/lib/company";
import { listPublicDeals } from "@/lib/deals";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/", title: `${company.name} | ${company.tagline}` } };
export const revalidate = 60;

export default async function HomePage() {
  const [products, categories, deals] = await Promise.all([listPublicProducts(), listPublicCategories(), listPublicDeals()]);
  const featured = products.filter(product => product.featured);
  const homeProducts = (featured.length ? featured : products).slice(0, 8);
  const roots = categories.filter(category => !category.parentId);
  return <>
    <DealsSlider deals={deals} />
    <TrustedPartners />
    <div className="border-y border-neutral-200 bg-white"><div className="site-shell grid grid-cols-1 divide-y divide-neutral-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">{[{ Icon: PackageCheck, title: "Supplied by the carton", text: "Packing details on every product" }, { Icon: Truck, title: "Business orders welcome", text: "Delivery arranged with your order" }, { Icon: Phone, title: "A person to talk to", text: company.phone }].map(({ Icon, title, text }) => <div key={title} className="flex items-center justify-start gap-3 py-5 sm:justify-center sm:px-4"><Icon className="size-5 text-[#435b4d]" strokeWidth={1.4} /><div><p className="text-xs font-semibold text-neutral-800">{title}</p><p className="mt-1 text-[11px] text-neutral-500">{text}</p></div></div>)}</div></div>
    <section className="site-shell py-12 sm:py-16"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs text-neutral-500">Find what you need</p><h2 className="mt-2 font-serif text-3xl text-neutral-900 sm:text-4xl">Shop by category</h2></div><Link href="/shop" className="flex items-center gap-2 text-xs underline underline-offset-4">Shop all<ArrowRight className="size-3.5" /></Link></div><div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">{roots.map(category => <div key={category.id} className="border-t border-neutral-300 pt-5"><Link href={`/shop/${category.slug}`} className="flex items-center justify-between gap-3 text-sm font-semibold hover:underline">{category.name}<ArrowRight className="size-4 text-neutral-400" /></Link><p className="mt-3 text-xs leading-6 text-neutral-500">{category.description}</p><ul className="mt-3 space-y-2">{categories.filter(child => child.parentId === category.id).slice(0, 5).map(child => <li key={child.id}><Link href={`/shop/${child.slug}`} className="text-xs text-neutral-600 hover:underline">{child.name}</Link></li>)}</ul></div>)}</div></section>
    <section className="border-t border-neutral-200 bg-white py-12 sm:py-16"><div className="site-shell"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs text-neutral-500">For your everyday spaces</p><h2 className="mt-2 font-serif text-3xl text-neutral-900 sm:text-4xl">From our collection</h2></div><Link href="/shop" className="text-xs underline underline-offset-4">View all products</Link></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">{homeProducts.map(product => <ProductCard key={product.id} product={product} headingLevel="h3" />)}</div></div></section>
    <section className="border-y border-neutral-200 bg-[#f2f1ec] py-14 sm:py-20"><div className="site-shell grid gap-8 md:grid-cols-2 md:items-center"><div><p className="text-xs uppercase tracking-[.12em] text-neutral-500">For your business</p><h2 className="mt-4 max-w-lg font-serif text-3xl leading-tight text-[#23372d] sm:text-4xl">A well-stocked workplace.<br />One less thing to worry about.</h2></div><div className="max-w-md md:ml-auto"><p className="text-sm leading-7 text-neutral-600">From offices and restaurants to schools and clinics, we help you arrange the everyday supplies your team needs. Send us your quantities for a quotation.</p><Link href="/corporate-orders" className="commerce-button commerce-button-primary mt-6">Explore business supply<ArrowRight className="size-4" /></Link></div></div></section>
  </>;
}
