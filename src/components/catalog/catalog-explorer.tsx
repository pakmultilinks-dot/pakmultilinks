"use client";

import {
  ArrowDownUp,
  Grid2X2,
  List,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { categories as developmentCategories, getPrice } from "@/lib/catalog";
import {
  matchesCategory,
  matchesBrand,
  isCatalogProductAvailable,
  catalogProductPrices,
} from "@/lib/catalog-filters";
import { searchCatalog } from "@/lib/search";
import type { Category, Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

import { ProductCard } from "./product-card";

type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";

type CatalogExplorerProps = {
  products: Product[];
  eyebrow?: string;
  title?: string;
  description?: string;
  initialQuery?: string;
  fixedCategorySlug?: string;
  initialCategorySlug?: string;
  initialBrand?: string;
  categoryOptions?: Category[];
  hideHero?: boolean;
  hideH1?: boolean;
};

const PAGE_SIZE = 24;

export function CatalogExplorer({
  products,
  title = "Shop all products",
  initialQuery = "",
  fixedCategorySlug,
  initialCategorySlug = "",
  initialBrand = "",
  categoryOptions = developmentCategories,
  hideHero = false,
  hideH1,
}: CatalogExplorerProps) {
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategorySlug);
  const [brand, setBrand] = useState(initialBrand);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const deferredSearch = useDeferredValue(search);

  const availableBrands = useMemo(
    () =>
      [
        ...new Set(
          products
            .filter((product) =>
              matchesCategory(product, category, categoryOptions),
            )
            .map((product) => product.brand.trim()),
        ),
      ].sort(),
    [products, category, categoryOptions],
  );

  const brandList = useMemo(() => {
    const counts = new Map<string, number>();
    products
      .filter((product) => matchesCategory(product, category, categoryOptions))
      .forEach((p) => {
        const b = p.brand?.trim();
        if (b && b.toLowerCase() !== "unbranded") {
          counts.set(b, (counts.get(b) || 0) + 1);
        }
      });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, category, categoryOptions]);

  const relevantCategories = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    products.forEach((p) => {
      const slug =
        p.categorySlug || p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existing = counts.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(slug, { name: p.category, count: 1 });
      }
    });
    return Array.from(counts.entries())
      .map(([slug, info]) => ({ slug, name: info.name, count: info.count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const hasPublishedPrices = products.some(
    (product) => !product.priceOnRequest,
  );
  const priceCeiling = useMemo(() => {
    const highest = Math.max(
      ...products.map((product) => getPrice(product)),
      0,
    );
    return Math.max(500, Math.ceil(highest / 500) * 500);
  }, [products]);

  const searchResult = useMemo(() => {
    const q = deferredSearch.trim();
    if (!q) return null;
    return searchCatalog(products, q, categoryOptions);
  }, [deferredSearch, products, categoryOptions]);

  const searchScoreMap = useMemo(() => {
    if (!searchResult) return null;
    return new Map(searchResult.matches.map((m) => [m.item.id, m.score]));
  }, [searchResult]);

  const filteredProducts = useMemo(() => {
    const floor = minPrice === "" ? 0 : Math.max(0, Number(minPrice));
    const ceiling =
      maxPrice === ""
        ? Number.POSITIVE_INFINITY
        : Math.max(0, Number(maxPrice));
    const matches = products.filter((product) => {
      const brandMatches = matchesBrand(product, brand);
      const categoryMatches =
        matchesCategory(product, fixedCategorySlug || "", categoryOptions) &&
        matchesCategory(product, category, categoryOptions);
      const matchesQuery = !searchScoreMap || searchScoreMap.has(product.id);

      return (
        matchesQuery &&
        categoryMatches &&
        brandMatches &&
        (!inStockOnly || isCatalogProductAvailable(product)) &&
        ((minPrice === "" && maxPrice === "") ||
          (!product.priceOnRequest &&
            catalogProductPrices(product).some(
              (price) => price >= floor && price <= ceiling,
            )))
      );
    });

    return matches.sort((a, b) => {
      if (searchScoreMap && sort === "featured") {
        const scoreDiff =
          (searchScoreMap.get(b.id) || 0) - (searchScoreMap.get(a.id) || 0);
        if (scoreDiff !== 0) return scoreDiff;
      }
      if (sort === "price-asc") return getPrice(a) - getPrice(b);
      if (sort === "price-desc") return getPrice(b) - getPrice(a);
      if (sort === "newest") return b.id.localeCompare(a.id);
      if (sort === "best-selling") {
        return Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller));
      }
      return (
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller))
      );
    });
  }, [
    brand,
    category,
    fixedCategorySlug,
    inStockOnly,
    maxPrice,
    minPrice,
    products,
    searchScoreMap,
    categoryOptions,
    sort,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const activeFilterCount =
    Number(Boolean(search.trim())) +
    Number(Boolean(category)) +
    Number(Boolean(brand) && products.some((product) => !matchesBrand(product, brand))) +
    Number(inStockOnly) +
    Number(Boolean(minPrice)) +
    Number(Boolean(maxPrice));

  const selectableCategories = categoryOptions.filter((item) =>
    products.some(
      (product) =>
        matchesCategory(product, item.slug, categoryOptions) &&
        matchesBrand(product, brand),
    ),
  );

  function selectCategory(slug: string) {
    setCategory(slug);
    if (
      brand &&
      !products.some(
        (product) =>
          matchesCategory(product, slug, categoryOptions) &&
          matchesBrand(product, brand),
      )
    )
      setBrand("");
    setVisibleCount(PAGE_SIZE);
  }

  function resetVisibleCount() {
    setVisibleCount(PAGE_SIZE);
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setBrand("");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setVisibleCount(PAGE_SIZE);
  }

  function renderFilterFields(idPrefix: string) {
    return (
      <div className="space-y-6">
        <div className="hidden md:block">
          <label
            htmlFor={`${idPrefix}-catalog-search`}
            className="mb-2 block text-sm font-bold text-accent"
          >
            Search products
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id={`${idPrefix}-catalog-search`}
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetVisibleCount();
              }}
              list={`${idPrefix}-product-suggestions`}
              placeholder="Name, SKU or category"
              className="min-h-11 w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-accent outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/15"
            />
            <datalist id={`${idPrefix}-product-suggestions`}>
              {products.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.sku}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {!fixedCategorySlug && (
          <div>
            <label
              htmlFor={`${idPrefix}-category`}
              className="mb-2 block text-sm font-bold text-accent"
            >
              Category
            </label>
            <select
              id={`${idPrefix}-category`}
              value={category}
              onChange={(event) => {
                selectCategory(event.target.value);
              }}
              className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-accent outline-none focus:border-focus focus:ring-2 focus:ring-focus/15"
            >
              <option value="">All categories</option>
              {selectableCategories.map((item) => (
                <option value={item.slug} key={item.id}>
                  {item.parentId ? "↳ " : ""}
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {availableBrands.length > 1 && (
          <div>
            <label
              htmlFor={`${idPrefix}-brand`}
              className="mb-2 block text-sm font-bold text-accent"
            >
              Brand
            </label>
            <select
              id={`${idPrefix}-brand`}
              value={brand}
              onChange={(event) => {
                setBrand(event.target.value);
                resetVisibleCount();
              }}
              className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-accent outline-none focus:border-focus focus:ring-2 focus:ring-focus/15"
            >
              <option value="">All brands</option>
              {availableBrands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasPublishedPrices && (
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-accent">
              Price range
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor={`${idPrefix}-minimum-price`}
                  className="sr-only"
                >
                  Minimum price in Pakistani rupees
                </label>
                <input
                  id={`${idPrefix}-minimum-price`}
                  type="number"
                  min="0"
                  step="50"
                  value={minPrice}
                  onChange={(event) => {
                    setMinPrice(event.target.value);
                    resetVisibleCount();
                  }}
                  placeholder="Min"
                  className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-accent outline-none focus:border-focus focus:ring-2 focus:ring-focus/15"
                />
              </div>
              <div>
                <label
                  htmlFor={`${idPrefix}-maximum-price`}
                  className="sr-only"
                >
                  Maximum price in Pakistani rupees
                </label>
                <input
                  id={`${idPrefix}-maximum-price`}
                  type="number"
                  min="0"
                  step="50"
                  value={maxPrice}
                  onChange={(event) => {
                    setMaxPrice(event.target.value);
                    resetVisibleCount();
                  }}
                  placeholder={`Max ${priceCeiling}`}
                  className="min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-accent outline-none focus:border-focus focus:ring-2 focus:ring-focus/15"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">
              Catalog range up to {formatPrice(priceCeiling)}
            </p>
          </fieldset>
        )}

        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-line bg-surface px-3 py-3 text-sm font-semibold text-accent">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => {
              setInStockOnly(event.target.checked);
              resetVisibleCount();
            }}
            className="size-4 accent-focus"
          />
          Available products only
        </label>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="commerce-button commerce-button-secondary inline-flex w-full items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <X className="size-4" aria-hidden="true" />
            Clear {activeFilterCount}{" "}
            {activeFilterCount === 1 ? "filter" : "filters"}
          </button>
        )}
      </div>
    );
  }

  const shouldHideH1 =
    hideH1 ?? (hideHero || Boolean(fixedCategorySlug) || Boolean(initialBrand));

  return (
    <>
      {!shouldHideH1 && <h1 className="sr-only">{title}</h1>}

      <section className="catalog-body bg-surface py-8 sm:py-12">
        <div className="site-shell">
          <div className="catalog-mobile-search md:hidden" role="search">
            <Search size={20} aria-hidden="true" />
            <label htmlFor="catalog-mobile-query" className="sr-only">
              Search products
            </label>
            <input
              id="catalog-mobile-query"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetVisibleCount();
              }}
              placeholder="Search products"
              enterKeyHint="search"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  resetVisibleCount();
                }}
                className="focus-ring"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {/* Mobile Quick Category Slider */}
          {!fixedCategorySlug && (
            <div className="mb-3.5 lg:hidden">
              <div className="catalog-category-chips no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setCategory("");
                    resetVisibleCount();
                  }}
                  aria-pressed={category === ""}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                    category === ""
                      ? "bg-action text-white shadow-xs"
                      : "border border-line bg-surface text-accent"
                  }`}
                >
                  All Products
                </button>
                {selectableCategories
                  .filter((c) => !c.parentId)
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        selectCategory(item.slug);
                      }}
                      aria-pressed={category === item.slug}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                        category === item.slug
                          ? "bg-action text-white shadow-xs"
                          : "border border-line bg-surface text-accent"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <details className="catalog-mobile-filters group mb-5 rounded-md border border-line bg-surface p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-accent marker:hidden">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-action text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold text-secondary">
                <span className="group-open:hidden">Show filters</span>
                <span className="hidden group-open:inline">Hide filters</span>
              </span>
            </summary>
            <div className="mt-5 border-t border-line pt-5">
              {renderFilterFields("mobile")}
            </div>
          </details>

          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside
              aria-label="Product filters"
              className="catalog-filter-panel hidden self-start rounded-2xl border border-line bg-surface p-5 lg:block"
            >
              <div className="mb-5 flex items-center gap-2 border-b border-line pb-4">
                <SlidersHorizontal
                  className="size-4 text-action"
                  aria-hidden="true"
                />
                <h2 className="font-extrabold text-content">Filter products</h2>
                {activeFilterCount > 0 && (
                  <span className="ml-auto inline-flex size-6 items-center justify-center rounded-full bg-action text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {renderFilterFields("desktop")}
            </aside>

            <div className="min-w-0">
              {/* Contextual Quick Selector Tabs: Categories for brand pages, Brands for multi-brand shop */}
              {brandList.length <= 1 && relevantCategories.length > 1 ? (
                <div className="mb-5 flex items-center gap-2 overflow-x-auto rounded-2xl border border-line bg-surface p-2.5 shadow-xs scrollbar-thin">
                  <span className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-muted px-2 border-r border-line/60">
                    Categories
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("");
                      resetVisibleCount();
                    }}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition",
                      !category
                        ? "bg-action text-white shadow-xs"
                        : "border border-line bg-surface-soft text-accent hover:border-action hover:bg-surface-hover",
                    )}
                  >
                    <span>All Products</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                        !category
                          ? "bg-white/20 text-white"
                          : "bg-line text-secondary",
                      )}
                    >
                      {products.length}
                    </span>
                  </button>
                  {relevantCategories.map(({ slug, name, count }) => {
                    const isSelected = category === slug;
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => {
                          setCategory(isSelected ? "" : slug);
                          resetVisibleCount();
                        }}
                        className={cn(
                          "shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
                          isSelected
                            ? "bg-action text-white ring-2 ring-action/25 shadow-xs"
                            : "border border-line bg-surface-soft text-accent hover:border-action hover:text-action hover:bg-surface-hover",
                        )}
                      >
                        <span>{name}</span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-line text-secondary",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                  {category && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategory("");
                        resetVisibleCount();
                      }}
                      className="shrink-0 ml-auto inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-danger px-2.5 py-1.5 rounded-lg hover:bg-danger-soft/30 transition"
                    >
                      <X className="size-3" />
                      <span>Clear filter</span>
                    </button>
                  )}
                </div>
              ) : brandList.length > 1 ? (
                <div className="mb-5 flex items-center gap-2 overflow-x-auto rounded-2xl border border-line bg-surface p-2.5 pb-3 shadow-xs scrollbar-thin">
                  <span className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-muted px-2 border-r border-line/60">
                    Brands
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBrand("");
                      resetVisibleCount();
                    }}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition",
                      !brand
                        ? "bg-action text-white shadow-xs"
                        : "border border-line bg-surface-soft text-accent hover:border-action hover:bg-surface-hover",
                    )}
                  >
                    <span>All Brands</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                        !brand
                          ? "bg-white/20 text-white"
                          : "bg-line text-secondary",
                      )}
                    >
                      {products.length}
                    </span>
                  </button>

                  {brandList.map(({ name, count }) => {
                    const isSelected =
                      brand.toLowerCase() === name.toLowerCase();
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setBrand(isSelected ? "" : name);
                          resetVisibleCount();
                        }}
                        className={cn(
                          "shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
                          isSelected
                            ? "bg-action text-white ring-2 ring-action/25 shadow-xs"
                            : "border border-line bg-surface-soft text-accent hover:border-action hover:text-action hover:bg-surface-hover",
                        )}
                      >
                        <span>{name}</span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-line text-secondary",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  {brand && (
                    <button
                      type="button"
                      onClick={() => {
                        setBrand("");
                        resetVisibleCount();
                      }}
                      className="shrink-0 ml-auto inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-danger px-2.5 py-1.5 rounded-lg hover:bg-danger-soft/30 transition"
                    >
                      <X className="size-3" />
                      <span>Clear filter</span>
                    </button>
                  )}
                </div>
              ) : null}

              {searchResult?.correctedQuery &&
                searchResult.correctedQuery.toLowerCase() !==
                  deferredSearch.trim().toLowerCase() && (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-content shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Sparkles
                        className="size-4 text-primary shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        Showing results for{" "}
                        <strong className="text-primary font-bold">
                          {searchResult.correctedQuery}
                        </strong>
                        {deferredSearch.trim() && (
                          <span className="text-xs text-muted ml-1.5">
                            (search query &ldquo;{deferredSearch.trim()}&rdquo;)
                          </span>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (searchResult?.correctedQuery) {
                          setSearch(searchResult.correctedQuery);
                        }
                      }}
                      className="text-xs font-bold text-primary underline underline-offset-2 hover:opacity-80 transition"
                    >
                      Update query to &ldquo;{searchResult.correctedQuery}
                      &rdquo;
                    </button>
                  </div>
                )}

              <div className="catalog-toolbar mb-6 flex flex-col gap-4 rounded-md border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className="text-sm text-accent"
                  role="status"
                  aria-live="polite"
                >
                  <span className="font-extrabold text-accent">
                    {filteredProducts.length}
                  </span>{" "}
                  {filteredProducts.length === 1 ? "product" : "products"} found
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-accent">
                    <ArrowDownUp className="size-4" aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">Sort by</span>
                    <select
                      value={sort}
                      onChange={(event) => {
                        setSort(event.target.value as SortOption);
                        resetVisibleCount();
                      }}
                      className="min-h-10 rounded-md border border-line bg-surface px-3 text-sm font-semibold text-accent outline-none focus:border-focus focus:ring-2 focus:ring-focus/15"
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      {hasPublishedPrices && (
                        <option value="price-asc">
                          Carton price: low to high
                        </option>
                      )}
                      {hasPublishedPrices && (
                        <option value="price-desc">
                          Carton price: high to low
                        </option>
                      )}
                      <option value="best-selling">Best selling</option>
                    </select>
                  </label>

                  <div
                    className="catalog-view-toggle flex rounded-md border border-line bg-surface-soft p-1"
                    role="group"
                    aria-label="Product layout"
                  >
                    <button
                      type="button"
                      onClick={() => setView("grid")}
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                        view === "grid"
                          ? "bg-action text-white shadow-sm"
                          : "text-accent hover:bg-surface",
                      )}
                      aria-label="Grid view"
                      aria-pressed={view === "grid"}
                    >
                      <Grid2X2 className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                        view === "list"
                          ? "bg-action text-white shadow-sm"
                          : "text-accent hover:bg-surface",
                      )}
                      aria-label="List view"
                      aria-pressed={view === "list"}
                    >
                      <List className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {visibleProducts.length > 0 ? (
                <div
                  id="product-results"
                  className={cn(
                    "catalog-products grid gap-3.5 sm:gap-5",
                    view === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                      : "grid-cols-1",
                  )}
                >
                  {visibleProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`animate-page-enter stagger-${Math.min(index + 1, 8)}`}
                    >
                      <ProductCard
                        product={product}
                        layout={view}
                        priority={index < 3}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-16 text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-md bg-surface-soft text-accent">
                    <PackageSearch className="size-7" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 text-xl font-extrabold text-content">
                    No matching products
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
                    Try a broader search or clear one of your filters. You can
                    also send us your requirements for a custom corporate
                    quotation.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="commerce-button commerce-button-primary inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                    >
                      Clear filters
                    </button>
                    <Link
                      href="/request-quote"
                      className="commerce-button commerce-button-secondary inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                    >
                      Request a quote
                    </Link>
                  </div>

                  <div className="mt-8 border-t border-line/60 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                      Try searching for
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "Rose Petal",
                        "Nozomi",
                        "Facial Tissues",
                        "Tissue Rolls",
                        "Germi Cure Phenyl",
                        "Dispensers",
                        "Hand Wash",
                        "Trash Bags",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            clearFilters();
                            setSearch(chip);
                          }}
                          className="rounded-full border border-line bg-surface-soft px-3.5 py-1.5 text-xs font-medium text-accent hover:border-action hover:bg-surface-hover hover:text-action transition"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {visibleCount < filteredProducts.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) => count + PAGE_SIZE)
                    }
                    className="commerce-button commerce-button-secondary inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                  >
                    Load more products
                  </button>
                  <p className="mt-3 text-xs text-muted">
                    Showing {visibleProducts.length} of{" "}
                    {filteredProducts.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
