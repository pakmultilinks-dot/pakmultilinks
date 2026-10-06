"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MessageCircle, Phone, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { company } from "@/lib/company";
import { buildDirectWhatsAppUrl } from "@/lib/category-meta";

export function MobileSalesBar() {
  const pathname = usePathname();
  const { itemCount } = useStore();

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/shop");
  const isCart = pathname === "/cart";

  return (
    <nav
      aria-label="Mobile quick actions"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[#d8e5dd] bg-white/95 px-1 py-1.5 shadow-[0_-6px_25px_rgba(15,40,25,0.08)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))" }}
    >
      {/* 1. Home */}
      <Link
        href="/"
        aria-current={isHome ? "page" : undefined}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
          isHome ? "text-[#17643a]" : "text-[#5e7166] hover:text-[#17643a]"
        }`}
      >
        <Home className={`size-5 ${isHome ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
        <span className="mt-0.5">Home</span>
      </Link>

      {/* 2. Catalog */}
      <Link
        href="/shop"
        aria-current={isShop ? "page" : undefined}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
          isShop ? "text-[#17643a]" : "text-[#5e7166] hover:text-[#17643a]"
        }`}
      >
        <LayoutGrid className={`size-5 ${isShop ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
        <span className="mt-0.5">Catalog</span>
      </Link>

      {/* 3. High-Converting WhatsApp Action Button (Centerpiece) */}
      <a
        href={buildDirectWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-2 text-xs font-black text-white shadow-md transition active:scale-95 hover:bg-[#1ebc56]"
        aria-label="Direct WhatsApp Order"
      >
        <MessageCircle className="size-4 shrink-0" />
        <span>WhatsApp</span>
      </a>

      {/* 4. Cart */}
      <Link
        href="/cart"
        aria-current={isCart ? "page" : undefined}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
          isCart ? "text-[#17643a]" : "text-[#5e7166] hover:text-[#17643a]"
        }`}
      >
        <div className="relative">
          <ShoppingBag className={`size-5 ${isCart ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-[#e63946] px-1 text-[9px] font-extrabold leading-3 text-white">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </div>
        <span className="mt-0.5">Cart</span>
      </Link>

      {/* 5. Call */}
      <a
        href={`tel:${company.phoneHref}`}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold text-[#5e7166] transition active:scale-95 hover:text-[#17643a]"
        aria-label="Call Sales"
      >
        <Phone className="size-5 stroke-[1.75]" />
        <span className="mt-0.5">Call</span>
      </a>
    </nav>
  );
}
