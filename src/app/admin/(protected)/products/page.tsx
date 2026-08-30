import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { products as seedProducts } from "@/lib/catalog";
import { db, isDatabaseConfigured } from "@/lib/db";
import { DemoNotice, EmptyState, PageHeading, panelClass } from "../../_components/ui";
import { ProductActions } from "../../_components/product-actions";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let connected = isDatabaseConfigured;
  let products: Array<{ id: string; name: string; sku: string; category: string; price: number; salePrice: number | null; priceOnRequest: boolean; minimumOrderCartons: number; stock: number; threshold: number; status: string }> = [];
  if (connected) {
    try {
      const rows = await db.product.findMany({
        where: q ? { OR: [{ name: { contains: q.slice(0, 100), mode: "insensitive" } }, { sku: { contains: q.slice(0, 100), mode: "insensitive" } }] } : undefined,
        orderBy: { updatedAt: "desc" },
        take: 100,
        include: { category: { select: { name: true } } },
      });
      products = rows.map((item) => ({ id: item.id, name: item.name, sku: item.sku, category: item.category.name, price: Number(item.price), salePrice: item.salePrice == null ? null : Number(item.salePrice), priceOnRequest: item.priceOnRequest, minimumOrderCartons: item.minimumOrderCartons, stock: item.stock, threshold: item.lowStockThreshold, status: item.status }));
    } catch {
      connected = false;
    }
  }
  if (!connected) {
    products = seedProducts.filter((item) => !q || `${item.name} ${item.sku}`.toLowerCase().includes(q.toLowerCase())).map((item) => ({ id: item.id, name: item.name, sku: item.sku, category: item.category, price: item.price, salePrice: item.salePrice ?? null, priceOnRequest: item.priceOnRequest, minimumOrderCartons: item.minimumOrderCartons, stock: item.stock, threshold: item.lowStockThreshold, status: "DEMO" }));
  }

  return (
    <>
      <PageHeading eyebrow="Catalogue" title="Products" description="Manage pricing, visibility, flexible specifications, and inventory levels." action={<Link href="/admin/products/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-900 px-4 text-sm font-bold text-white hover:bg-emerald-800"><Plus className="size-4" />Add product</Link>} />
      {!connected && <DemoNotice />}
      <form className="mb-5 flex max-w-md items-center rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-emerald-700">
        <Search className="size-4 text-slate-400" /><input name="q" defaultValue={q} placeholder="Search name or SKU" className="h-11 min-w-0 flex-1 px-3 text-sm outline-none" /><button className="text-xs font-bold text-emerald-800">Search</button>
      </form>
      <section className={`${panelClass} overflow-hidden`}>
        {products.length ? <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Carton price</th><th className="px-5 py-3">Stock cartons</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{products.map((product) => <tr key={product.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-bold text-slate-900">{product.name}</p><p className="mt-0.5 text-xs text-slate-500">{product.sku} · MOQ {product.minimumOrderCartons} carton{product.minimumOrderCartons === 1 ? "" : "s"}</p></td><td className="px-5 py-4 text-slate-600">{product.category}</td><td className="px-5 py-4"><span className="font-semibold">{product.priceOnRequest ? "On request" : money.format(product.salePrice ?? product.price)}</span>{!product.priceOnRequest && product.salePrice != null && <span className="ml-2 text-xs text-slate-400 line-through">{money.format(product.price)}</span>}</td><td className="px-5 py-4"><span className={`font-bold ${product.stock <= product.threshold ? "text-red-700" : "text-slate-800"}`}>{product.stock}</span>{product.stock <= product.threshold && <span className="ml-2 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-700">Low</span>}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{product.status}</span></td><td className="px-5 py-4"><ProductActions id={product.id} disabled={!connected} /></td></tr>)}</tbody></table></div> : <div className="p-5"><EmptyState title="No products found" body="Try a different search or add the first product." /></div>}
      </section>
    </>
  );
}
