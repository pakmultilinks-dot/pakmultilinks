"use client";

import { ArrowRight, ChevronDown, Facebook, Folder, Instagram, Linkedin, Menu, Search, ShoppingBag, Sparkles, Tag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@/components/providers/store-provider";
import { categories, products } from "@/lib/catalog";
import { brandNameToSlug, getBrandBySlug } from "@/lib/brands";
import { searchCatalog } from "@/lib/search";
import type { Category, Product } from "@/lib/types";
import { getClientCatalog } from "@/lib/catalog-client";
import { formatPrice, formatProductPrice } from "@/lib/utils";
import { getPrice } from "@/lib/catalog";


import { BrandMark } from "./brand-mark";
import { CategoryNavigation } from "./category-navigation";
import { BrandNavigation } from "./brand-navigation";

function WhatsAppIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.747.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/rate-list", label: "Rate List" },
  { href: "/corporate-orders", label: "Corporate Orders" },
  { href: "/blog", label: "Blogs" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, itemCount, subtotal, removeFromCart } = useStore();
  const hasQuotePricing = cart.some(({ product }) => product.priceOnRequest);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [searchProducts, setSearchProducts] = useState<Product[]>(products);
  const [navigationCategories, setNavigationCategories] = useState<Category[]>(categories);
  const searchWrap = useRef<HTMLDivElement>(null);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const cartDialogRef = useRef<HTMLDialogElement>(null);
  const categoryMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let previousY = window.scrollY;
    let frame = window.requestAnimationFrame(() => setHeaderHidden(false));

    function updateHeader() {
      frame = 0;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const currentY = Math.min(maxY, Math.max(0, window.scrollY));
      const header = headerRef.current;
      const activeElement = document.activeElement;
      const interacting = mobileDialogRef.current?.open || cartDialogRef.current?.open ||
        categoryMenuRef.current?.open ||
        (header?.contains(activeElement) && activeElement?.matches("input, :focus-visible"));

      if (currentY <= 60 || interacting) {
        setHeaderHidden(false);
        previousY = currentY;
        return;
      }

      // Ignore tiny jitter movements
      if (Math.abs(currentY - previousY) < 6) return;
      setHeaderHidden(currentY > previousY);
      previousY = currentY;
    }

    function onScroll() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateHeader);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const searchAnalysis = useMemo(() => {
    const clean = query.trim();
    if (!clean) {
      return {
        matches: [],
        totalMatches: 0,
        matchingBrands: [],
        matchingCategories: [],
        correctedQuery: undefined,
      };
    }
    return searchCatalog(searchProducts, clean, navigationCategories);
  }, [query, searchProducts, navigationCategories]);

  const suggestions = useMemo(() => {
    return searchAnalysis.matches.slice(0, 6).map((m) => m.item);
  }, [searchAnalysis]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!searchWrap.current?.contains(event.target as Node)) setSearchFocused(false);
      if (!categoryMenuRef.current?.contains(event.target as Node)) categoryMenuRef.current?.removeAttribute("open");
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    let active = true;
    getClientCatalog()
      .then((payload: unknown) => {
        if (!active) return;
        if (!payload || typeof payload !== "object") return;
        const data = payload as { products?: unknown; categories?: unknown };
        if (Array.isArray(data.products)) {
          const validProducts = data.products.filter(
            (value): value is Product =>
              Boolean(value) &&
              typeof value === "object" &&
              "slug" in value &&
              typeof value.slug === "string" &&
              "name" in value &&
              typeof value.name === "string",
          );
          setSearchProducts(validProducts);
        }
        if (Array.isArray(data.categories)) {
          const validCategories = data.categories.filter(
            (value): value is Category =>
              Boolean(value) &&
              typeof value === "object" &&
              "slug" in value &&
              typeof value.slug === "string" &&
              "name" in value &&
              typeof value.name === "string",
          );
          setNavigationCategories(validCategories);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const clean = query.trim();
    router.push(clean ? `/shop?q=${encodeURIComponent(clean)}` : "/shop");
    setSearchFocused(false);
    mobileDialogRef.current?.close();
  }

  return (
    <>
      <a href="#main-content" className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-lg bg-surface px-4 py-2 text-sm font-bold text-accent shadow-xl focus:translate-y-0">Skip to content</a>

      <header ref={headerRef} onFocusCapture={() => setHeaderHidden(false)} className={`storefront-header sticky top-0 z-50 border-b border-line bg-surface transition-transform duration-300 ease-out motion-reduce:transition-none ${headerHidden ? "-translate-y-full" : "translate-y-0"}`}>

          <div className="site-shell relative z-30 flex h-[70px] sm:h-[74px] md:h-[78px] items-center justify-between gap-2 md:gap-3 lg:gap-7">
          {/* Brand Logo on LEFT (prominent, clear, corporate wholesale identity) */}
          <div className="flex items-center justify-start shrink-0 py-1">
            <BrandMark />
          </div>

          <div ref={searchWrap} className="relative z-50 ml-auto hidden min-w-0 max-w-[430px] flex-1 md:block">
            <form onSubmit={submitSearch} role="search">
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-secondary" />
              <input
                id="site-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSearchFocused(false);
                }}
                placeholder="Search products, SKU or category"
                autoComplete="off"
                className="h-11 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-sm text-accent outline-none transition placeholder:text-muted focus:border-focus focus:ring-4 focus:ring-focus"
              />
            </form>
            {searchFocused && query.trim().length > 0 && (
              <nav
                className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.22)] animate-fade-in"
                aria-label="Suggested products"
              >
                {/* Typo Correction Hint */}
                {searchAnalysis.correctedQuery && searchAnalysis.correctedQuery.toLowerCase() !== query.trim().toLowerCase() && (
                  <div className="mb-2 flex items-center gap-2 rounded-xl bg-accent-soft/60 px-3 py-1.5 text-xs text-secondary">
                    <Sparkles className="size-3.5 text-accent shrink-0" />
                    <span>
                      Showing results for <strong className="text-accent">{searchAnalysis.correctedQuery}</strong>
                    </span>
                  </div>
                )}

                {/* Brand Quick Links */}
                {searchAnalysis.matchingBrands.length > 0 && (
                  <div className="mb-2 border-b border-line/60 pb-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      <Tag className="size-3" />
                      <span>Matching Brands</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                      {searchAnalysis.matchingBrands.map((b) => {
                        const brandSlug = brandNameToSlug(b.name);
                        const href = getBrandBySlug(brandSlug)
                          ? `/brand/${brandSlug}`
                          : `/shop?brand=${encodeURIComponent(b.name)}`;
                        return (
                          <Link
                            key={b.name}
                            href={href}
                            onClick={() => setSearchFocused(false)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line/70 bg-surface-soft px-2.5 py-1 text-xs font-bold text-accent transition hover:border-focus hover:bg-accent hover:text-white"
                          >
                            <span>{b.name}</span>
                            <span className="text-[10px] opacity-70">({b.count})</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Category Quick Links */}
                {searchAnalysis.matchingCategories.length > 0 && (
                  <div className="mb-2 border-b border-line/60 pb-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      <Folder className="size-3" />
                      <span>Matching Categories</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                      {searchAnalysis.matchingCategories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/shop?category=${encodeURIComponent(c.slug)}`}
                          onClick={() => setSearchFocused(false)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line/70 bg-surface-soft px-2.5 py-1 text-xs font-bold text-accent transition hover:border-focus hover:bg-accent hover:text-white"
                        >
                          <span>{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product suggestions */}
                {suggestions.length > 0 ? (
                  <>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                      Products ({searchAnalysis.totalMatches})
                    </div>
                    <ul className="space-y-1">
                      {suggestions.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/product/${product.slug}`}
                            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-surface-soft"
                            onClick={() => setSearchFocused(false)}
                          >
                            <div className="min-w-0">
                              <span className="block truncate font-bold text-accent">{product.name}</span>
                              <span className="mt-0.5 block text-xs text-muted">
                                {product.brand} · {product.category} · {product.sku}
                              </span>
                            </div>
                            <span className="shrink-0 font-bold text-accent text-xs">
                              {formatProductPrice(product)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-2 border-t border-line/60 pt-2">
                      <button
                        type="button"
                        onClick={submitSearch}
                        className="flex w-full items-center justify-between rounded-xl bg-surface-soft px-3 py-2 text-xs font-bold text-accent transition hover:bg-action hover:text-white"
                      >
                        <span>View all {searchAnalysis.totalMatches} results for &ldquo;{query}&rdquo;</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-xs text-muted">
                    No products found. Press Enter to view related items.
                  </div>
                )}
              </nav>
            )}
          </div>

          {/* Header Action Buttons (Desktop only - on mobile all quick buttons are anchored in the bottom bar) */}
          <div className="ml-auto hidden items-center gap-1.5 sm:gap-2 md:flex">
            <Link
              href="/account"
              className="commerce-icon-button focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-accent transition hover:border-line-strong hover:bg-surface-soft sm:size-11"
              aria-label="Your account"
            >
              <UserRound className="size-4 sm:size-5" />
            </Link>
            <button
              type="button"
              onClick={() => cartDialogRef.current?.showModal()}
              className="commerce-icon-button focus-ring relative grid size-10 shrink-0 place-items-center rounded-xl bg-action text-white transition hover:bg-action active:scale-95 sm:size-11"
              aria-label={`Open bulk cart with ${itemCount} cartons`}
              aria-haspopup="dialog"
            >
              <ShoppingBag className="size-4 sm:size-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-line bg-[#f3b941] px-1 text-[10px] font-black leading-4 text-accent">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Right Actions: Direct WhatsApp & Hamburger (matching user request & Metro.pk) */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 md:hidden">
            <a
              href="https://wa.me/923006917385?text=Hi%20Pak%20Multilinks%2C%20I%20am%20inquiring%20about%20wholesale%20supplies"
              target="_blank"
              rel="noreferrer"
              className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-lg border border-[#25D366]/40 bg-[#25D366]/15 text-[#128C7E] shadow-2xs transition active:scale-95 hover:bg-[#25D366] hover:text-white"
              aria-label="Direct WhatsApp"
              title="WhatsApp"
            >
              <WhatsAppIcon className="size-4" />
            </a>

            <button
              type="button"
              onClick={() => mobileDialogRef.current?.showModal()}
              className="focus-ring grid size-9 sm:size-10 shrink-0 place-items-center rounded-lg border border-line bg-surface text-accent transition hover:bg-surface-soft active:scale-95"
              aria-label="Open menu"
              aria-haspopup="dialog"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        {/* Metro-style Wholesale Delivery Strip */}
        <div className="bg-[#0f4c3a] text-white px-3 py-1.5 text-[11px] font-semibold flex items-center justify-between md:hidden shadow-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-yellow-400">📍</span>
            <span className="truncate">Wholesale Delivery: Lahore & Nationwide</span>
          </div>
          <span className="text-emerald-200 text-[10px] font-bold shrink-0 ml-2">Wholesale Carton Rates 📦</span>
        </div>

        {/* Mobile Search & Cart Bar (Metro-style clean layout with spacious search + cart on right) */}
        <div className="relative border-b border-line/60 bg-surface px-3 py-2 md:hidden">
          <div className="flex items-center gap-2.5">
            <form onSubmit={submitSearch} role="search" className="relative min-w-0 flex-1">
              <label htmlFor="mobile-site-search" className="sr-only">Search products</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="mobile-site-search"
                aria-label="Search the catalog"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products, brands, SKU..."
                className="h-10 w-full rounded-lg border border-line bg-surface-soft pl-9 pr-7 text-xs font-medium text-accent outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus shadow-2xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-accent"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </form>

            {/* Metro-style Cart Button with Yellow Badge on Right */}
            <button
              type="button"
              onClick={() => cartDialogRef.current?.showModal()}
              className="relative grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-white dark:bg-surface text-accent shadow-2xs transition active:scale-95 hover:bg-surface-soft"
              aria-label={`Open bulk cart with ${itemCount} cartons`}
              aria-haspopup="dialog"
            >
              <ShoppingBag className="size-5 text-[#0f4c3a]" />
              <span className="absolute -top-1 -right-1 grid min-w-4 h-4 place-items-center rounded-full bg-[#f3b941] px-1 text-[9px] font-black text-black shadow-xs">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            </button>
          </div>

          {/* Mobile Auto-Complete Search Suggestions */}
          {searchFocused && query.trim().length > 0 && (
            <div className="absolute inset-x-2 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface p-2.5 shadow-2xl animate-fade-in">
              {searchAnalysis.correctedQuery && searchAnalysis.correctedQuery.toLowerCase() !== query.trim().toLowerCase() && (
                <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-accent-soft/60 px-2.5 py-1 text-[11px] text-secondary">
                  <Sparkles className="size-3 text-accent shrink-0" />
                  <span>Showing results for <strong className="text-accent">{searchAnalysis.correctedQuery}</strong></span>
                </div>
              )}

              {searchAnalysis.matchingBrands.length > 0 && (
                <div className="mb-2 border-b border-line/60 pb-2">
                  <div className="flex items-center gap-1 px-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    <Tag className="size-2.5" />
                    <span>Brands</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {searchAnalysis.matchingBrands.map((b) => {
                      const brandSlug = brandNameToSlug(b.name);
                      const href = getBrandBySlug(brandSlug)
                        ? `/brand/${brandSlug}`
                        : `/shop?brand=${encodeURIComponent(b.name)}`;
                      return (
                        <Link
                          key={b.name}
                          href={href}
                          onClick={() => setSearchFocused(false)}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-soft px-2 py-0.5 text-[11px] font-bold text-accent"
                        >
                          <span>{b.name}</span>
                          <span className="text-[9px] opacity-70">({b.count})</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {searchAnalysis.matchingCategories.length > 0 && (
                <div className="mb-2 border-b border-line/60 pb-2">
                  <div className="flex items-center gap-1 px-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    <Folder className="size-2.5" />
                    <span>Categories</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {searchAnalysis.matchingCategories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/shop?category=${encodeURIComponent(c.slug)}`}
                        onClick={() => setSearchFocused(false)}
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-soft px-2 py-0.5 text-[11px] font-bold text-accent"
                      >
                        <span>{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.length > 0 ? (
                <>
                  <div className="px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Products ({searchAnalysis.totalMatches})
                  </div>
                  <ul className="space-y-1">
                    {suggestions.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.slug}`}
                          className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-1.5 text-xs transition hover:bg-surface-soft"
                          onClick={() => setSearchFocused(false)}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-accent">{product.name}</span>
                            <span className="block text-[10px] text-muted">{product.brand} · {product.sku}</span>
                          </span>
                          <span className="shrink-0 font-bold text-accent text-[11px]">{formatProductPrice(product)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 border-t border-line/60 pt-1.5">
                    <button
                      type="button"
                      onClick={submitSearch}
                      className="flex w-full items-center justify-between rounded-lg bg-surface-soft px-2.5 py-1.5 text-[11px] font-bold text-accent transition hover:bg-action hover:text-white"
                    >
                      <span>View all {searchAnalysis.totalMatches} results</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-3 text-center text-xs text-muted">
                  No matching products.
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="relative z-10 hidden border-t border-line lg:block" aria-label="Main navigation">
          <div className="site-shell relative flex h-12 items-center gap-4 xl:gap-7">
            {nav.slice(0, 2).map((item) => <NavLink key={item.href} {...item} active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)} />)}
            <details ref={categoryMenuRef} className="group h-full" onKeyDown={(event) => {
              if (event.key === "Escape") {
                categoryMenuRef.current?.removeAttribute("open");
                categoryMenuRef.current?.querySelector("summary")?.focus();
              }
            }}>
              <summary className="focus-ring flex h-full list-none items-center gap-1.5 rounded-md text-sm font-bold text-accent hover:text-action cursor-pointer">
                Brands <ChevronDown className="size-3.5 transition group-open:rotate-180" />
              </summary>
              <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-180px)] overflow-y-auto border border-line bg-surface px-8 py-8 shadow-xl">
                <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <p className="text-base font-extrabold text-content">Shop by Brand</p>
                    <p className="text-xs text-secondary">Official Bulk &amp; Retail Brand Collections with Direct Wholesale Rates</p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={() => categoryMenuRef.current?.removeAttribute("open")}
                    className="focus-ring rounded-xl bg-surface-soft border border-line px-4 py-2 text-xs font-bold text-accent transition hover:border-action hover:text-action"
                  >
                    Browse all brands →
                  </Link>
                </div>
                <BrandNavigation onNavigate={() => categoryMenuRef.current?.removeAttribute("open")} />
              </div>
            </details>
            {nav.slice(2).map((item) => <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />)}
            
          </div>
        </nav>
      </header>

      <dialog ref={mobileDialogRef} className="m-0 h-dvh max-h-none w-[min(88vw,380px)] max-w-none overflow-y-auto bg-canvas p-0 text-accent shadow-2xl backdrop:bg-action/55 backdrop:backdrop-blur-sm lg:hidden" aria-label="Navigation menu">
          <div className="min-h-full p-5 animate-slide-up">
            <div className="flex items-center justify-between gap-3"><BrandMark compact onNavigate={() => mobileDialogRef.current?.close()} /><button autoFocus type="button" onClick={() => mobileDialogRef.current?.close()} className="focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface" aria-label="Close menu"><X className="size-5" /></button></div>
            <form onSubmit={submitSearch} className="relative mt-7" role="search"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-secondary" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 outline-none focus:border-focus focus:ring-4 focus:ring-focus" /></form>
            <nav className="mt-6 grid gap-1" aria-label="Mobile navigation">
              {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => mobileDialogRef.current?.close()} className="rounded-xl px-3 py-3 text-[15px] font-bold text-accent hover:bg-surface-soft">{item.label}</Link>)}
            </nav>
            <p className="mb-2 mt-6 px-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Shop by Brand</p>
            <BrandNavigation mobile onNavigate={() => mobileDialogRef.current?.close()} />
            <p className="mb-2 mt-6 px-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Shop categories</p>
            <CategoryNavigation categories={navigationCategories} mobile onNavigate={() => mobileDialogRef.current?.close()} />
            {/* Mobile WhatsApp Quick Buttons */}
            <div className="mt-6 space-y-2">
              <p className="px-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Direct WhatsApp</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://wa.me/923006917385?text=Hi%20Zohair%2C%20I%20am%20inquiring%20about%20Pak%20Multilinks%20wholesale%20supplies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-xs font-bold text-accent transition hover:border-action hover:bg-surface-soft"
                >
                  <WhatsAppIcon className="size-3.5 text-action" />
                  <span>Zohair Ahmed</span>
                </a>
                <a
                  href="https://wa.me/923258166829?text=Hi%20Bilal%2C%20I%20am%20inquiring%20about%20Pak%20Multilinks%20wholesale%20supplies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-xs font-bold text-accent transition hover:border-action hover:bg-surface-soft"
                >
                  <WhatsAppIcon className="size-3.5 text-action" />
                  <span>Bilal Shah</span>
                </a>
              </div>
            </div>

            {/* Mobile Social Links in Circular Outline Buttons */}
            <div className="mt-4 flex items-center justify-center gap-3 py-3 border-y border-line">
              <a
                href="https://www.facebook.com/pakmultilinks"
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-full border border-line bg-transparent text-secondary transition hover:border-action hover:text-action hover:bg-surface-soft"
                aria-label="Facebook"
                title="Facebook"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://www.instagram.com/pakmultilinks"
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-full border border-line bg-transparent text-secondary transition hover:border-action hover:text-action hover:bg-surface-soft"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/pakmultilinks"
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-full border border-line bg-transparent text-secondary transition hover:border-action hover:text-action hover:bg-surface-soft"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href="https://wa.me/923006917385?text=Hi%20Pak%20Multilinks%2C%20I%20am%20inquiring%20about%20wholesale%20supplies"
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-full border border-line bg-transparent text-secondary transition hover:border-action hover:text-action hover:bg-surface-soft"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <WhatsAppIcon className="size-4" />
              </a>
            </div>
            <Link href="/request-quote" onClick={() => mobileDialogRef.current?.close()} className="commerce-button commerce-button-primary mt-4 flex min-h-12 items-center justify-center rounded-xl bg-action px-4 text-sm font-extrabold text-white">Request bulk quote</Link>
          </div>
      </dialog>

      <dialog ref={cartDialogRef} className="ml-auto mr-0 h-dvh max-h-none w-[min(92vw,430px)] max-w-none overflow-hidden bg-canvas p-0 text-accent shadow-2xl backdrop:bg-action/55 backdrop:backdrop-blur-sm" aria-labelledby="cart-drawer-title">
          <aside className="flex h-full flex-col bg-canvas">
            <div className="flex items-center justify-between border-b border-line p-5"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-accent">Wholesale selection</p><h2 id="cart-drawer-title" className="mt-1 text-xl font-extrabold">Bulk carton cart</h2></div><button autoFocus type="button" onClick={() => cartDialogRef.current?.close()} className="focus-ring grid size-10 place-items-center rounded-xl border border-line bg-surface" aria-label="Close cart"><X className="size-5" /></button></div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? <div className="grid min-h-72 place-items-center text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-full bg-surface-soft text-accent"><ShoppingBag className="size-7" /></span><p className="mt-4 font-extrabold">Your bulk cart is empty</p><p className="mt-1 text-sm text-secondary">Add wholesale cartons to get started.</p><Link href="/shop" onClick={() => cartDialogRef.current?.close()} className="mt-5 inline-flex rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-accent">Browse products</Link></div></div> : <ul className="space-y-3">{cart.map((item) => <li key={`${item.product.id}:${item.variantId || ""}`} className="rounded-2xl border border-line bg-surface p-4"><div className="flex justify-between gap-4"><div><Link href={`/product/${item.product.slug}${item.variantSku ? `?variant=${item.variantSku.toLowerCase()}` : ""}`} onClick={() => cartDialogRef.current?.close()} className="font-bold text-accent hover:text-accent">{item.product.name}{item.variantLabel ? <span className="ml-1 text-xs text-danger font-semibold">({item.variantLabel})</span> : ""}</Link><p className="mt-1 text-xs text-muted">{item.quantity} carton{item.quantity === 1 ? "" : "s"} · {item.variantPrice != null ? formatPrice(item.variantPrice) : formatProductPrice(item.product)}</p></div><button type="button" onClick={() => removeFromCart(item.product.id, item.variantId)} className="shrink-0 text-xs font-bold text-danger hover:underline">Remove</button></div><p className="mt-3 text-right font-extrabold">{item.product.priceOnRequest ? "Quoted after review" : formatPrice((item.variantPrice ?? getPrice(item.product)) * item.quantity)}</p></li>)}</ul>}
            </div>
            {cart.length > 0 && <div className="border-t border-line bg-surface p-5"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-secondary">Carton pricing</span><strong className="text-lg">{hasQuotePricing ? "Quote required" : formatPrice(subtotal)}</strong></div><p className="mb-4 text-xs leading-5 text-muted">Packing, availability, price and delivery are confirmed after review.</p><div className="grid grid-cols-2 gap-2"><Link href="/cart" onClick={() => cartDialogRef.current?.close()} className="commerce-button commerce-button-secondary flex min-h-12 items-center justify-center rounded-xl border border-line text-sm font-extrabold text-accent">View cartons</Link><Link href="/checkout" onClick={() => cartDialogRef.current?.close()} className="commerce-button commerce-button-primary flex min-h-12 items-center justify-center rounded-xl bg-action text-sm font-extrabold text-white">Bulk checkout</Link></div></div>}
          </aside>
      </dialog>
    </>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={`focus-ring relative flex h-full items-center rounded-md text-sm font-bold transition ${active ? "text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-action" : "text-accent hover:text-accent"}`}>{label}</Link>;
}
