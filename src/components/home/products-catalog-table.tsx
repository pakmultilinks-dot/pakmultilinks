"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Download, FileText, MessageSquare, Search, Sparkles, X } from "lucide-react";
import { RATE_COMPANIES, RATE_ITEMS, type RateItem } from "@/lib/rate-list-data";
import type { Product } from "@/lib/types";

interface ProductsCatalogTableProps {
  products?: Product[];
}

export function ProductsCatalogTable({}: ProductsCatalogTableProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayLimit, setDisplayLimit] = useState<number>(12);

  // Filter items by company and search query
  const filteredItems = useMemo(() => {
    return RATE_ITEMS.filter((item) => {
      // Company filter
      if (selectedCompany !== "all" && item.company !== selectedCompany) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const clean = searchQuery.toLowerCase().trim();
      return (
        item.itemNumber.toLowerCase().includes(clean) ||
        item.name.toLowerCase().includes(clean) ||
        item.brand.toLowerCase().includes(clean) ||
        item.spec.toLowerCase().includes(clean) ||
        item.category.toLowerCase().includes(clean) ||
        item.rateDisplay.toLowerCase().includes(clean) ||
        (item.note && item.note.toLowerCase().includes(clean))
      );
    });
  }, [selectedCompany, searchQuery]);

  const visibleItems = filteredItems.slice(0, displayLimit);
  const hasMore = displayLimit < filteredItems.length;

  return (
    <section className="border-t border-line bg-canvas py-10 sm:py-16" id="rate-list-section">
      <div className="site-shell">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-action/10 px-2.5 py-0.5 text-[11px] font-bold text-action uppercase tracking-wider">
                <Sparkles className="size-3" /> Official 2026 Reference
              </span>
              <span className="text-xs text-muted">52 Total Items</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-content sm:text-3xl lg:text-4xl">
              Official Wholesale Rate List
            </h2>
            <p className="mt-1 text-xs text-secondary sm:text-sm max-w-xl">
              Direct wholesale and retail reference pricing for Fresco aerosols, Germi Cure, Sicura cups, and Softex commercial paper.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <a
              href="/rate-list.pdf"
              download="Pak-Multilinks-Official-Rate-List.pdf"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-content shadow-xs transition hover:bg-surface-soft"
              title="Download official PDF catalogue"
            >
              <Download className="size-3.5 text-action" />
              <span>Download PDF (776 KB)</span>
            </a>

            <Link
              href="/rate-list"
              className="inline-flex items-center gap-1.5 rounded-xl bg-action px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-action-hover"
            >
              <FileText className="size-3.5" />
              <span>Full Interactive List</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Company Filter Tabs */}
          <div className="flex flex-wrap gap-1.5" role="tablist">
            {RATE_COMPANIES.filter((c) => !("isUpcoming" in c && c.isUpcoming)).map((comp) => {
              const active = selectedCompany === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => {
                    setSelectedCompany(comp.id);
                    setDisplayLimit(12);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-action text-white shadow-xs"
                      : "border border-line bg-surface text-secondary hover:bg-surface-soft"
                  }`}
                >
                  <span>{comp.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-surface-soft text-muted"}`}>
                    {comp.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayLimit(12);
              }}
              placeholder="Search 52 items (#1, Fresco, cups)..."
              className="h-9 w-full rounded-xl border border-line bg-surface pl-9 pr-8 text-xs font-medium text-content outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-content"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-[11px] font-bold uppercase tracking-wider text-muted">
                <th scope="col" className="w-16 px-4 py-3 text-center">Item</th>
                <th scope="col" className="px-4 py-3">Product Name & Brand</th>
                <th scope="col" className="px-4 py-3">Specification / Volume</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3 text-right">Price (PKR)</th>
                <th scope="col" className="w-28 px-4 py-3 text-center">WhatsApp Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    No items match your search &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => {
                  const whatsappMsg = encodeURIComponent(
                    `Hi Pak Multilinks, I am inquiring about wholesale rate and ordering for item ${item.itemNumber} (${item.brand} ${item.name} - ${item.spec}) from your Rate List.`
                  );

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-surface-soft/60">
                      {/* Item # */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block rounded-md bg-surface-soft px-2 py-0.5 font-mono text-[11px] font-extrabold text-accent">
                          {item.itemNumber}
                        </span>
                      </td>

                      {/* Product Name with Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-line bg-white p-0.5">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={40}
                                height={40}
                                loading="lazy"
                                unoptimized
                                className="size-full object-contain"
                              />
                            ) : (
                              <div className="grid size-full place-items-center bg-surface-soft text-[9px] font-bold text-muted">
                                PM
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                              {item.brand}
                            </span>
                            <span className="block font-bold text-content leading-snug">
                              {item.name}
                            </span>
                            {item.note && (
                              <span className="block text-[10px] text-muted truncate max-w-xs">
                                {item.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Specification */}
                      <td className="px-4 py-3 font-medium text-secondary">
                        {item.spec}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md border border-line bg-surface-soft px-2 py-0.5 text-[10px] font-semibold text-secondary">
                          {item.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        {item.isConfirmRate ? (
                          <span className="inline-block rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300">
                            Confirm Rate {item.confirmCode || ""}
                          </span>
                        ) : (
                          <span className="font-mono text-sm font-extrabold text-[#114b2f] dark:text-[#22c55e]">
                            {item.rateDisplay}
                          </span>
                        )}
                      </td>

                      {/* Inquiry WhatsApp Button */}
                      <td className="px-4 py-3 text-center">
                        <a
                          href={`https://wa.me/923258166829?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#114b2f] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition hover:bg-[#17643a] active:scale-95"
                        >
                          <MessageSquare className="size-3" /> Inquire
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
          {visibleItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              No items match your search &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            visibleItems.map((item) => {
              const whatsappMsg = encodeURIComponent(
                `Hi Pak Multilinks, I am inquiring about wholesale rate and ordering for item ${item.itemNumber} (${item.brand} ${item.name} - ${item.spec}) from your Rate List.`
              );

              return (
                <div key={item.id} className="p-3.5 transition-colors hover:bg-surface-soft/50">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-white p-1">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          loading="lazy"
                          unoptimized
                          className="size-full object-contain"
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-surface-soft text-[10px] text-muted">
                          PM
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="rounded bg-surface-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent">
                          {item.itemNumber}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          {item.brand}
                        </span>
                      </div>

                      <h3 className="font-bold text-content text-xs leading-snug">
                        {item.name}
                      </h3>

                      <p className="mt-0.5 text-[11px] text-secondary">
                        {item.spec}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        {item.isConfirmRate ? (
                          <span className="inline-block rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300">
                            Confirm Rate
                          </span>
                        ) : (
                          <span className="font-mono text-xs sm:text-sm font-extrabold text-[#114b2f] dark:text-[#22c55e]">
                            {item.rateDisplay}
                          </span>
                        )}

                        <a
                          href={`https://wa.me/923258166829?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#114b2f] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition hover:bg-[#17643a] active:scale-95"
                        >
                          <MessageSquare className="size-3" /> Inquire
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar: Show More / Pagination / Full List Link */}
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted">
            Showing <strong className="text-content">{visibleItems.length}</strong> of{" "}
            <strong className="text-content">{filteredItems.length}</strong> rate list items
          </p>

          <div className="flex items-center gap-2">
            {hasMore && (
              <button
                type="button"
                onClick={() => setDisplayLimit((prev) => prev + 12)}
                className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-content shadow-xs transition hover:bg-surface-soft active:scale-95"
              >
                Load More Items ({filteredItems.length - visibleItems.length} remaining)
              </button>
            )}

            <Link
              href="/rate-list"
              className="inline-flex items-center gap-1.5 rounded-xl bg-action/10 px-4 py-2 text-xs font-bold text-action transition hover:bg-action/20"
            >
              Open Full Rate List Page <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
