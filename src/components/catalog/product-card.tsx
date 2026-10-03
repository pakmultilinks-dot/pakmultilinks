"use client";

import { Check, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useStore } from "@/components/providers/store-provider";
import { getPrice } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { cartonPacking, cn, formatPrice, formatProductPrice, minimumCartons } from "@/lib/utils";

import { StockStatus } from "./stock-status";
import { ProductQuickView } from "./product-quick-view";
import { ProductMediaPlaceholder } from "./product-media-placeholder";

type ProductCardProps = {
  product: Product;
  layout?: "grid" | "list";
  priority?: boolean;
  headingLevel?: "h2" | "h3";
};

export function ProductCard({
  product,
  layout = "grid",
  priority = false,
  headingLevel = "h2",
}: ProductCardProps) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const price = getPrice(product);
  const isUnavailable = product.stock < minimumCartons(product) && !product.allowBackorder;
  const hasSale = product.salePrice != null && product.salePrice < product.price;
  const discount = hasSale
    ? Math.round(((product.price - price) / product.price) * 100)
    : 0;
  const Heading = headingLevel;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleAddToCart() {
    if (isUnavailable) return;
    addToCart(product, minimumCartons(product));
    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      className={cn(
        "product-card group flex flex-col overflow-hidden bg-white",
        layout === "list" &&
          "grid gap-0 sm:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)_220px]",
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          "relative block aspect-square overflow-hidden bg-[#f6f5f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#17643a]",
          layout === "list" && "sm:aspect-auto sm:min-h-56",
        )}
        aria-label={`View ${product.name}`}
      >
        {product.image ? <Image
          src={product.image}
          alt={product.imageAlt || product.name}
          fill
          unoptimized={product.image.startsWith("https://")}
          priority={priority}
          sizes={layout === "list" ? "(max-width: 640px) 100vw, 230px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          className="object-contain p-4 sm:p-5 transition duration-500 group-hover:scale-[1.04]"
        /> : <ProductMediaPlaceholder />}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {hasSale && (
            <span className="rounded-full bg-[#17643a] px-2.5 py-1 text-xs font-bold text-white">
              {discount}% off
            </span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-[#fff7df] px-2.5 py-1 text-xs font-bold text-[#775a06]">
              Best seller
            </span>
          )}
        </div>
      </Link>

      <div className={cn("flex min-w-0 flex-col px-0 py-4", layout === "list" && "sm:p-6")}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Link
            href={`/shop/${product.categorySlug}`}
            className="text-[10px] font-normal tracking-wide text-[#48705a] hover:text-[#17643a] hover:underline"
          >
            {product.category}
          </Link>
          <StockStatus
            stock={product.stock}
            lowStockThreshold={product.lowStockThreshold}
            allowBackorder={product.allowBackorder}
            minimumOrderCartons={minimumCartons(product)}
          />
        </div>

        <Heading className="text-sm font-medium leading-snug sm:text-base text-[#173c29]">
          <Link
            href={`/product/${product.slug}`}
            className="rounded-sm hover:text-[#17643a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]"
          >
            {product.name}
          </Link>
        </Heading>
        <p
          className={cn(
            "mt-2 text-xs leading-5 text-[#617067]",
            layout === "grid" && "line-clamp-2",
          )}
        >
          {product.shortDescription}
        </p>

        <div className="mt-3 space-y-1 text-xs font-semibold text-[#17643a]"><p>{cartonPacking(product)}</p><p>MOQ: {minimumCartons(product)} carton{minimumCartons(product) === 1 ? "" : "s"}</p></div>

        <div className="mt-auto flex items-end gap-2 pt-5">
          <span className="text-sm font-semibold tracking-tight sm:text-base text-[#173c29]">
            {formatProductPrice(product)}
          </span>
          {hasSale && (
            <span className="pb-0.5 text-sm text-[#7d8981] line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "mt-auto grid grid-cols-[1fr_auto] gap-2 border-t border-neutral-200 pt-3",
          layout === "list" &&
            "sm:col-span-2 lg:col-span-1 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:p-6",
        )}
      >
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isUnavailable}
          className="commerce-button commerce-button-primary inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#a8b3ac] disabled:bg-[#a8b3ac]"
          aria-label={
            isUnavailable
              ? `${product.name} is out of stock`
              : `Add ${product.name} cartons to cart`
          }
        >
          {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
          {isUnavailable ? "Unavailable" : added ? "Added to cart" : "Add to cart"}
        </button>
        <ProductQuickView
          product={product}
          onAddToCart={handleAddToCart}
          unavailable={isUnavailable}
        />
        <span className="sr-only" aria-live="polite">
          {added ? `${product.name} added to cart` : ""}
        </span>
      </div>
    </article>
  );
}
