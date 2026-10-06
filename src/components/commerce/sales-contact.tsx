"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { company } from "@/lib/company";
import type { Product } from "@/lib/types";
import { minimumCartons } from "@/lib/utils";

// Keep the established sales number as the fallback; honour the admin setting.
const defaultNumber = company.whatsapp || company.phoneHref.replace(/\D/g, "");
const SalesContactContext = createContext(defaultNumber);

export function SalesContactProvider({ children }: { children: ReactNode }) {
  const [number, setNumber] = useState(defaultNumber);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings/public", { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        const value = data?.settings?.whatsapp;
        const digits = typeof value === "string" ? value.replace(/\D/g, "") : "";
        if (/^\d{10,15}$/.test(digits)) setNumber(digits);
      }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return <SalesContactContext.Provider value={number}>{children}</SalesContactContext.Provider>;
}

export function SalesContactLink({ product, quantity, children = "WhatsApp to order", className = "" }: {
  product?: Product; quantity?: number; children?: ReactNode; className?: string;
}) {
  const number = useContext(SalesContactContext);
  const message = product
    ? `Hello Pak Multilinks, I’m interested in ${product.name} (SKU: ${product.sku}). Quantity: ${quantity ?? minimumCartons(product)} carton(s). Please confirm price, packing, availability and delivery.`
    : "Hello Pak Multilinks, I’d like to discuss products and bulk pricing. Please help me place an order.";
  return <a href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer"
    onClick={event => {
      // Resolve the storefront URL at click time, including on preview environments.
      const url = product ? new URL(`/product/${product.slug}`, window.location.origin).href : window.location.href;
      event.currentTarget.href = `https://wa.me/${number}?text=${encodeURIComponent(`${message}\n${url}`)}`;
    }}
    className={className} aria-label={product ? `WhatsApp about ${product.name}` : undefined}>
    <MessageCircle className="size-4 shrink-0" aria-hidden="true" />{children}
  </a>;
}
