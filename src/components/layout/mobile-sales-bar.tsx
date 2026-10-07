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
  const isShop = pathname === "/shop" || pathname.startsWith("/shop/") || pathname.startsWith("/product/") || pathname === "/search";
  const isCart = pathname === "/cart" || pathname === "/checkout" || pathname === "/order-confirmation";

  return (
    <nav aria-label="Mobile quick actions" className="mobile-bottom-nav md:hidden">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className="mobile-nav-item focus-ring">
        <span className="mobile-nav-icon"><Home size={21} strokeWidth={1.8} aria-hidden="true" /></span><span>Home</span>
      </Link>
      <Link href="/shop" aria-current={isShop ? "page" : undefined} className="mobile-nav-item focus-ring">
        <span className="mobile-nav-icon"><LayoutGrid size={21} strokeWidth={1.8} aria-hidden="true" /></span><span>Catalog</span>
      </Link>
      <a href={buildDirectWhatsAppUrl()} target="_blank" rel="noreferrer" className="mobile-nav-item mobile-nav-whatsapp focus-ring" aria-label="Chat on WhatsApp">
        <span className="mobile-nav-icon"><MessageCircle size={22} strokeWidth={1.8} aria-hidden="true" /></span><span>WhatsApp</span>
      </a>
      <Link href="/cart" aria-current={isCart ? "page" : undefined} className="mobile-nav-item focus-ring" aria-label={`Cart, ${itemCount} cartons`}>
        <span className="mobile-nav-icon"><ShoppingBag size={21} strokeWidth={1.8} aria-hidden="true" />{itemCount > 0 && <span className="mobile-cart-badge">{itemCount > 99 ? "99+" : itemCount}</span>}</span><span>Cart</span>
      </Link>
      <a href={`tel:${company.phoneHref}`} className="mobile-nav-item focus-ring" aria-label="Call sales">
        <span className="mobile-nav-icon"><Phone size={21} strokeWidth={1.8} aria-hidden="true" /></span><span>Call</span>
      </a>
    </nav>
  );
}
