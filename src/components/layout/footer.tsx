import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { listPublicCategories } from "@/lib/catalog-server";
import { company } from "@/lib/company";

import { BrandMark } from "./brand-mark";

export async function Footer() {
  const categories = await listPublicCategories();
  return (
    <footer className="bg-[#103b27] text-white">
      <div className="site-shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.9fr_1.2fr] lg:py-18">
        <div>
          <BrandMark light />
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#c9dfd1]">{company.tagline}. Practical hygiene and corporate supply support for organizations and everyday customers.</p>
          <p className="mt-6 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs leading-5 text-[#b9d3c3]">Product availability, delivery charges and operating terms are confirmed with each order.</p>
        </div>
        <FooterGroup title="Quick links" links={[["Shop", "/shop"], ["Corporate orders", "/corporate-orders"], ["About us", "/about"], ["Contact", "/contact"], ["My account", "/account"]]} />
        <FooterGroup title="Product categories" links={categories.slice(0, 5).map((category) => [category.name, `/shop/${category.slug}`])} />
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[.14em] text-[#82c69b]">Talk to us</h2>
          <ul className="mt-5 space-y-4 text-sm text-[#d4e6da]">
            <li><a href={`tel:${company.phoneHref}`} className="flex gap-3 hover:text-white"><Phone className="mt-0.5 size-4 shrink-0 text-[#75c190]" /><span>{company.phone}<small className="mt-1 block text-[#93ae9e]">{company.contactPerson}, {company.designation}</small></span></a></li>
            <li><a href={`mailto:${company.email}`} className="flex min-w-0 gap-3 break-all hover:text-white"><Mail className="mt-0.5 size-4 shrink-0 text-[#75c190]" /><span>{company.email}</span></a></li>
            <li className="flex gap-3 leading-6"><MapPin className="mt-1 size-4 shrink-0 text-[#75c190]" /><span>{company.address}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="site-shell flex flex-col gap-4 py-5 text-xs text-[#9bb8a6] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link><Link href="/returns" className="hover:text-white">Returns</Link></nav>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return <div><h2 className="text-sm font-extrabold uppercase tracking-[.14em] text-[#82c69b]">{title}</h2><ul className="mt-5 space-y-3 text-sm text-[#d4e6da]">{links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-white hover:underline">{label}</Link></li>)}</ul></div>;
}
