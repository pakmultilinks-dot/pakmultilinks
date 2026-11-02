"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categories as initialCategories } from "@/lib/catalog";
import { useSalesContactNumber } from "@/components/commerce/sales-contact";
import { company } from "@/lib/company";
import type { Category } from "@/lib/types";
import { getClientCatalog } from "@/lib/catalog-client";
import { BrandMark } from "./brand-mark";

export function Footer() {
  const whatsapp = useSalesContactNumber();
  const [categories, setCategories] = useState(initialCategories);
  useEffect(() => {
    let active = true;
    getClientCatalog().then(data => {
      if (active && Array.isArray(data?.categories)) setCategories(data.categories);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return (
    <footer className="border-t border-line bg-surface text-secondary pb-24 md:pb-0">


      <div className="site-shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_.8fr_1fr_1.1fr] lg:py-16">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-sm text-xs leading-6 text-muted">
            Tissue, washroom and hygiene essentials, supplied by the carton from Gulberg II, Lahore. Official wholesale distributor for leading institutional brands.
          </p>
          
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://www.facebook.com/pakmultilinks"
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-xl border border-line bg-surface-soft text-accent transition hover:border-action hover:bg-action hover:text-white"
              aria-label="Facebook"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a
              href="https://www.instagram.com/pakmultilinks"
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-xl border border-line bg-surface-soft text-accent transition hover:border-action hover:bg-action hover:text-white"
              aria-label="Instagram"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Pak Multilinks, I need assistance with wholesale supply.")}`}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-xl border border-line bg-surface-soft text-[#128C7E] transition hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
              aria-label="WhatsApp"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.747.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>

        <FooterGroup
          title="Information & Orders"
          links={[
            ["Official Rate List 2026", "/rate-list"],
            ["Frequently Asked Questions", "/faq"],
            ["Procurement Guides & Blog", "/blog"],
            ["About Our Business", "/about"],
            ["Corporate Orders (B2B)", "/corporate-orders"],
            ["Request a Bulk Quote", "/request-quote"],
            ["Industries We Serve", "/industries"],
            ["Customer Account & Orders", "/account"],
            ["Contact Our Lahore Office", "/contact"],
          ]}
        />

        <FooterGroup
          title="Product Collections"
          links={categories.filter((category: Category) => !category.parentId).slice(0, 7).map(category => [category.name, `/shop/${category.slug}`])}
        />

        <div>
          <h2 className="text-sm font-bold text-content">Lahore Office & Direct Orders</h2>
          <div className="mt-4 space-y-3 text-xs leading-6">
            <a href={`tel:${company.phoneHref}`} className="flex items-center gap-2 font-bold text-accent hover:underline">
              <span>📞</span> {company.phone}
            </a>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Pak Multilinks, I am inquiring about wholesale supplies")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 font-bold text-[#128C7E] hover:underline"
            >
              <span>💬</span> WhatsApp: {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="block break-all text-secondary hover:underline">
              ✉️ {company.email}
            </a>
            <p className="text-muted leading-5">
              📍 {company.address}
            </p>
            {company.facebookUrl && (
              <div className="pt-2">
                <a
                  href={company.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-soft px-3 py-1.5 text-xs font-bold text-accent transition hover:border-action hover:bg-surface"
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

      <div className="border-t border-line bg-surface-soft/40">
        <div className="site-shell flex flex-col justify-between gap-4 py-5 text-[11px] text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {company.name}. All wholesale rights reserved.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
            <Link href="/privacy" className="hover:underline">Privacy policy</Link>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link href="/returns" className="hover:underline">Returns & Claims</Link>
            <Link href="/rate-list" className="hover:underline font-semibold text-accent">Rate List</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
function FooterGroup({ title, links }: { title: string; links: string[][] }) { return <div><h2 className="text-sm font-semibold text-content">{title}</h2><ul className="mt-4 space-y-3 text-xs text-muted">{links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-content hover:underline">{label}</Link></li>)}</ul></div>; }
