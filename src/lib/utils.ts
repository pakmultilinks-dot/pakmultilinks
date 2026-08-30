import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatProductPrice(product: Product) {
  return product.priceOnRequest ? "Price on request" : `${formatPrice(product.salePrice ?? product.price)} / carton`;
}

export function minimumCartons(product: Product) {
  return Math.max(1, Math.floor(product.minimumOrderCartons || 1));
}

export function cartonPacking(product: Product) {
  return product.unitsPerCarton > 0
    ? `${product.unitsPerCarton.toLocaleString("en-PK")} pieces / carton`
    : "Carton packing confirmed on request";
}

export function createReference(prefix: string) {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${date}-${random}`;
}
