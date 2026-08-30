"use client";

import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@/components/providers/store-provider";
import { categories, products } from "@/lib/catalog";
import { company } from "@/lib/company";
import type { Category, Product } from "@/lib/types";
import { formatPrice, formatProductPrice } from "@/lib/utils";

import { BrandMark } from "./brand-mark";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/corporate-orders", label: "Corporate Orders" },
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
  const [runtimeDetails, setRuntimeDetails] = useState({
    announcement: "Corporate hygiene supplies · Lahore",
  });
  const [searchProducts, setSearchProducts] = useState<Product[]>(products);
  const [navigationCategories, setNavigationCategories] = useState<Category[]>(categories);
  const searchWrap = useRef<HTMLDivElement>(null);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const cartDialogRef = useRef<HTMLDialogElement>(null);
  const categoryMenuRef = useRef<HTMLDetailsElement>(null);

  const suggestions = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (clean.length < 2) return [];
    return searchProducts.filter((item) => [item.name, item.sku, item.category, item.brand].some((value) => value.toLowerCase().includes(clean))).slice(0, 5);
  }, [query, searchProducts]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!searchWrap.current?.contains(event.target as Node)) setSearchFocused(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
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
          if (validProducts.length) setSearchProducts(validProducts);
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
          if (validCategories.length) setNavigationCategories(validCategories);
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings/public", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (!payload || typeof payload !== "object" || !("settings" in payload)) return;
        const settings = (payload as { settings?: unknown }).settings;
        if (!settings || typeof settings !== "object") return;
        const values = settings as { announcement?: unknown };
        setRuntimeDetails({
          announcement:
            typeof values.announcement === "string" && values.announcement.trim()
              ? values.announcement.trim()
              : "Corporate hygiene supplies · Lahore",
        });
      })
      .catch(() => undefined);
    return () => controller.abort();
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
      <a href="#main-content" className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#17643a] shadow-xl focus:translate-y-0">Skip to content</a>
      <header className="sticky top-0 z-50 border-b border-[#dce8df] bg-[#fbfaf5]/95 backdrop-blur-xl">
        <div className="bg-[#114b2f] text-white">
          <div className="site-shell flex min-h-8 items-center justify-between gap-4 text-[11px] font-semibold sm:text-xs">
            <p className="truncate">{runtimeDetails.announcement}</p>
            <a className="shrink-0 text-[#d5f0de] hover:text-white" href={`tel:${company.phoneHref}`}><span className="hidden sm:inline">Zohair Ahmed · </span>Call {company.phone}</a>
          </div>
        </div>

        <div className="site-shell flex h-[86px] items-center gap-3 lg:gap-7">
          <button type="button" className="focus-ring -ml-2 grid size-11 place-items-center rounded-xl text-[#173c29] lg:hidden" onClick={() => mobileDialogRef.current?.showModal()} aria-label="Open navigation menu" aria-haspopup="dialog">
            <Menu className="size-6" />
          </button>
          <BrandMark />

          <div ref={searchWrap} className="relative ml-auto hidden min-w-0 max-w-[430px] flex-1 md:block">
            <form onSubmit={submitSearch} role="search">
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6d7c72]" />
              <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchFocused(true)} placeholder="Search products, SKU or category" autoComplete="off" className="h-11 w-full rounded-2xl border border-[#d8e4db] bg-white pl-11 pr-4 text-sm text-[#173c29] outline-none transition placeholder:text-[#8b9890] focus:border-[#4c9b69] focus:ring-4 focus:ring-[#dff2e5]" />
            </form>
            {searchFocused && suggestions.length > 0 && (
              <nav className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-[#dce8df] bg-white p-2 shadow-[0_18px_50px_rgba(19,58,37,.14)]" aria-label="Suggested products">
                <ul>{suggestions.map((product) => (
                  <li key={product.id}><Link href={`/product/${product.slug}`} className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-sm hover:bg-[#f1f7f2]" onClick={() => setSearchFocused(false)}>
                    <span><span className="block font-bold text-[#173c29]">{product.name}</span><span className="mt-0.5 block text-xs text-[#708078]">{product.category} · {product.sku}</span></span>
                    <span className="shrink-0 font-bold text-[#17643a]">{formatProductPrice(product)}</span>
                  </Link></li>
                ))}</ul>
              </nav>
            )}
          </div>

          <Link href="/account" className="focus-ring ml-auto grid size-11 shrink-0 place-items-center rounded-lg border border-[#d8e4db] bg-white text-[#234b34] transition hover:border-[#88b79a] hover:bg-[#f4faf6] md:ml-0" aria-label="Your account"><UserRound className="size-5" /></Link>
          <button type="button" onClick={() => cartDialogRef.current?.showModal()} className="focus-ring relative grid size-11 shrink-0 place-items-center rounded-xl bg-[#17643a] text-white transition hover:bg-[#0f512e]" aria-label={`Open bulk cart with ${itemCount} cartons`} aria-haspopup="dialog">
            <ShoppingBag className="size-5" />
            {itemCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-[#fbfaf5] bg-[#f3b941] px-1 text-[10px] font-black leading-4 text-[#173328]">{itemCount > 99 ? "99+" : itemCount}</span>}
          </button>
        </div>

        <nav className="hidden border-t border-[#e6ede8] lg:block" aria-label="Main navigation">
          <div className="site-shell flex h-12 items-center gap-8">
            {nav.slice(0, 2).map((item) => <NavLink key={item.href} {...item} active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)} />)}
            <details ref={categoryMenuRef} className="group relative h-full">
              <summary className="focus-ring flex h-full list-none items-center gap-1 rounded-md text-sm font-bold text-[#355c45] hover:text-[#17643a]">Categories <ChevronDown className="size-3.5 transition group-open:rotate-180" /></summary>
              <div className="absolute left-0 top-[calc(100%+1px)] grid w-[580px] grid-cols-2 gap-1 rounded-b-2xl border border-t-0 border-[#dce8df] bg-white p-3 shadow-[0_20px_50px_rgba(19,58,37,.14)]">
                {navigationCategories.map((category) => <Link key={category.slug} href={`/shop/${category.slug}`} onClick={() => categoryMenuRef.current?.removeAttribute("open")} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#355c45] hover:bg-[#eef8f1] hover:text-[#17643a]">{category.name}</Link>)}
              </div>
            </details>
            {nav.slice(2).map((item) => <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />)}
            <Link href="/request-quote" className="commerce-button commerce-button-secondary ml-auto inline-flex min-h-0 items-center px-4 py-2">Get a quote</Link>
          </div>
        </nav>
      </header>

      <dialog ref={mobileDialogRef} className="m-0 h-dvh max-h-none w-[min(88vw,380px)] max-w-none overflow-y-auto bg-[#fbfaf5] p-0 text-[#173328] shadow-2xl backdrop:bg-[#102a1d]/55 backdrop:backdrop-blur-sm lg:hidden" aria-label="Navigation menu">
          <div className="min-h-full p-5 animate-slide-up">
            <div className="flex items-center justify-between gap-3"><BrandMark compact onNavigate={() => mobileDialogRef.current?.close()} /><button autoFocus type="button" onClick={() => mobileDialogRef.current?.close()} className="focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-[#dce8df] bg-white" aria-label="Close menu"><X className="size-5" /></button></div>
            <form onSubmit={submitSearch} className="relative mt-7" role="search"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#66756c]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" className="h-12 w-full rounded-2xl border border-[#dce8df] bg-white pl-11 pr-4 outline-none focus:border-[#4c9b69] focus:ring-4 focus:ring-[#dff2e5]" /></form>
            <nav className="mt-6 grid gap-1" aria-label="Mobile navigation">
              {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => mobileDialogRef.current?.close()} className="rounded-xl px-3 py-3 text-[15px] font-bold text-[#294d36] hover:bg-[#eaf6ed]">{item.label}</Link>)}
            </nav>
            <p className="mb-2 mt-6 px-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#779083]">Shop categories</p>
            <div className="grid grid-cols-2 gap-1">{navigationCategories.map((category) => <Link key={category.slug} href={`/shop/${category.slug}`} onClick={() => mobileDialogRef.current?.close()} className="rounded-xl px-3 py-2 text-sm font-semibold text-[#4d6b59] hover:bg-[#eaf6ed]">{category.name}</Link>)}</div>
            <Link href="/request-quote" onClick={() => mobileDialogRef.current?.close()} className="mt-7 flex min-h-12 items-center justify-center rounded-xl bg-[#17643a] px-4 text-sm font-extrabold text-white">Request bulk quote</Link>
          </div>
      </dialog>

      <dialog ref={cartDialogRef} className="ml-auto mr-0 h-dvh max-h-none w-[min(92vw,430px)] max-w-none overflow-hidden bg-[#fbfaf5] p-0 text-[#173328] shadow-2xl backdrop:bg-[#102a1d]/55 backdrop:backdrop-blur-sm" aria-labelledby="cart-drawer-title">
          <aside className="flex h-full flex-col bg-[#fbfaf5]">
            <div className="flex items-center justify-between border-b border-[#dce8df] p-5"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#568069]">Wholesale selection</p><h2 id="cart-drawer-title" className="mt-1 text-xl font-extrabold">Bulk carton cart</h2></div><button autoFocus type="button" onClick={() => cartDialogRef.current?.close()} className="focus-ring grid size-10 place-items-center rounded-xl border border-[#dce8df] bg-white" aria-label="Close cart"><X className="size-5" /></button></div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? <div className="grid min-h-72 place-items-center text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e7f4eb] text-[#17643a]"><ShoppingBag className="size-7" /></span><p className="mt-4 font-extrabold">Your bulk cart is empty</p><p className="mt-1 text-sm text-[#6c7b72]">Add wholesale cartons to get started.</p><Link href="/shop" onClick={() => cartDialogRef.current?.close()} className="mt-5 inline-flex rounded-xl border border-[#bfd3c5] px-4 py-2.5 text-sm font-bold text-[#17643a]">Browse products</Link></div></div> : <ul className="space-y-3">{cart.map((item) => <li key={item.product.id} className="rounded-2xl border border-[#dce8df] bg-white p-4"><div className="flex justify-between gap-4"><div><Link href={`/product/${item.product.slug}`} onClick={() => cartDialogRef.current?.close()} className="font-bold text-[#173c29] hover:text-[#17643a]">{item.product.name}</Link><p className="mt-1 text-xs text-[#718078]">{item.quantity} carton{item.quantity === 1 ? "" : "s"} · {formatProductPrice(item.product)}</p></div><button type="button" onClick={() => removeFromCart(item.product.id)} className="shrink-0 text-xs font-bold text-[#9c3f39] hover:underline">Remove</button></div><p className="mt-3 text-right font-extrabold">{item.product.priceOnRequest ? "Quoted after review" : formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}</p></li>)}</ul>}
            </div>
            {cart.length > 0 && <div className="border-t border-[#dce8df] bg-white p-5"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-[#627168]">Carton pricing</span><strong className="text-lg">{hasQuotePricing ? "Quote required" : formatPrice(subtotal)}</strong></div><p className="mb-4 text-xs leading-5 text-[#718078]">Packing, availability, price and delivery are confirmed after review.</p><div className="grid grid-cols-2 gap-2"><Link href="/cart" onClick={() => cartDialogRef.current?.close()} className="flex min-h-12 items-center justify-center rounded-xl border border-[#bfd3c5] text-sm font-extrabold text-[#17643a]">View cartons</Link><Link href="/checkout" onClick={() => cartDialogRef.current?.close()} className="flex min-h-12 items-center justify-center rounded-xl bg-[#17643a] text-sm font-extrabold text-white">Bulk checkout</Link></div></div>}
          </aside>
      </dialog>
    </>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={`focus-ring relative flex h-full items-center rounded-md text-sm font-bold transition ${active ? "text-[#17643a] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#17643a]" : "text-[#355c45] hover:text-[#17643a]"}`}>{label}</Link>;
}
