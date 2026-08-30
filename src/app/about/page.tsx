import type { Metadata } from "next";
import { BriefcaseBusiness, Building2, PackageCheck, UserRound } from "lucide-react";
import Link from "next/link";

import { company } from "@/lib/company";

export const metadata: Metadata = { title: "About Our Wholesale Hygiene Supply Business", description: `Learn about ${company.name}, a Lahore-based supplier of tissue, washroom and hygiene products by carton.`, alternates: { canonical: "/about" }, openGraph: { title: `About ${company.name}`, description: "Wholesale tissue and hygiene supplies for businesses in Lahore.", url: "/about", type: "website" } };

export default function AboutPage() {
  return <>
    <section className="bg-white py-12 sm:py-16"><div className="site-shell grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-20"><div><h1 className="text-3xl font-black tracking-[-.035em] text-[#173c29]">Wholesale hygiene supplies in Lahore</h1><div className="mt-6 space-y-5 text-base leading-8 text-[#5f7066]"><p>Pak Multilinks Hygiene supplies tissue, washroom and hygiene products to businesses from our office in Gulberg II, Lahore.</p><p>Products are supplied by carton. Packing, current stock and pricing are confirmed before an order is accepted.</p><p>For regular or mixed requirements, send us the products and quantities you need and our team will prepare a quotation.</p></div><div className="mt-8 flex flex-wrap gap-3"><Link href="/shop" className="commerce-button commerce-button-primary inline-flex items-center">View products</Link><Link href="/request-quote" className="commerce-button commerce-button-secondary inline-flex items-center">Get a quote</Link></div></div><aside className="rounded-[2rem] border border-[#d8e6dc] bg-[#f1f8f3] p-6 sm:p-8"><p className="eyebrow">Business details</p><dl className="mt-6 space-y-5">{[[UserRound, "Contact person", `${company.contactPerson} · ${company.designation}`], [BriefcaseBusiness, "Business type", "Wholesale hygiene & corporate supplies"], [Building2, "Location", company.address], [PackageCheck, "Supply unit", "Cartons / bulk requirements"]].map(([Icon, term, detail]) => { const C = Icon as typeof UserRound; return <div key={term as string} className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#17643a]"><C className="size-[18px]" /></span><div><dt className="text-xs font-bold uppercase tracking-[.12em] text-[#718479]">{term as string}</dt><dd className="mt-1 text-sm font-bold leading-6 text-[#254735]">{detail as string}</dd></div></div>; })}</dl></aside></div></section>
  </>;
}
