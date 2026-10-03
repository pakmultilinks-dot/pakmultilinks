"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categories as initialCategories } from "@/lib/catalog";
import { company } from "@/lib/company";
import type { Category } from "@/lib/types";
import { BrandMark } from "./brand-mark";

export function Footer() {
  const [categories, setCategories] = useState(initialCategories);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog", { signal: controller.signal }).then(response => response.ok ? response.json() : null).then(data => { if (Array.isArray(data?.categories)) setCategories(data.categories); }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return <footer className="bg-white text-neutral-700">
    <div className="site-shell grid gap-9 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_.8fr_1fr_1fr] lg:py-16">
      <div><BrandMark /><p className="mt-5 max-w-xs text-xs leading-6 text-neutral-500">Tissue, hygiene and workplace essentials, supplied by the carton from Lahore.</p></div>
      <FooterGroup title="Information" links={[["Our story", "/about"], ["Business orders", "/corporate-orders"], ["Contact us", "/contact"], ["My account", "/account"]]} />
      <FooterGroup title="Collections" links={categories.filter((category: Category) => !category.parentId).slice(0, 6).map(category => [category.name, `/shop/${category.slug}`])} />
      <div><h2 className="text-sm font-semibold text-neutral-900">Get in touch</h2><div className="mt-4 space-y-3 text-xs leading-6"><a href={`tel:${company.phoneHref}`} className="block hover:underline">{company.phone}</a><a href={`mailto:${company.email}`} className="block break-all hover:underline">{company.email}</a><p className="text-neutral-500">{company.address}</p></div></div>
    </div>
    <div className="border-t border-neutral-200"><div className="site-shell flex flex-col justify-between gap-4 py-5 text-[11px] text-neutral-500 sm:flex-row"><p>© {new Date().getFullYear()} {company.name}</p><nav className="flex gap-5" aria-label="Legal"><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms</Link><Link href="/returns">Returns</Link></nav></div></div>
  </footer>;
}
function FooterGroup({ title, links }: { title: string; links: string[][] }) { return <div><h2 className="text-sm font-semibold text-neutral-900">{title}</h2><ul className="mt-4 space-y-3 text-xs text-neutral-500">{links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-neutral-900 hover:underline">{label}</Link></li>)}</ul></div>; }
