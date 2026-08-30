"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";

export function WhatsAppOrderLink() {
  const { cart, subtotal } = useStore();
  const [whatsapp, setWhatsapp] = useState(company.whatsapp);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings/public", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (!payload || typeof payload !== "object" || !("settings" in payload)) return;
        const settings = (payload as { settings?: unknown }).settings;
        if (!settings || typeof settings !== "object") return;
        const value = (settings as { whatsapp?: unknown }).whatsapp;
        const digits = typeof value === "string" ? value.replace(/\D/g, "") : "";
        setWhatsapp(/^\d{10,15}$/.test(digits) ? digits : "");
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  if (!whatsapp || cart.length === 0) return null;

  const lines = cart.map(
    ({ product, quantity }) => `- ${product.name}: ${quantity} carton${quantity === 1 ? "" : "s"}`,
  );
  const hasQuotePricing = cart.some(({ product }) => product.priceOnRequest);
  const message = [
    "Hello Pak Multilinks Hygiene, I have an order inquiry:",
    "",
    ...lines,
    "",
    hasQuotePricing ? "Pricing: wholesale quotation required" : `Carton subtotal: ${formatPrice(subtotal)}`,
    "Please confirm carton packing, availability, price and delivery charges.",
  ].join("\n");
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-700 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
    >
      <MessageCircle aria-hidden="true" className="size-4" />
      Ask about this order on WhatsApp
    </a>
  );
}
