import Link from "next/link";
import { ArrowRight, Boxes, CircleDollarSign, ShoppingCart, Users } from "lucide-react";
import { OrderStatus, QuoteStatus } from "@prisma/client";
import { products } from "@/lib/catalog";
import { db, isDatabaseConfigured } from "@/lib/db";
import { DemoNotice, EmptyState, PageHeading, panelClass, buttonClass } from "../_components/ui";

const money = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

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
        db.order.aggregate({ where: { status: { not: OrderStatus.CANCELLED }, paymentStatus: "PAID" }, _sum: { total: true } }),
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
    { label: "Paid revenue", value: money.format(data.totalRevenue), icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Products", value: data.totalProducts.toLocaleString(), icon: Boxes, tone: "bg-violet-50 text-violet-700" },
    { label: "Customers", value: data.customers.toLocaleString(), icon: Users, tone: "bg-orange-50 text-orange-700" },
  ];

  return (
    <>
      <PageHeading title="Home" description="Here’s what’s happening with your store." action={<Link href="/admin/products/new" className={buttonClass}>Add product</Link>} />
      {!connected && <DemoNotice />}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Store metrics">
        {metrics.map(({ label, value, icon: Icon }) => <article key={label} className={`${panelClass} p-4 sm:p-5`}><div className="flex items-center justify-between gap-2 text-neutral-500"><p className="text-xs font-medium">{label}</p><Icon className="size-4" /></div><p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-[11px] text-neutral-400">All time</p></article>)}
      </section>
      <section className={`${panelClass} mt-5 overflow-hidden`}>
        <div className="border-b border-neutral-200 px-5 py-4"><h2 className="text-sm font-semibold">Needs your attention</h2><p className="mt-1 text-xs text-neutral-500">Keep orders moving and your catalogue ready to shop.</p></div>
        <div className="divide-y divide-neutral-100">{[
          { count: data.pendingOrders, label: "Orders waiting for confirmation", href: "/admin/orders" },
          { count: data.quotes, label: "Open quotation requests", href: "/admin/quotes" },
          { count: data.lowStock, label: "Products at or below low-stock level", href: "/admin/pricing" },
        ].map(item => <Link key={item.href} href={item.href} className="flex items-center gap-3 px-5 py-3.5 text-[13px] hover:bg-neutral-50"><span className={`grid min-w-7 place-items-center rounded-md px-2 py-1 text-xs font-medium ${item.count ? "bg-amber-100 text-amber-900" : "bg-neutral-100 text-neutral-500"}`}>{item.count}</span><span>{item.label}</span><ArrowRight className="ml-auto size-4 text-neutral-400" /></Link>)}</div>
      </section>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{[
        { title: "Set your prices", body: "Update carton prices and stock in one place.", href: "/admin/pricing" },
        { title: "Organize your catalogue", body: "Manage main categories and subcategories.", href: "/admin/categories" },
        { title: "Store preferences", body: "Contact details, tax and delivery information.", href: "/admin/settings" },
      ].map(item => <Link key={item.href} href={item.href} className={`${panelClass} p-4 hover:border-neutral-400`}><p className="flex items-center justify-between text-sm font-semibold">{item.title}<ArrowRight className="size-4 text-neutral-400" /></p><p className="mt-2 text-xs leading-5 text-neutral-500">{item.body}</p></Link>)}</div>
      <section className={`${panelClass} mt-6 overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-bold">Recent orders</h2><p className="text-xs text-slate-500">Latest activity across the store</p></div><Link href="/admin/orders" className="text-sm font-bold text-emerald-800 hover:underline">View all</Link></div>
        {data.recentOrders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{data.recentOrders.map((order) => <tr key={order.id}><td className="px-5 py-4 font-bold text-emerald-900">{order.orderNumber}</td><td className="px-5 py-4">{order.customerName}</td><td className="px-5 py-4 text-slate-500">{order.createdAt.toLocaleDateString("en-PK")}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{order.status}</span></td><td className="px-5 py-4 text-right font-semibold">{money.format(order.total)}</td></tr>)}</tbody></table></div> : <div className="p-5"><EmptyState title="Your orders will appear here" body="When a customer places an order, you can review it and manage fulfilment from Orders." /></div>}
      </section>
    </>
  );
}
