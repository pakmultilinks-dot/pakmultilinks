"use client";

import { ArrowRight, Eye, MessageCircle, ShoppingCart, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { getPrice } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { cartonPacking, formatPiecePrice, formatPrice, formatProductPrice, getPerPiecePrice, minimumCartons } from "@/lib/utils";

import { StockStatus } from "./stock-status";
import { ProductMediaPlaceholder } from "./product-media-placeholder";

type ProductQuickViewProps = {
  product: Product;
  onAddToCart: () => void;
  unavailable?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
};

import { isProductAvailable } from "@/lib/pricing";

export function ProductQuickView({
  product,
  onAddToCart,
  unavailable = false,
  isOpen,
  onClose,
  showTrigger = true,
}: ProductQuickViewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [isZoomed, setIsZoomed] = useState(false);
  const isUnavailable = unavailable || !isProductAvailable(product);
  const hasSale = product.salePrice != null && product.salePrice > 0 && product.salePrice < product.price;
  const perPiece = getPerPiecePrice(product);

  useEffect(() => {
    if (isOpen !== undefined) {
      if (isOpen) {
        dialogRef.current?.showModal();
      } else {
        dialogRef.current?.close();
      }
    }
  }, [isOpen]);

  function closeDialog() {
    setIsZoomed(false);
    dialogRef.current?.close();
    onClose?.();
  }

  const price = getPrice(product);
  const whatsappText = encodeURIComponent(
    `Hi Pak Multilinks, I am inquiring about *${product.name}* (SKU: ${product.sku}) priced at Rs. ${price}. Please share carton availability and delivery time in Lahore.`
  );
  const whatsappUrl = `https://wa.me/923258166829?text=${whatsappText}`;

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={() => {
            dialogRef.current?.showModal();
          }}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-semibold text-accent transition hover:border-action/40 hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          aria-haspopup="dialog"
          aria-label={`Enhance / Quick view ${product.name}`}
          title="Click to enhance image & view details"
        >
          <Eye className="size-3.5" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Quick view</span>
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(94vw,860px)] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-accent shadow-2xl backdrop:bg-action/60 backdrop:backdrop-blur-sm animate-scale-in"
      >
        <div className="relative grid sm:grid-cols-[minmax(300px,1fr)_minmax(0,1.15fr)]">
          <button
            type="button"
            onClick={closeDialog}
            className="absolute right-3.5 top-3.5 z-20 inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface/95 text-accent shadow-md transition hover:bg-surface-soft hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Close modal"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          {/* Enhanced Image Showcase with Zoom Toggle */}
          <div className="relative flex flex-col items-center justify-center min-h-80 bg-surface-soft p-6 sm:min-h-[460px] overflow-hidden border-b sm:border-b-0 sm:border-r border-line">
            <div
              className={`relative size-64 sm:size-80 transition-transform duration-300 ${
                isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in hover:scale-105"
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
              title={isZoomed ? "Click to reset zoom" : "Click to zoom image"}
            >
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.imageAlt || product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 94vw, 400px"
                  className="object-contain p-2"
                />
              ) : (
                <ProductMediaPlaceholder />
              )}
            </div>

            {/* Floating Zoom Controls & Brand Badge */}
            <div className="absolute left-4 bottom-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface/90 px-2.5 py-1 text-xs font-bold text-accent shadow-xs backdrop-blur-xs transition hover:bg-surface"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="size-3.5 text-action" />
                    <span>Reset 1x</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="size-3.5 text-action" />
                    <span>Zoom 2x</span>
                  </>
                )}
              </button>
            </div>

            <span className="absolute top-4 left-4 rounded-full bg-surface/95 border border-line px-3 py-1 text-xs font-extrabold text-accent shadow-xs backdrop-blur-xs">
              {product.brand}
            </span>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-action">
                {product.category}
              </span>
              <span className="text-xs text-muted">•</span>
              <span className="text-xs font-semibold text-secondary">
                SKU: {product.sku}
              </span>
            </div>

            <h2 id={headingId} className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-content">
              {product.name}
            </h2>

            <p className="mt-3 text-sm leading-6 text-secondary line-clamp-3">
              {product.description || product.shortDescription}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StockStatus
                stock={product.stock}
                lowStockThreshold={product.lowStockThreshold}
                allowBackorder={product.allowBackorder}
                minimumOrderCartons={minimumCartons(product)}
                showQuantity
              />
            </div>

            {/* Price Box */}
            <div className="mt-5 rounded-2xl border border-line bg-surface-soft/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {product.priceOnRequest ? "Pricing Status" : "Wholesale Rate"}
                </p>
                {!product.priceOnRequest && (
                  <span className="text-[10px] font-bold text-action bg-action/10 px-2 py-0.5 rounded-full">
                    Min. order PKR 5,000
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-2.5">
                {product.priceOnRequest ? (
                  <span className="inline-flex items-center rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-lg sm:text-xl font-extrabold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                    Price on request
                  </span>
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#dc2626] tracking-tight">
                      {formatProductPrice(product)}
                    </span>
                    {hasSale && (
                      <span className="text-base text-muted line-through font-semibold">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </>
                )}
              </div>
              {!product.priceOnRequest && perPiece != null && product.unitsPerCarton > 1 && (
                <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-100/90 px-3 py-1 text-xs font-bold text-red-950 shadow-2xs dark:border-red-600 dark:bg-red-950 dark:text-red-100">
                  <span className="font-semibold text-red-800 dark:text-red-300">Per piece rate:</span>
                  <span className="text-sm font-black text-red-950 dark:text-white">{formatPiecePrice(perPiece)}</span>
                </div>
              )}
            </div>

            {/* Specifications Grid */}
            <dl className="mt-4 grid gap-2 border-y border-line py-3.5 text-xs sm:text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Brand</dt>
                <dd className="font-extrabold text-content">{product.brand}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Carton Packing</dt>
                <dd className="font-extrabold text-accent">{cartonPacking(product)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Minimum Order (MOQ)</dt>
                <dd className="font-extrabold text-content">{minimumCartons(product)} carton{minimumCartons(product) === 1 ? "" : "s"}</dd>
              </div>
            </dl>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                {product.priceOnRequest ? (
                  <Link
                    href={`/request-quote?product=${encodeURIComponent(product.slug)}`}
                    onClick={closeDialog}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-4 text-xs sm:text-sm font-extrabold text-white transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus shadow-xs active:scale-98 text-center"
                  >
                    <span>Request Quote</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => {
                      onAddToCart();
                      closeDialog();
                    }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-4 text-xs sm:text-sm font-extrabold text-white transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:bg-disabled shadow-xs active:scale-98"
                  >
                    <ShoppingCart className="size-4" aria-hidden="true" />
                    <span>{isUnavailable ? "Out of Stock" : "Add to Cart"}</span>
                  </button>
                )}

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 text-xs sm:text-sm font-extrabold text-white transition hover:bg-[#20ba59] shadow-xs active:scale-98"
                >
                  <MessageCircle className="size-4 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <Link
                href={`/product/${product.slug}`}
                onClick={closeDialog}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-4 text-xs font-bold text-accent transition hover:bg-surface-soft hover:border-action"
              >
                <span>View Full Product Page Details</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
