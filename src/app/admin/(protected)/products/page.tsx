import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { products as seedProducts } from "@/lib/catalog";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
import { DemoNotice, EmptyState, PageHeading, panelClass, buttonClass } from "../../_components/ui";
import { ProductActions } from "../../_components/product-actions";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let connected = isDatabaseConfigured;
  let products: Array<{ id: string; name: string; sku: string; category: string; price: number; salePrice: number | null; priceOnRequest: boolean; unitsPerCarton: number; minimumOrderCartons: number; stock: number; threshold: number; status: string }> = [];
  if (connected) {
    try {
      const qWords = q.trim().split(/\s+/).filter(Boolean).slice(0, 5);
      const whereClause = qWords.length
        ? {
            AND: qWords.map((word) => ({
              OR: [
                { name: { contains: word, mode: "insensitive" as const } },
                { sku: { contains: word, mode: "insensitive" as const } },
                { category: { name: { contains: word, mode: "insensitive" as const } } },
                { brand: { name: { contains: word, mode: "insensitive" as const } } },
              ],
            })),
          }
        : undefined;

      const rows = await withDatabaseRetry(() =>
        db.product.findMany({
          where: whereClause,
          orderBy: { updatedAt: "desc" },
          take: 100,
          include: { category: { select: { name: true } } },
        })
      );
      products = rows.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category?.name || "General",
        price: Number(item.price),
        salePrice: item.salePrice == null ? null : Number(item.salePrice),
        priceOnRequest: item.priceOnRequest,
        unitsPerCarton: item.unitsPerCarton,
        minimumOrderCartons: item.minimumOrderCartons,
        stock: item.stock,
        threshold: item.lowStockThreshold,
        status: item.status,
      }));
    } catch (error) {
      console.error("Failed to load products from database in admin:", error);
      connected = false;
    }
  }
  if (!connected) {
    const qWords = q.toLowerCase().split(/\s+/).filter(Boolean);
    products = seedProducts
      .filter((item) => {
        if (!qWords.length) return true;
        const text = `${item.name} ${item.sku} ${item.category} ${item.brand || ""}`.toLowerCase();
        return qWords.every((word) => text.includes(word));
      })
      .map((item) => ({ id: item.id, name: item.name, sku: item.sku, category: item.category, price: item.price, salePrice: item.salePrice ?? null, priceOnRequest: item.priceOnRequest, unitsPerCarton: item.unitsPerCarton, minimumOrderCartons: item.minimumOrderCartons, stock: item.stock, threshold: item.lowStockThreshold, status: "DEMO" }));
  }


  return (
    <>
      <PageHeading eyebrow="Catalogue" title="Products" description="Manage pricing, visibility, flexible specifications, and inventory levels." action={<div className="flex gap-2"><Link href="/admin/pricing" className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-surface px-3 text-[13px] font-medium">Edit prices & stock</Link><Link href="/admin/products/new" className={buttonClass}><Plus className="size-4" />Add product</Link></div>} />
      {!connected && <DemoNotice />}
      <form className="mb-5 flex max-w-md items-center rounded-xl border border-line bg-surface px-3 shadow-sm focus-within:border-focus">
        <Search className="size-4 text-muted" /><input name="q" defaultValue={q} placeholder="Search name or SKU" className="h-11 min-w-0 flex-1 px-3 text-sm outline-none" /><button className="text-xs font-bold text-accent">Search</button>
      </form>
      <section className={`${panelClass} overflow-hidden`}>
        {products.length ? <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Pricing (Ctn / Piece)</th><th className="px-5 py-3">Stock cartons</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-line">{products.map((product) => {
          const effective = product.salePrice ?? product.price;
          const pieceRate = product.unitsPerCarton > 0 && effective > 0 ? (effective / product.unitsPerCarton).toFixed(2) : null;
          return (
            <tr key={product.id} className="hover:bg-surface-soft/70">
              <td className="px-5 py-4">
                <p className="font-bold text-content">{product.name}</p>
                <p className="mt-0.5 text-xs text-muted">{product.sku} · {product.unitsPerCarton > 0 ? `${product.unitsPerCarton} pcs/ctn · ` : ""}MOQ {product.minimumOrderCartons} ctn</p>
              </td>
              <td className="px-5 py-4 text-secondary">{product.category}</td>
              <td className="px-5 py-4">
                {product.priceOnRequest ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Quote on request
                  </span>
                ) : (
                  <div>
                    <span className="font-bold text-content">{money.format(effective)} <span className="text-[11px] font-normal text-muted">/ ctn</span></span>
                    {product.salePrice != null && <span className="ml-2 text-xs text-muted line-through">{money.format(product.price)}</span>}
                    {pieceRate && product.unitsPerCarton > 1 && (
                      <p className="mt-0.5 text-xs font-bold text-red-700 dark:text-red-400">
                        ₨ {pieceRate} <span className="text-[10px] font-normal text-muted">/ pc</span>
                      </p>
                    )}
                  </div>
                )}
              </td>
              <td className="px-5 py-4">
                <span className={`font-bold ${product.stock <= product.threshold ? "text-danger" : "text-content"}`}>{product.stock}</span>
                {product.stock <= product.threshold && <span className="ml-2 rounded-full bg-danger-soft px-2 py-1 text-[10px] font-bold uppercase text-danger">Low</span>}
              </td>
              <td className="px-5 py-4"><span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-bold text-secondary">{product.status}</span></td>
              <td className="px-5 py-4"><ProductActions id={product.id} stock={product.stock} status={product.status} disabled={!connected} /></td>
            </tr>
          );
        })}</tbody></table></div> : <div className="p-5"><EmptyState title="No products found" body="Try a different search or add the first product." /></div>}
      </section>
    </>
  );
}
