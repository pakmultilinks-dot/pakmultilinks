"use client";

import { Check, FileText, Minus, Plus, ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useStore } from "@/components/providers/store-provider";
import type { Product } from "@/lib/types";
import {
  cartonPacking,
  formatPiecePrice,
  formatPrice,
  formatProductPrice,
  getPerPiecePrice,
  MINIMUM_ORDER_AMOUNT,
  minimumCartons,
} from "@/lib/utils";
import { trackStorefrontEvent } from "@/lib/analytics";

import { StockStatus } from "./stock-status";
import { SalesContactLink } from "@/components/commerce/sales-contact";

import { isProductAvailable, getEffectivePrice } from "@/lib/pricing";

type ProductPurchaseProps = {
  product: Product;
};

export function ProductPurchase({ product }: ProductPurchaseProps) {
  const router = useRouter();
  const { addToCart } = useStore();

  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() => {
    return variants[0]?.id || null;
  });

  // Sync with ?variant= query parameter on mount if present
  useEffect(() => {
    if (typeof window === "undefined" || variants.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const paramVariant = params.get("variant");
    if (!paramVariant) return;
    const match = variants.find(
      (v) =>
        v.id === paramVariant ||
        v.sku.toLowerCase() === paramVariant.toLowerCase() ||
        v.label.toLowerCase().replace(/[^a-z0-9]+/g, "-") === paramVariant.toLowerCase()
    );
    if (match) {
      setSelectedVariantId(match.id);
    }
  }, [variants]);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || (variants.length > 0 ? variants[0] : null);

  const minimum = activeVariant?.minimumOrderCartons ?? minimumCartons(product);
  const [quantity, setQuantity] = useState(minimum);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unitsPerCarton = activeVariant?.unitsPerCarton ?? product.unitsPerCarton;
  // Carton packing off (unitsPerCarton <= 1): price is per piece/unit only.
  const cartonMode = unitsPerCarton > 1;
  const cartonPrice = activeVariant ? activeVariant.price : getEffectivePrice(product.price, product.salePrice);
  const perPiece = activeVariant && activeVariant.unitsPerCarton && activeVariant.unitsPerCarton > 0
    ? Math.round(activeVariant.price / activeVariant.unitsPerCarton)
    : getPerPiecePrice(product);

  const stock = activeVariant ? activeVariant.stock : product.stock;
  const isOutOfStock = stock <= 0 && !product.allowBackorder;
  const isUnavailable = !isProductAvailable(product) || isOutOfStock;

  const resetAdded = useCallback(() => {
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 3000);
  }, []);

  useEffect(() => {
    return () => { if (addedTimer.current) clearTimeout(addedTimer.current); };
  }, []);

  const hasSale = product.salePrice != null && product.salePrice > 0 && product.salePrice < product.price;
  const maxQuantity = 10_000;
  const itemTotal = cartonPrice * quantity;
  const belowMinOrder = !product.priceOnRequest && itemTotal < MINIMUM_ORDER_AMOUNT;

  function selectVariant(v: (typeof variants)[number]) {
    setSelectedVariantId(v.id);
    const vMin = v.minimumOrderCartons ?? 1;
    if (quantity < vMin) setQuantity(vMin);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("variant", v.sku.toLowerCase());
      window.history.replaceState({}, "", url.toString());
    }
  }

  function setSafeQuantity(nextQuantity: number) {
    setQuantity(Math.min(maxQuantity, Math.max(minimum, nextQuantity)));
  }

  function handleAdd() {
    if (isUnavailable) return;
    addToCart(product, quantity, activeVariant || undefined);
    setAdded(true);
    resetAdded();
  }

  function handleBuyNow() {
    if (isUnavailable) return;
    addToCart(product, quantity, activeVariant || undefined);
    if (!product.priceOnRequest && itemTotal < MINIMUM_ORDER_AMOUNT) {
      router.push("/cart");
      return;
    }
    trackStorefrontEvent("begin_checkout", {
      currency: "PKR",
      value: product.priceOnRequest ? undefined : cartonPrice * quantity,
      item_id: activeVariant ? activeVariant.sku : product.sku,
      item_name: activeVariant ? `${product.name} (${activeVariant.label})` : product.name,
      quantity,
    });
    router.push("/checkout");
  }

  return (
    <div className="product-purchase rounded-3xl border border-line bg-surface p-5 shadow-[0_16px_50px_rgba(21,65,42,0.08)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {product.priceOnRequest ? (
            <div>
              <span className="inline-flex items-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-base font-extrabold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                Price on request
              </span>
              <p className="mt-1.5 text-xs text-secondary font-medium">
                Bulk institutional rate confirmed via official quotation
              </p>
            </div>
          ) : (
            <>
              <p className="text-3xl font-extrabold tracking-[-0.03em] text-[#dc2626]">
                {formatPrice(cartonPrice)}
                <span className="ml-1.5 text-sm font-semibold text-muted">
                  {cartonMode ? "/ carton" : "/ piece"}
                </span>
              </p>
              {perPiece != null && cartonMode && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-100/90 px-3 py-1 text-sm font-bold text-red-950 shadow-2xs dark:border-red-600 dark:bg-red-950 dark:text-red-100">
                  <span className="font-semibold text-red-800 dark:text-red-300">Unit / Per piece:</span>
                  <span className="text-base font-black text-red-950 dark:text-white">{formatPiecePrice(perPiece)}</span>
                </div>
              )}
              {hasSale && !activeVariant && (
                <p className="mt-1 text-sm text-muted">
                  <span className="line-through font-semibold">{formatPrice(product.price)}</span>{" "}
                  <span className="ml-1 font-bold text-[#dc2626]">Wholesale rate</span>
                </p>
              )}
            </>
          )}
        </div>
        <StockStatus
          stock={stock}
          lowStockThreshold={product.lowStockThreshold}
          allowBackorder={product.allowBackorder}
          minimumOrderCartons={minimum}
          showQuantity
        />
      </div>

      {/* Variant Selector Pills if product has variants */}
      {variants.length > 0 && (
        <div className="mt-5 border-t border-line/60 pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Select Size / Packing ({variants.length} available)
            </span>
            {activeVariant && (
              <span className="text-xs font-semibold text-secondary">
                SKU: <strong className="font-mono text-accent">{activeVariant.sku}</strong>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === activeVariant?.id;
              const vPerPiece = v.unitsPerCarton && v.unitsPerCarton > 0 ? Math.round(v.price / v.unitsPerCarton) : null;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVariant(v)}
                  className={`group relative flex flex-col items-start rounded-xl px-3.5 py-2 text-left transition ${
                    isSelected
                      ? "border-2 border-[#dc2626] bg-red-50/80 dark:bg-red-950/40 text-accent shadow-xs scale-[1.02]"
                      : "border border-line bg-surface-soft hover:border-focus/60 text-secondary hover:text-accent"
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isSelected ? "text-[#dc2626]" : ""}`}>
                    {v.label}
                  </span>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-accent">
                      {formatPrice(v.price)}
                    </span>
                    {vPerPiece != null && (
                      <span className="text-[10px] text-muted">
                        ({formatPrice(vPerPiece)}/pc)
                      </span>
                    )}
                  </div>
                  {v.stock <= 0 && !product.allowBackorder && (
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-danger">
                      Out of stock
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="my-6 h-px bg-surface-soft" />

      <div className="grid gap-2 rounded-2xl bg-surface-soft p-4 text-sm text-accent sm:grid-cols-2">
        <p><strong>Supply unit:</strong> {cartonMode ? "Carton" : "Piece / Unit"}</p>
        <p><strong>Packing:</strong> {cartonMode ? `${unitsPerCarton} units per carton` : "Single unit"}</p>
        {perPiece != null && cartonMode && <p><strong>Per piece rate:</strong> {formatPiecePrice(perPiece)}</p>}
        <p><strong>Minimum order:</strong> {cartonMode ? `${minimum} carton${minimum === 1 ? "" : "s"}` : `${minimum} piece${minimum === 1 ? "" : "s"}`}</p>
        <p><strong>Selected:</strong> {cartonMode ? `${quantity * unitsPerCarton} pieces in ${quantity} carton${quantity === 1 ? "" : "s"}` : `${quantity} piece${quantity === 1 ? "" : "s"}`}</p>
        {!product.priceOnRequest && <p><strong>Order condition:</strong> Min. PKR 5,000</p>}
      </div>

      {belowMinOrder && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-xs text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-bold">⚠️ Wholesale Order Rule: PKR 5,000 Minimum</p>
          <p className="mt-0.5">
            Current item total: <strong>{formatPrice(itemTotal)}</strong>. Website par kam az kam PKR 5,000 ka order place kia ja sakta hai. {cartonMode ? "Cartons" : "Quantity"} barhain ya mazeed products shamil karein.
          </p>
        </div>
      )}

      <div className="my-6 h-px bg-surface-soft" />

      {product.priceOnRequest ? (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/request-quote?product=${encodeURIComponent(product.slug)}`}
              className="commerce-button commerce-button-primary inline-flex min-h-12 items-center justify-center gap-2 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <FileText className="size-4" />
              <span>Request Bulk Quotation</span>
            </Link>
            <SalesContactLink
              product={product}
              quantity={quantity}
              variantLabel={activeVariant?.label}
              className="commerce-button commerce-button-secondary inline-flex min-h-12 items-center justify-center gap-2 text-sm font-extrabold"
            >
              Inquire on WhatsApp
            </SalesContactLink>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label htmlFor="product-quantity" className="mb-2 block text-sm font-bold text-accent">
              {cartonMode ? "Cartons" : "Pieces"}
            </label>
            <div className="inline-grid grid-cols-[44px_56px_44px] overflow-hidden rounded-xl border border-line bg-surface">
              <button
                type="button"
                onClick={() => setSafeQuantity(quantity - 1)}
                disabled={quantity <= minimum || isUnavailable}
                className="inline-flex min-h-11 items-center justify-center text-accent transition hover:bg-surface-soft focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:cursor-not-allowed disabled:text-muted"
                aria-label={cartonMode ? "Decrease cartons" : "Decrease pieces"}
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
                className="min-h-11 w-full border-x border-line text-center text-sm font-bold text-accent outline-none focus:z-10 focus:ring-2 focus:ring-inset focus:ring-focus disabled:bg-surface-soft"
              />
              <button
                type="button"
                onClick={() => setSafeQuantity(quantity + 1)}
                disabled={quantity >= maxQuantity || isUnavailable}
                className="inline-flex min-h-11 items-center justify-center text-accent transition hover:bg-surface-soft focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:cursor-not-allowed disabled:text-muted"
                aria-label={cartonMode ? "Increase cartons" : "Increase pieces"}
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
              className="commerce-button commerce-button-secondary inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-line disabled:text-muted"
            >
              {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
              {isUnavailable ? "Unavailable" : added ? "Added to cart" : "Add to cart"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isUnavailable}
              className="commerce-button commerce-button-primary inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-line disabled:bg-disabled"
            >
              Buy now
            </button>
          </div>
        </div>
      )}

      {/* Prominent WhatsApp to Order Action */}
      <div className="mt-3.5">
        <SalesContactLink
          product={product}
          quantity={quantity}
          variantLabel={activeVariant?.label}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-action px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-action-hover active:scale-[0.98]"
        >
          WhatsApp to Order / Get Bulk Price
        </SalesContactLink>
      </div>

      <p className="sr-only" aria-live="polite">
        {added ? `${quantity} ${cartonMode ? "cartons" : "pieces"} of ${product.name} added to cart` : ""}
      </p>

      {product.bulkPricing && (
        <div className="mt-6 rounded-2xl border border-line bg-surface-soft p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-accent shadow-sm">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-accent">Ordering for your business?</p>
              <p className="mt-1 text-sm leading-6 text-secondary">
                Ask for volume pricing and a supply plan matched to your requirements.
              </p>
              <Link
                href={`/request-quote?product=${encodeURIComponent(product.slug)}`}
                className="mt-3 inline-flex rounded-sm text-sm font-extrabold text-accent underline decoration-line-strong underline-offset-4 hover:decoration-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Request a bulk quotation
              </Link>
            </div>
          </div>
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-secondary">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        Stock is checked before order confirmation. Delivery charges and timing are confirmed
        during checkout.
      </p>
    </div>
  );
}
