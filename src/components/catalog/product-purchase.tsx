"use client";

import { Check, FileText, Minus, Plus, ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useStore } from "@/components/providers/store-provider";
import type { Product } from "@/lib/types";
import { cartonPacking, formatPrice, formatProductPrice, minimumCartons } from "@/lib/utils";
import { trackStorefrontEvent } from "@/lib/analytics";

import { StockStatus } from "./stock-status";

type ProductPurchaseProps = {
  product: Product;
};

export function ProductPurchase({ product }: ProductPurchaseProps) {
  const router = useRouter();
  const { addToCart } = useStore();
  const minimum = minimumCartons(product);
  const [quantity, setQuantity] = useState(minimum);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAdded = useCallback(() => {
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 3000);
  }, []);

  useEffect(() => {
    return () => { if (addedTimer.current) clearTimeout(addedTimer.current); };
  }, []);
  const hasSale = product.salePrice != null && product.salePrice < product.price;
  const isUnavailable = product.stock < minimum && !product.allowBackorder;
  const maxQuantity = product.allowBackorder ? 10_000 : Math.max(product.stock, minimum);

  function setSafeQuantity(nextQuantity: number) {
    setQuantity(Math.min(maxQuantity, Math.max(minimum, nextQuantity)));
  }

  function handleAdd() {
    if (isUnavailable) return;
    addToCart(product, quantity);
    setAdded(true);
    resetAdded();
  }

  function handleBuyNow() {
    if (isUnavailable) return;
    trackStorefrontEvent("begin_checkout", { currency: "PKR", value: product.priceOnRequest ? undefined : (product.salePrice ?? product.price) * quantity, item_id: product.sku, item_name: product.name, quantity });
    addToCart(product, quantity);
    router.push("/checkout");
  }

  return (
    <div className="rounded-3xl border border-[#dce8df] bg-white p-5 shadow-[0_16px_50px_rgba(21,65,42,0.08)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-extrabold tracking-[-0.03em] text-[#173c29]">
            {formatProductPrice(product)}
          </p>
          {hasSale && (
            <p className="mt-1 text-sm text-[#76847b]">
              <span className="line-through">{formatPrice(product.price)}</span>{" "}
              <span className="ml-1 font-bold text-[#17643a]">Sale price</span>
            </p>
          )}
        </div>
        <StockStatus
          stock={product.stock}
          lowStockThreshold={product.lowStockThreshold}
          allowBackorder={product.allowBackorder}
          minimumOrderCartons={minimum}
          showQuantity
        />
      </div>

      <div className="my-6 h-px bg-[#e5ece7]" />

      <div className="grid gap-2 rounded-2xl bg-[#f1f7f0] p-4 text-sm text-[#365643] sm:grid-cols-2"><p><strong>Supply unit:</strong> Carton</p><p><strong>Packing:</strong> {cartonPacking(product)}</p><p><strong>Minimum order:</strong> {minimum} carton{minimum === 1 ? "" : "s"}</p><p><strong>Selected:</strong> {product.unitsPerCarton > 0 ? `${quantity * product.unitsPerCarton} pieces in ` : ""}{quantity} carton{quantity === 1 ? "" : "s"}</p></div>

      <div className="my-6 h-px bg-[#e5ece7]" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label htmlFor="product-quantity" className="mb-2 block text-sm font-bold text-[#284f38]">
            Cartons
          </label>
          <div className="inline-grid grid-cols-[44px_56px_44px] overflow-hidden rounded-xl border border-[#c9d8cd] bg-white">
            <button
              type="button"
              onClick={() => setSafeQuantity(quantity - 1)}
              disabled={quantity <= minimum || isUnavailable}
              className="inline-flex min-h-11 items-center justify-center text-[#315b41] transition hover:bg-[#eff6f1] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#17643a] disabled:cursor-not-allowed disabled:text-[#a6afa9]"
              aria-label="Decrease cartons"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <input
              id="product-quantity"
              type="number"
              min={minimum}
              max={maxQuantity}
              value={quantity}
              disabled={isUnavailable}
              onChange={(event) => setSafeQuantity(Number(event.target.value) || 1)}
              className="min-h-11 w-full border-x border-[#d8e2db] text-center text-sm font-bold text-[#173c29] outline-none focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#17643a] disabled:bg-[#f5f6f5]"
            />
            <button
              type="button"
              onClick={() => setSafeQuantity(quantity + 1)}
              disabled={quantity >= maxQuantity || isUnavailable}
              className="inline-flex min-h-11 items-center justify-center text-[#315b41] transition hover:bg-[#eff6f1] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#17643a] disabled:cursor-not-allowed disabled:text-[#a6afa9]"
              aria-label="Increase cartons"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={isUnavailable}
            className="commerce-button commerce-button-secondary inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#a8b3ac] disabled:text-[#8b9690]"
          >
            {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
            {isUnavailable ? "Unavailable" : added ? "Added to cart" : "Add to cart"}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isUnavailable}
            className="commerce-button commerce-button-primary inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#a8b3ac] disabled:bg-[#a8b3ac]"
          >
            Buy now
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {added ? `${quantity} cartons of ${product.name} added to cart` : ""}
      </p>

      {product.bulkPricing && (
        <div className="mt-6 rounded-2xl border border-[#d5e5d9] bg-[#f1f7f0] p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#17643a] shadow-sm">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-[#244b35]">Ordering for your business?</p>
              <p className="mt-1 text-sm leading-6 text-[#607166]">
                Ask for volume pricing and a supply plan matched to your requirements.
              </p>
              <Link
                href={`/request-quote?product=${encodeURIComponent(product.slug)}`}
                className="mt-3 inline-flex rounded-sm text-sm font-extrabold text-[#17643a] underline decoration-[#9bbfa5] underline-offset-4 hover:decoration-[#17643a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]"
              >
                Request a bulk quotation
              </Link>
            </div>
          </div>
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#69786f]">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#32754b]" aria-hidden="true" />
        Stock is checked before order confirmation. Delivery charges and timing are confirmed
        during checkout.
      </p>
    </div>
  );
}
