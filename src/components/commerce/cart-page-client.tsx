"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageOpen, ShoppingBag, Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/commerce/quantity-selector";
import { WhatsAppOrderLink } from "@/components/commerce/whatsapp-order-link";
import { useStore } from "@/components/providers/store-provider";
import { getPrice } from "@/lib/catalog";
import { cartonPacking, formatPrice, formatProductPrice, minimumCartons } from "@/lib/utils";
import { ProductMediaPlaceholder } from "@/components/catalog/product-media-placeholder";

export function CartPageClient() {
  const { cart, itemCount, subtotal, updateQuantity, removeFromCart } = useStore();
  const hasQuotePricing = cart.some(({ product }) => product.priceOnRequest);

  if (cart.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <PackageOpen aria-hidden="true" className="mx-auto size-12 text-emerald-700" />
        <h2 className="mt-5 text-2xl font-bold text-slate-950">Your cart is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          Browse our wholesale supplies, then add the cartons you need.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
        >
          Shop products <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
      <section aria-labelledby="cart-items-heading" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-7">
          <h2 id="cart-items-heading" className="font-semibold text-slate-950">
            {itemCount} {itemCount === 1 ? "carton" : "cartons"}
          </h2>
        </div>
        <ul className="divide-y divide-slate-200">
          {cart.map(({ product, quantity }) => {
            const max = product.allowBackorder ? undefined : product.stock;
            const atLimit = typeof max === "number" && quantity >= max;
            return (
              <li key={product.id} className="p-5 sm:p-7">
                <div className="flex gap-4 sm:gap-6">
                  <Link href={`/product/${product.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-emerald-50 sm:size-32">
                    {product.image ? <Image src={product.image} alt={product.imageAlt || product.name} fill sizes="128px" className="object-contain p-3" /> : <ProductMediaPlaceholder compact />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{product.category}</p>
                    <Link href={`/product/${product.slug}`} className="mt-1 block font-bold text-slate-950 hover:text-emerald-800">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">SKU: {product.sku}</p>
                    <p className="mt-2 text-xs font-semibold text-emerald-800">{cartonPacking(product)}</p>
                    <p className="mt-3 font-semibold text-slate-950">{formatProductPrice(product)}</p>
                  </div>
                  <p className="hidden text-right font-bold text-slate-950 sm:block">
                    {product.priceOnRequest ? "Quoted after review" : formatPrice(getPrice(product) * quantity)}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pl-0 sm:pl-[9.5rem]">
                  <div>
                    <QuantitySelector
                      value={quantity}
                      min={minimumCartons(product)}
                      max={max}
                      label={`${product.name} cartons`}
                      onChange={(next) => updateQuantity(product.id, next)}
                    />
                    {atLimit && !product.allowBackorder ? (
                      <p className="mt-2 text-xs font-medium text-amber-700" role="status">
                        Maximum available stock ({product.stock} cartons) reached.
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    aria-label={`Remove ${product.name} from cart`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" /> Remove
                  </button>
                  <p className="w-full text-right font-bold text-slate-950 sm:hidden">
                    {product.priceOnRequest ? "Quoted after review" : formatPrice(getPrice(product) * quantity)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
            <ShoppingBag aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-950">Order summary</h2>
        </div>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-4 text-slate-600">
            <dt>Priced-carton subtotal</dt>
            <dd className="font-semibold text-slate-950">{hasQuotePricing ? "Final quote required" : formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-200 pb-4 text-slate-600">
            <dt>Delivery</dt>
            <dd className="max-w-44 text-right font-medium text-amber-700">Confirmed after order review</dd>
          </div>
          <div className="flex justify-between gap-4 text-base">
            <dt className="font-bold text-slate-950">Due before delivery</dt>
            <dd className="font-bold text-slate-950">To be confirmed</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          No delivery fee has been added. Our team will confirm stock, delivery availability, charges, and the final payable total after review.
        </p>
        <Link href="/checkout" className="commerce-button commerce-button-primary mt-6 inline-flex w-full items-center justify-center gap-2">
          Continue bulk order <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <div className="mt-3"><WhatsAppOrderLink /></div>
        <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-emerald-800 hover:underline">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
