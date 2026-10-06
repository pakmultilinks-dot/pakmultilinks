"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  MessageSquareQuote,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Category, Product } from "@/lib/types";
import { VISUAL_CATEGORIES, buildDirectWhatsAppUrl } from "@/lib/category-meta";
import { company } from "@/lib/company";
import { ProductCard } from "@/components/catalog/product-card";

type MobileHomeExperienceProps = {
  products: Product[];
  categories: Category[];
};

export function MobileHomeExperience({
  products,
  categories,
}: MobileHomeExperienceProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPill, setSelectedPill] = useState<string>("all");

  const displayProducts = selectedPill === "all"
    ? products.slice(0, 8)
    : products.filter(
        (p) =>
          p.categorySlug === selectedPill ||
          p.parentCategorySlug === selectedPill ||
          p.category.toLowerCase().includes(selectedPill),
      );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/shop");
    }
  }

  return (
    <div className="bg-[#f8f9f6] pb-24 text-[#173328]">
      {/* 1. TOP QUICK SEARCH & CALL BAR */}
      <div className="sticky top-0 z-40 border-b border-[#e1ece4] bg-white/95 px-3.5 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1"
            role="search"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#647c6e]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, tissues, mops..."
              className="h-10 w-full rounded-xl border border-[#d6e3da] bg-[#f4f7f4] pl-9 pr-3 text-xs font-medium text-[#173c29] outline-none transition focus:border-[#17643a] focus:bg-white focus:ring-2 focus:ring-[#17643a]/15"
            />
          </form>
          <a
            href={`https://wa.me/${company.whatsapp || "923006917385"}`}
            target="_blank"
            rel="noreferrer"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm active:scale-95"
            aria-label="Direct WhatsApp"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="size-5" />
          </a>
          <a
            href={`tel:${company.phoneHref}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#d6e3da] bg-white text-[#17643a] shadow-sm active:scale-95"
            aria-label="Direct Call"
            title="Call"
          >
            <Phone className="size-4" />
          </a>
        </div>
      </div>

      {/* 2. COMPACT VISUAL HERO (PUNCHY, NO LONG ESSAYS) */}
      <section className="px-3.5 pt-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#123e27] via-[#1a5535] to-[#247047] p-5 text-white shadow-lg">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-[#baf3cd] backdrop-blur-sm">
              <Sparkles className="size-3.5" /> Lahore Wholesale Hygiene
            </span>
            <h1 className="mt-3 text-xl font-extrabold leading-tight tracking-tight text-white">
              Direct Wholesale Supplies<br />By The Carton
            </h1>
            <p className="mt-1.5 text-xs text-[#d3ede0]">
              Tissues · Hand Wash · Floor Cleaners · Garbage Bags · Dispensers
            </p>

            {/* Quick Benefits Pills */}
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-white/90">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1">
                <CheckCircle2 className="size-3 text-[#52e891]" /> Direct Rates
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1">
                <Truck className="size-3 text-[#52e891]" /> Lahore Delivery
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1">
                <ShieldCheck className="size-3 text-[#52e891]" /> Carton Supply
              </span>
            </div>

            {/* Visual Action CTAs */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Link
                href="/shop"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-extrabold text-[#15462c] shadow transition active:scale-95"
              >
                View Catalog <ArrowRight className="size-3.5" />
              </Link>
              <a
                href={buildDirectWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-extrabold text-white shadow transition hover:bg-[#1fb355] active:scale-95"
              >
                <MessageCircle className="size-3.5" /> WhatsApp to Order
              </a>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-8 size-44 rounded-full bg-white/10 blur-2xl" />
        </div>
      </section>

      {/* 3. HORIZONTAL CATEGORY PILLS (FAST 1-TOUCH JUMP) */}
      <section className="mt-4 px-3.5">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          <button
            type="button"
            onClick={() => setSelectedPill("all")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
              selectedPill === "all"
                ? "bg-[#17643a] text-white shadow-sm"
                : "border border-[#d2dfd6] bg-white text-[#2a4d38]"
            }`}
          >
            All Products
          </button>
          {VISUAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedPill(cat.slug)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                selectedPill === cat.slug
                  ? "bg-[#17643a] text-white shadow-sm"
                  : "border border-[#d2dfd6] bg-white text-[#2a4d38]"
              }`}
            >
              <span className="relative size-4 overflow-hidden rounded-full">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-contain"
                />
              </span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 4. MAIN VISUAL CATEGORIES (IMAGE-FIRST DIGITAL CATALOG) */}
      <section className="mt-6 px-3.5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#246b45]">
              Visual Catalog
            </span>
            <h2 className="text-lg font-extrabold text-[#143d28]">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-[#17643a] hover:underline"
          >
            All Categories <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* 2-Column High-Impact Category Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {VISUAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#dbe6df] bg-white p-3 shadow-sm transition hover:border-[#17643a] hover:shadow-md active:scale-[0.98]"
            >
              {/* Product Visual */}
              <div
                className="relative aspect-square w-full overflow-hidden rounded-xl p-3 transition group-hover:scale-105"
                style={{ backgroundColor: cat.bgLight }}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-contain p-2"
                />
                <span
                  className="absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white shadow-xs"
                  style={{ backgroundColor: cat.accentColor }}
                >
                  {cat.badge}
                </span>
              </div>

              {/* Category Info (Minimal Text, Clean) */}
              <div className="mt-2.5 flex flex-1 flex-col">
                <h3 className="text-xs font-bold text-[#163c28] group-hover:text-[#17643a]">
                  {cat.name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-[#63756b]">
                  {cat.tagline}
                </p>
                <div className="mt-2 flex items-center justify-between pt-1">
                  <span className="text-[11px] font-extrabold text-[#17643a]">
                    View Catalog
                  </span>
                  <div className="flex size-5 items-center justify-center rounded-full bg-[#ecf5ef] text-[#17643a] group-hover:bg-[#17643a] group-hover:text-white">
                    <ChevronRight className="size-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. FAST MOVING PRODUCTS SHOWCASE (VISUAL + 1-TAP WHATSAPP / BUY) */}
      <section className="mt-8 px-3.5">
        <div className="mb-3.5 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#246b45]">
              Carton Wholesale
            </span>
            <h2 className="text-lg font-extrabold text-[#143d28]">
              {selectedPill === "all" ? "Popular Products" : "Category Products"}
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-[#17643a] hover:underline"
          >
            View all ({products.length}) <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout="grid"
                headingLevel="h3"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#ccdcd1] bg-white p-6 text-center">
            <Package className="mx-auto size-8 text-[#8da696]" />
            <p className="mt-2 text-xs font-bold text-[#2a4d38]">
              Products loading for this category
            </p>
            <Link
              href="/shop"
              className="mt-3 inline-block rounded-lg bg-[#17643a] px-3 py-1.5 text-xs font-bold text-white"
            >
              Browse Full Catalog
            </Link>
          </div>
        )}

        <div className="mt-5 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cadad0] bg-white px-5 py-3 text-xs font-extrabold text-[#17643a] shadow-xs active:scale-95"
          >
            Browse All Wholesale Products <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* 6. OUR SERVICES SECTION (VISUAL CARDS AS REQUESTED BY USER) */}
      <section className="mt-8 px-3.5">
        <div className="rounded-2xl border border-[#d8e5dd] bg-white p-4 shadow-sm">
          <div className="mb-3.5 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#246b45]">
              For Businesses & Offices
            </span>
            <h2 className="text-base font-extrabold text-[#143d28]">
              Our Available Services
            </h2>
            <p className="mt-0.5 text-xs text-[#63756b]">
              Reliable commercial hygiene partner for institutions across Lahore.
            </p>
          </div>

          <div className="grid gap-2.5">
            {/* Service 1 */}
            <div className="flex items-start gap-3 rounded-xl bg-[#f5f9f6] p-3 border border-[#e1ede5]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#17643a] text-white">
                <Truck className="size-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#153b28]">
                  Bulk Doorstep Delivery in Lahore
                </h3>
                <p className="mt-0.5 text-[11px] leading-4 text-[#596d61]">
                  Same-day and scheduled carton delivery directly to your facility or office.
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="flex items-start gap-3 rounded-xl bg-[#f5f9f6] p-3 border border-[#e1ede5]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#17643a] text-white">
                <CalendarCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#153b28]">
                  Corporate Restocking Contracts
                </h3>
                <p className="mt-0.5 text-[11px] leading-4 text-[#596d61]">
                  Scheduled monthly tissue, hand wash and cleaning supply plans with volume discounts.
                </p>
              </div>
            </div>

            {/* Service 3 */}
            <div className="flex items-start gap-3 rounded-xl bg-[#f5f9f6] p-3 border border-[#e1ede5]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#17643a] text-white">
                <MessageSquareQuote className="size-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#153b28]">
                  Instant WhatsApp Quotations
                </h3>
                <p className="mt-0.5 text-[11px] leading-4 text-[#596d61]">
                  Send your requirement list or BOQ on WhatsApp and get instant wholesale rates.
                </p>
              </div>
            </div>

            {/* Service 4 */}
            <div className="flex items-start gap-3 rounded-xl bg-[#f5f9f6] p-3 border border-[#e1ede5]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#17643a] text-white">
                <Wrench className="size-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#153b28]">
                  Dispensers & Hardware Installation
                </h3>
                <p className="mt-0.5 text-[11px] leading-4 text-[#596d61]">
                  Wall-mounted soap and paper dispensers with matching wholesale refill supplies.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#e8f0ea]">
            <a
              href={buildDirectWhatsAppUrl(
                "Assalam-o-Alaikum Pak Multilinks, I want to discuss corporate supplies / services for my business.",
              )}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17643a] py-3 text-xs font-extrabold text-white shadow transition hover:bg-[#104b2b] active:scale-95"
            >
              <MessageCircle className="size-4" /> Discuss Corporate Supply on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 7. LAZY CUSTOMER FAST WHATSAPP QUOTATION FUNNEL */}
      <section className="mt-6 px-3.5">
        <div className="rounded-2xl bg-gradient-to-br from-[#205e3b] to-[#123e25] p-5 text-white shadow-md">
          <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-[#a6f3c1]">
            ⚡ Fast Quotation
          </span>
          <h2 className="mt-2 text-base font-extrabold leading-snug">
            List WhatsApp par bhejein,<br />Foran wholesale quotation lein
          </h2>
          <p className="mt-1.5 text-xs text-[#d2ede0]">
            No forms, no waiting! Send your required items or picture on WhatsApp directly to our sales head.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={buildDirectWhatsAppUrl(
                "Assalam-o-Alaikum Pak Multilinks, yeh meri items ki list hai. Please bulk quotation bhej dein:",
              )}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-extrabold text-white shadow transition hover:bg-[#1ebc56] active:scale-95"
            >
              <MessageCircle className="size-4" /> WhatsApp Order
            </a>
            <a
              href={`tel:${company.phoneHref}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-3 py-2.5 text-xs font-extrabold text-white backdrop-blur-sm active:scale-95"
            >
              <Phone className="size-3.5" /> Call Sales Head
            </a>
          </div>
        </div>
      </section>

      {/* 8. TRUSTED PARTNERS (COMPACT VISUAL) */}
      <section className="mt-8 px-3.5">
        <div className="text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#72857a]">
            Supplying to Leading Institutions
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <div className="flex h-12 items-center justify-center rounded-xl border border-[#d6e3da] bg-white px-3 py-2 shadow-2xs">
              <span className="text-[11px] font-bold text-[#1f4a33]">
                Lahore Garrison University
              </span>
            </div>
            <div className="flex h-12 items-center justify-center rounded-xl border border-[#d6e3da] bg-white px-3 py-2 shadow-2xs">
              <span className="text-[11px] font-bold text-[#1f4a33]">
                Ramay Clinic
              </span>
            </div>
            <div className="flex h-12 items-center justify-center rounded-xl border border-[#d6e3da] bg-white px-3 py-2 shadow-2xs">
              <span className="text-[11px] font-bold text-[#1f4a33]">
                Moon Banquet Hall
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
