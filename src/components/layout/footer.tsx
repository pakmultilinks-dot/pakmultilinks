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
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">Get in touch</h2>
        <div className="mt-4 space-y-3 text-xs leading-6">
          <a href={`tel:${company.phoneHref}`} className="block hover:underline">{company.phone}</a>
          <a href={`https://wa.me/${company.whatsapp || "923006917385"}`} target="_blank" rel="noreferrer" className="block text-[#17643a] font-semibold hover:underline">
            WhatsApp: {company.phone}
          </a>
          <a href={`mailto:${company.email}`} className="block break-all hover:underline">{company.email}</a>
          <p className="text-neutral-500">{company.address}</p>
          {company.facebookUrl && (
            <div className="pt-2">
              <a
                href={company.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#cde0d3] bg-[#f4f9f5] px-3 py-1.5 text-xs font-bold text-[#1877F2] transition hover:bg-[#e8f3ec]"
                aria-label="Follow Pak Multilinks on Facebook"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Follow on Facebook</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="border-t border-neutral-200"><div className="site-shell flex flex-col justify-between gap-4 py-5 text-[11px] text-neutral-500 sm:flex-row"><p>© {new Date().getFullYear()} {company.name}</p><nav className="flex gap-5" aria-label="Legal"><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms</Link><Link href="/returns">Returns</Link>{company.facebookUrl && <a href={company.facebookUrl} target="_blank" rel="noreferrer" className="text-[#1877F2] hover:underline">Facebook</a>}</nav></div></div>
  </footer>;
}
function FooterGroup({ title, links }: { title: string; links: string[][] }) { return <div><h2 className="text-sm font-semibold text-neutral-900">{title}</h2><ul className="mt-4 space-y-3 text-xs text-neutral-500">{links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-neutral-900 hover:underline">{label}</Link></li>)}</ul></div>; }
