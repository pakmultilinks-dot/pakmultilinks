"use client";

import {
  ArrowDownUp,
  Grid2X2,
  List,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { categories as developmentCategories, getPrice } from "@/lib/catalog";
import type { Category, Product } from "@/lib/types";
import { cn, formatPrice, minimumCartons } from "@/lib/utils";

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
  categoryOptions?: Category[];
  hideHero?: boolean;
};

const PAGE_SIZE = 6;

export function CatalogExplorer({
  products,
  eyebrow = "Professional hygiene supplies",
  title = "Shop all products",
  description =
    "Browse practical hygiene, cleaning and workplace essentials for everyday and corporate supply needs.",
  initialQuery = "",
  fixedCategorySlug,
  categoryOptions = developmentCategories,
  hideHero = false,
}: CatalogExplorerProps) {
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState(fixedCategorySlug ?? "");
  const [brand, setBrand] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const deferredSearch = useDeferredValue(search);

  const availableBrands = useMemo(
    () => [...new Set(products.map((product) => product.brand))].sort(),
    [products],
  );
  const hasPublishedPrices = products.some((product) => !product.priceOnRequest);
  const priceCeiling = useMemo(() => {
    const highest = Math.max(...products.map((product) => getPrice(product)), 0);
    return Math.max(500, Math.ceil(highest / 500) * 500);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLocaleLowerCase();
    const selectedCategory = fixedCategorySlug ?? category;
    const floor = minPrice === "" ? 0 : Number(minPrice);
    const ceiling = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice);

    const matches = products.filter((product) => {
      const searchableText = [
        product.name,
        product.sku,
        product.category,
        product.brand,
        product.shortDescription,
        product.description,
      ]
        .join(" ")
        .toLocaleLowerCase();
      const productPrice = getPrice(product);

      return (
        (!query || searchableText.includes(query)) &&
        (!selectedCategory || product.categorySlug === selectedCategory) &&
        (!brand || product.brand === brand) &&
        (!inStockOnly || product.stock >= minimumCartons(product) || Boolean(product.allowBackorder)) &&
        productPrice >= floor &&
        productPrice <= ceiling
      );
    });

    return matches.sort((a, b) => {
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
    deferredSearch,
    fixedCategorySlug,
    inStockOnly,
    maxPrice,
    minPrice,
    products,
    sort,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const activeFilterCount =
    Number(Boolean(search.trim())) +
    Number(Boolean(category && !fixedCategorySlug)) +
    Number(Boolean(brand)) +
    Number(inStockOnly) +
    Number(Boolean(minPrice)) +
    Number(Boolean(maxPrice));

  function resetVisibleCount() {
    setVisibleCount(PAGE_SIZE);
  }

  function clearFilters() {
    setSearch("");
    setCategory(fixedCategorySlug ?? "");
    setBrand("");
    setInStockOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setVisibleCount(PAGE_SIZE);
  }

  function renderFilterFields(idPrefix: string) {
    return (
      <div className="space-y-6">
        <div>
          <label
            htmlFor={`${idPrefix}-catalog-search`}
            className="mb-2 block text-sm font-bold text-[#244b35]"
          >
            Search products
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6c7d72]"
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
              className="min-h-11 w-full rounded-xl border border-[#cad9ce] bg-white py-2 pl-9 pr-3 text-sm text-[#173c29] outline-none transition placeholder:text-[#8a978e] focus:border-[#17643a] focus:ring-2 focus:ring-[#17643a]/15"
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
            <label htmlFor={`${idPrefix}-category`} className="mb-2 block text-sm font-bold text-[#244b35]">Category</label>
            <select id={`${idPrefix}-category`} value={category} onChange={(event) => { setCategory(event.target.value); resetVisibleCount(); }} className="min-h-11 w-full rounded-xl border border-[#cad9ce] bg-white px-3 text-sm text-[#244b35] outline-none focus:border-[#17643a] focus:ring-2 focus:ring-[#17643a]/15">
              <option value="">All categories</option>
              {categoryOptions.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor={`${idPrefix}-brand`}
            className="mb-2 block text-sm font-bold text-[#244b35]"
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
            className="min-h-11 w-full rounded-xl border border-[#cad9ce] bg-white px-3 text-sm text-[#244b35] outline-none focus:border-[#17643a] focus:ring-2 focus:ring-[#17643a]/15"
          >
            <option value="">All brands</option>
            {availableBrands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {hasPublishedPrices && <fieldset>
          <legend className="mb-2 text-sm font-bold text-[#244b35]">Price range</legend>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`${idPrefix}-minimum-price`} className="sr-only">
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
                className="min-h-11 w-full rounded-xl border border-[#cad9ce] bg-white px-3 text-sm text-[#244b35] outline-none focus:border-[#17643a] focus:ring-2 focus:ring-[#17643a]/15"
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-maximum-price`} className="sr-only">
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
                className="min-h-11 w-full rounded-xl border border-[#cad9ce] bg-white px-3 text-sm text-[#244b35] outline-none focus:border-[#17643a] focus:ring-2 focus:ring-[#17643a]/15"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-[#738078]">
            Catalog range up to {formatPrice(priceCeiling)}
          </p>
        </fieldset>}

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dce6df] bg-white px-3 py-3 text-sm font-semibold text-[#315841]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => {
              setInStockOnly(event.target.checked);
              resetVisibleCount();
            }}
            className="size-4 accent-[#17643a]"
          />
          Available products only
        </label>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="commerce-button commerce-button-secondary inline-flex w-full items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2"
          >
            <X className="size-4" aria-hidden="true" />
            Clear {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {hideHero && <section className="border-b border-[#dce8df] bg-white"><div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8"><nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#6d7e73]"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/shop">Shop</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav><h1 className="text-2xl font-extrabold tracking-[-.025em] text-[#153b28] sm:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#596c61]">{description}</p></div></section>}
      {!hideHero && <section className="border-b border-[#dce8df] bg-[#f4f7ed]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold text-[#6d7e73]"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Shop</span></nav>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2f754a]">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-[-0.035em] text-[#153b28] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#596c61] sm:text-lg">
            {description}
          </p>
        </div>
      </section>}

      <section className="bg-[#fbfcf8] py-8 sm:py-12">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <details className="mb-5 rounded-2xl border border-[#d9e6dc] bg-[#f3f8f4] p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-[#244b35] marker:hidden">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#17643a] text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <span className="text-xs font-semibold text-[#63746a]">Tap to open</span>
            </summary>
            <div className="mt-5 border-t border-[#d9e6dc] pt-5">
              {renderFilterFields("mobile")}
            </div>
          </details>

          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside
              aria-label="Product filters"
              className="sticky top-28 hidden h-fit rounded-2xl border border-[#d9e6dc] bg-[#f3f8f4] p-5 lg:block"
            >
              <div className="mb-5 flex items-center gap-2 border-b border-[#d9e6dc] pb-4">
                <SlidersHorizontal className="size-4 text-[#17643a]" aria-hidden="true" />
                <h2 className="font-bold text-[#244b35]">Filter products</h2>
                {activeFilterCount > 0 && (
                  <span className="ml-auto inline-flex size-6 items-center justify-center rounded-full bg-[#17643a] text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {renderFilterFields("desktop")}
            </aside>

            <div className="min-w-0">
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#e0e9e2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#596b60]" role="status" aria-live="polite">
                  <span className="font-extrabold text-[#173c29]">{filteredProducts.length}</span>{" "}
                  {filteredProducts.length === 1 ? "product" : "products"} found
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#52675a]">
                    <ArrowDownUp className="size-4" aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">Sort by</span>
                    <select
                      value={sort}
                      onChange={(event) => {
                        setSort(event.target.value as SortOption);
                        resetVisibleCount();
                      }}
                      className="min-h-10 rounded-xl border border-[#cad9ce] bg-white px-3 text-sm font-semibold text-[#244b35] outline-none focus:border-[#17643a] focus:ring-2 focus:ring-[#17643a]/15"
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      {hasPublishedPrices && <option value="price-asc">Carton price: low to high</option>}
                      {hasPublishedPrices && <option value="price-desc">Carton price: high to low</option>}
                      <option value="best-selling">Best selling</option>
                    </select>
                  </label>

                  <div
                    className="flex rounded-xl border border-[#cad9ce] bg-[#f7faf7] p-1"
                    role="group"
                    aria-label="Product layout"
                  >
                    <button
                      type="button"
                      onClick={() => setView("grid")}
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]",
                        view === "grid"
                          ? "bg-[#17643a] text-white shadow-sm"
                          : "text-[#587064] hover:bg-white",
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
                        "inline-flex size-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]",
                        view === "list"
                          ? "bg-[#17643a] text-white shadow-sm"
                          : "text-[#587064] hover:bg-white",
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
                    "grid gap-5",
                    view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
                  )}
                >
                  {visibleProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      layout={view}
                      priority={index < 3}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-[#bfd0c3] bg-white px-6 py-16 text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#edf5ef] text-[#17643a]">
                    <PackageSearch className="size-7" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 text-xl font-extrabold text-[#173c29]">
                    No matching products
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647269]">
                    Try a broader search or clear one of your filters. You can also send us
                    your requirements for a custom corporate quotation.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={clearFilters}
                    className="commerce-button commerce-button-primary inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2"
                    >
                      Clear filters
                    </button>
                    <Link
                      href="/request-quote"
                    className="commerce-button commerce-button-secondary inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2"
                    >
                      Request a quote
                    </Link>
                  </div>
                </div>
              )}

              {visibleCount < filteredProducts.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="commerce-button commerce-button-secondary inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2"
                  >
                    Load more products
                  </button>
                  <p className="mt-3 text-xs text-[#718078]">
                    Showing {visibleProducts.length} of {filteredProducts.length}
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
