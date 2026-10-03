"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Download, Search, Save } from "lucide-react";
import { buttonClass, inputClass, panelClass } from "./ui";

export type PricingRow = {
  id: string; name: string; sku: string; category: string; updatedAt: string;
  price: number; salePrice: number | null; priceOnRequest: boolean;
  stock: number; unitsPerCarton: number; minimumOrderCartons: number;
};
type Draft = { price: string; salePrice: string; priceOnRequest: boolean; stock: string; unitsPerCarton: string; minimumOrderCartons: string };
const toDraft = (row: PricingRow): Draft => ({ price: String(row.price), salePrice: row.salePrice === null ? "" : String(row.salePrice), priceOnRequest: row.priceOnRequest, stock: String(row.stock), unitsPerCarton: String(row.unitsPerCarton), minimumOrderCartons: String(row.minimumOrderCartons) });

export function PricingEditor({ initialRows, disabled }: { initialRows: PricingRow[]; disabled: boolean }) {
  const [rows, setRows] = useState(initialRows);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [adjustment, setAdjustment] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirtyIds = Object.keys(drafts);
  const visible = useMemo(() => rows.filter(row => `${row.name} ${row.sku}`.toLowerCase().includes(query.toLowerCase()) && (!category || row.category === category) && (filter === "all" || (filter === "quote" ? row.priceOnRequest : filter === "stock" ? row.stock === 0 : !row.priceOnRequest))), [rows, query, category, filter]);
  const categories = [...new Set(rows.map(row => row.category))].sort();

  useEffect(() => {
    if (!dirtyIds.length) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyIds.length]);

  function edit(row: PricingRow, patch: Partial<Draft>) {
    setDrafts(current => {
      const next = { ...current, [row.id]: { ...(current[row.id] ?? toDraft(row)), ...patch } };
      if (JSON.stringify(next[row.id]) === JSON.stringify(toDraft(row))) delete next[row.id];
      return next;
    });
    setMessage("");
  }
  function applyAdjustment() {
    const percent = Number(adjustment);
    if (!adjustment || !Number.isFinite(percent) || percent < -100 || percent > 1000) { setError("Enter an adjustment between −100% and 1000%."); return; }
    for (const row of rows.filter(row => selected.includes(row.id))) {
      const value = drafts[row.id] ?? toDraft(row);
      edit(row, { price: (Number(value.price) * (1 + percent / 100)).toFixed(2), salePrice: value.salePrice === "" ? "" : (Number(value.salePrice) * (1 + percent / 100)).toFixed(2) });
    }
    setError("");
  }
  async function save() {
    setError(""); setMessage("");
    if (dirtyIds.length > 100) { setError("Save up to 100 changed products at a time."); return; }
    const products = dirtyIds.map(id => {
      const draft = drafts[id];
      return { id, updatedAt: rows.find(row => row.id === id)!.updatedAt, price: Number(draft.price), salePrice: draft.salePrice === "" ? null : Number(draft.salePrice), priceOnRequest: draft.priceOnRequest, stock: Number(draft.stock), unitsPerCarton: Number(draft.unitsPerCarton), minimumOrderCartons: Number(draft.minimumOrderCartons) };
    });
    if (dirtyIds.some(id => Object.entries(drafts[id]).some(([key, value]) => key !== "salePrice" && typeof value === "string" && value.trim() === ""))) { setError("Fill in all numeric fields. Only sale price may be blank."); return; }
    setPending(true);
    try {
      const response = await fetch("/api/admin/products/pricing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.issues?.map((issue: { message: string }) => issue.message).join(". ") || result.error || "Unable to save changes.");
      setRows(current => current.map(row => {
        const updated = products.find(item => item.id === row.id);
        return updated ? { ...row, ...updated, updatedAt: result.products.find((item: { id: string }) => item.id === row.id).updatedAt } : row;
      }));
      setDrafts({}); setMessage(`${products.length} product${products.length === 1 ? "" : "s"} saved. Storefront pricing is updated.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save changes."); }
    finally { setPending(false); }
  }
  function exportCsv() {
    const cell = (value: unknown) => `"${String(value).replace(/^[=+@\-]/, "'$&").replaceAll('"', '""')}"`;
    const csv = [["Product", "SKU", "Category", "Regular price PKR", "Sale price PKR", "Price on request", "Stock cartons", "Units per carton", "Minimum cartons"], ...visible.map(row => [row.name, row.sku, row.category, row.price, row.salePrice ?? "", row.priceOnRequest, row.stock, row.unitsPerCarton, row.minimumOrderCartons])].map(row => row.map(cell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "pak-multilinks-pricing.csv"; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">{[["Products", rows.length], ["Published prices", rows.filter(row => !row.priceOnRequest).length], ["Quote only", rows.filter(row => row.priceOnRequest).length]].map(([label, value]) => <div key={label} className={`${panelClass} p-4`}><p className="text-xs text-neutral-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>
    <section className={`${panelClass} overflow-hidden`}>
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 p-3">{[["all", "All products"], ["priced", "Published prices"], ["quote", "Price on request"], ["stock", "Out of stock"]].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-md px-3 py-2 text-xs font-medium ${filter === value ? "bg-neutral-200 text-neutral-950" : "text-neutral-600 hover:bg-neutral-100"}`}>{label}</button>)}<button onClick={exportCsv} className="ml-auto flex items-center gap-2 px-3 text-xs font-medium"><Download className="size-4" />Export saved prices</button></div>
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row"><label className="flex flex-1 items-center gap-2 rounded-md border border-neutral-300 px-3"><Search className="size-4 text-neutral-500" /><input aria-label="Search pricing products" placeholder="Search by product or SKU" value={query} onChange={event => setQuery(event.target.value)} className="h-10 min-w-0 w-full text-sm outline-none" /></label><select aria-label="Filter pricing by category" value={category} onChange={event => setCategory(event.target.value)} className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"><option value="">All categories</option>{categories.map(name => <option key={name}>{name}</option>)}</select></div>
      {selected.length > 0 && <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm"><strong>{selected.length} selected</strong><label className="flex items-center gap-2">Adjust prices by<input aria-label="Percentage price adjustment" type="number" min="-100" max="1000" value={adjustment} onChange={event => setAdjustment(event.target.value)} placeholder="10" className="h-9 w-20 rounded border border-neutral-300 bg-white px-2" />%</label><button disabled={disabled || pending} onClick={applyAdjustment} className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium">Apply to draft</button><button onClick={() => setSelected([])} className="text-xs underline">Clear selection</button><span className="text-xs text-neutral-500">Regular and sale prices change together. Review before saving.</span></div>}
      <p className="border-b border-neutral-200 px-4 py-2 text-[11px] text-neutral-500 lg:hidden">Swipe the table sideways to edit prices, stock and packing.</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[1060px] text-left text-sm"><thead className="bg-neutral-50 text-xs text-neutral-600"><tr><th className="p-3"><input type="checkbox" aria-label="Select all visible products" checked={visible.length > 0 && visible.every(row => selected.includes(row.id))} onChange={event => setSelected(event.target.checked ? visible.map(row => row.id) : [])} /></th><th className="min-w-56 p-3">Product</th><th className="p-3">Regular / carton</th><th className="p-3">Sale / carton</th><th className="p-3">Quote only</th><th className="p-3">Stock</th><th className="p-3">Units / carton</th><th className="p-3">Min. cartons</th></tr></thead><tbody className="divide-y divide-neutral-100">{visible.map(row => {
        const draft = drafts[row.id] ?? toDraft(row);
        return <tr key={row.id} className={drafts[row.id] ? "bg-amber-50/50" : "hover:bg-neutral-50/50"}><td className="p-3"><input type="checkbox" aria-label={`Select ${row.name}`} checked={selected.includes(row.id)} onChange={event => setSelected(current => event.target.checked ? [...current, row.id] : current.filter(id => id !== row.id))} /></td><td className="p-3"><Link href={`/admin/products/${row.id}`} className="font-medium hover:underline">{row.name}</Link><p className="mt-1 text-xs text-neutral-500">{row.sku}</p></td>{(["price", "salePrice"] as const).map(key => <td key={key} className="p-3"><input type="number" step="0.01" min="0" aria-label={`${row.name} ${key === "price" ? "regular price" : "sale price"}`} value={draft[key]} disabled={disabled || pending} onChange={event => edit(row, { [key]: event.target.value })} placeholder={key === "salePrice" ? "No sale" : "0.00"} className={`${inputClass} !mt-0 !h-9 min-w-28 tabular-nums`} /></td>)}<td className="p-3"><input type="checkbox" aria-label={`${row.name} price on request`} checked={draft.priceOnRequest} disabled={disabled || pending} onChange={event => edit(row, { priceOnRequest: event.target.checked })} className="size-4 accent-neutral-800" /></td>{(["stock", "unitsPerCarton", "minimumOrderCartons"] as const).map(key => <td key={key} className="p-3"><input type="number" min={key === "minimumOrderCartons" ? 1 : 0} step="1" aria-label={`${row.name} ${key}`} value={draft[key]} disabled={disabled || pending} onChange={event => edit(row, { [key]: event.target.value })} className={`${inputClass} !mt-0 !h-9 min-w-20 tabular-nums`} /></td>)}</tr>;
      })}</tbody></table>{!visible.length && <p className="p-12 text-center text-sm text-neutral-500">No products match your filters.</p>}</div>
      <div className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">{visible.length} products · All prices in PKR per carton. Leave sale price blank to remove a discount.</div>
    </section>
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white p-4 shadow-lg"><div><p className="text-sm font-medium">{dirtyIds.length ? `${dirtyIds.length} unsaved product${dirtyIds.length === 1 ? "" : "s"}` : "All changes saved"}</p><p className="mt-1 text-xs text-neutral-500">Uncheck “Quote only” to show a price in the shop.</p></div><div className="flex gap-2"><button disabled={!dirtyIds.length || pending} onClick={() => { setDrafts({}); setError(""); }} className="rounded-md border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40">Discard</button><button disabled={disabled || pending || !dirtyIds.length} onClick={save} className={buttonClass}><Save className="size-4" />{pending ? "Saving…" : "Save changes"}</button></div></div>
    {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}{message && <p role="status" className="flex items-center gap-2 rounded-md bg-emerald-50 p-4 text-sm text-emerald-900"><Check className="size-4" />{message}</p>}
  </div>;
}
