import Link from "next/link";
import { AlertTriangle, Boxes, CircleDollarSign, FileClock, PackageCheck, ShoppingCart, Users } from "lucide-react";
import { OrderStatus, QuoteStatus } from "@prisma/client";
import { categories, products } from "@/lib/catalog";
import { db, isDatabaseConfigured } from "@/lib/db";
import { DemoNotice, EmptyState, PageHeading, panelClass } from "../_components/ui";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

export default async function AdminDashboard() {
  let connected = isDatabaseConfigured;
  let data = {
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: products.length,
    customers: 0,
    pendingOrders: 0,
    lowStock: products.filter((item) => item.stock <= item.lowStockThreshold).length,
    quotes: 0,
    recentOrders: [] as Array<{ id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: Date }>,
  };

  if (connected) {
    try {
      const [orderCount, revenue, productRows, customerCount, pendingOrders, quoteCount, recentOrders] = await db.$transaction([
        db.order.count(),
        db.order.aggregate({ where: { status: { not: OrderStatus.CANCELLED } }, _sum: { total: true } }),
        db.product.findMany({ where: { status: { not: "ARCHIVED" } }, select: { stock: true, lowStockThreshold: true } }),
        db.user.count({ where: { role: "CUSTOMER" } }),
        db.order.count({ where: { status: OrderStatus.PENDING } }),
        db.quoteRequest.count({ where: { status: { in: [QuoteStatus.NEW, QuoteStatus.CONTACTED] } } }),
        db.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true } }),
      ]);
      data = {
        totalOrders: orderCount,
        totalRevenue: Number(revenue._sum.total || 0),
        totalProducts: productRows.length,
        customers: customerCount,
        pendingOrders,
        lowStock: productRows.filter((item) => item.stock <= item.lowStockThreshold).length,
        quotes: quoteCount,
        recentOrders: recentOrders.map((order) => ({ ...order, total: Number(order.total) })),
      };
    } catch {
      connected = false;
    }
  }

  const metrics = [
    { label: "Total orders", value: data.totalOrders.toLocaleString(), icon: ShoppingCart, tone: "bg-sky-50 text-sky-700" },
    { label: "Revenue", value: money.format(data.totalRevenue), icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Products", value: data.totalProducts.toLocaleString(), icon: Boxes, tone: "bg-violet-50 text-violet-700" },
    { label: "Customers", value: data.customers.toLocaleString(), icon: Users, tone: "bg-orange-50 text-orange-700" },
    { label: "Pending orders", value: data.pendingOrders.toLocaleString(), icon: PackageCheck, tone: "bg-amber-50 text-amber-700" },
    { label: "Low stock", value: data.lowStock.toLocaleString(), icon: AlertTriangle, tone: "bg-red-50 text-red-700" },
    { label: "Open quotes", value: data.quotes.toLocaleString(), icon: FileClock, tone: "bg-teal-50 text-teal-700" },
  ];

  return (
    <>
      <PageHeading eyebrow="Control centre" title="Store overview" description="Monitor orders, enquiries, customers, and stock from one focused workspace." action={<Link href="/admin/products/new" className="inline-flex h-11 items-center rounded-xl bg-emerald-900 px-4 text-sm font-bold text-white hover:bg-emerald-800">Add product</Link>} />
      {!connected && <DemoNotice />}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store metrics">
        {metrics.map(({ label, value, icon: Icon, tone }) => <article key={label} className={`${panelClass} p-5`}><div className={`mb-5 grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div><p className="text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></article>)}
      </section>
      <section className={`${panelClass} mt-6 overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-bold">Recent orders</h2><p className="text-xs text-slate-500">Latest activity across the store</p></div><Link href="/admin/orders" className="text-sm font-bold text-emerald-800 hover:underline">View all</Link></div>
        {data.recentOrders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{data.recentOrders.map((order) => <tr key={order.id}><td className="px-5 py-4 font-bold text-emerald-900">{order.orderNumber}</td><td className="px-5 py-4">{order.customerName}</td><td className="px-5 py-4 text-slate-500">{order.createdAt.toLocaleDateString("en-PK")}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{order.status}</span></td><td className="px-5 py-4 text-right font-semibold">{money.format(order.total)}</td></tr>)}</tbody></table></div> : <div className="p-5"><EmptyState title="No server-backed orders yet" body={connected ? "New customer orders will appear here." : `Connect PostgreSQL and seed the ${categories.length} demo categories to begin testing persistent order operations.`} /></div>}
      </section>
    </>
  );
}
