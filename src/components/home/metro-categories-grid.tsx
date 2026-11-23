"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MetroCategoriesGridProps {
  categories: Category[];
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

interface CategoryTile {
  slug: string;
  name: string;
  image: string;
}

// Curated high-resolution authentic product photography for prominent category tiles
const CATEGORY_REAL_IMAGES: Record<string, string> = {
  "tissue-paper-products": "/rate-products/rose-petal-pop-up.jpg",
  "washroom-supplies": "/rate-products/fresco-hand-wash.jpg",
  "cleaning-products": "/rate-products/fresco-dish-wash-real.jpg",
  "garbage-bags": "/images/products/garbage-bags-real.jpg",
  "dispensers": "/rate-products/fresco-air-freshener-dispenser.jpg",
  "cleaning-tools": "/images/products/mop-tools-real.jpg",
  "soaps-sanitizers": "/rate-products/fresco-hand-wash.jpg",
  "wet-wipes-fresheners": "/rate-products/fresco-air-freshener-range.jpg",
  "all": "/images/about-product-range.png",
};

export function MetroCategoriesGrid({
  categories,
  products: _products,
  selectedCategory,
  onSelectCategory,
}: MetroCategoriesGridProps) {
  // Tiles come from the real root categories in the database, so every
  // category the shop actually has shows up here (no hardcoded list).
  const tiles: CategoryTile[] = useMemo(() => {
    const roots = categories.filter((c) => !c.parentId);
    const list = roots.map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      image: CATEGORY_REAL_IMAGES[cat.slug] || "/images/about-product-range.png",
    }));
    list.push({ slug: "all", name: "All Products", image: CATEGORY_REAL_IMAGES["all"] || "/images/about-product-range.png" });
    return list;
  }, [categories]);

  return (
    <section className="w-full my-2 sm:my-3.5" aria-label="Shop by category">
      {/* 3-column prominent picture-only grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {tiles.map((tile) => {
          const isSelected =
            selectedCategory === tile.slug ||
            (tile.slug === "all" && selectedCategory === "all");

          return (
            <button
              key={tile.slug}
              type="button"
              title={tile.name}
              aria-label={tile.name}
              onClick={() => onSelectCategory(tile.slug)}
              className={cn(
                "group relative flex items-center justify-center h-[84px] sm:h-[96px] p-2 rounded-xl bg-white dark:bg-surface border-0 transition-all duration-200 active:scale-[0.97] shadow-2xs hover:shadow-md overflow-hidden",
                isSelected
                  ? "ring-2 ring-[#17643a] bg-emerald-50/30 dark:bg-emerald-950/25"
                  : "hover:bg-slate-50 dark:hover:bg-surface-soft"
              )}
            >
              {/* Prominent High-Visibility Product Picture Only */}
              <div className="relative size-full flex items-center justify-center">
                <Image
                  src={tile.image}
                  alt={tile.name}
                  width={140}
                  height={140}
                  loading="lazy"
                  unoptimized
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-108"
                />
              </div>

              {/* Active selection dot indicator */}
              {isSelected && (
                <span className="absolute bottom-1.5 right-1.5 size-2 rounded-full bg-[#17643a] ring-2 ring-white dark:ring-surface" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
