"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Mail, Phone } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { getPrice } from "@/lib/catalog";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/utils";

export function OrderConfirmationClient({ orderId, mode }: { orderId: string; mode?: string }) {
  const { orders } = useStore();
  const order = orders.find((item) => item.id === orderId);
  const isDevelopment = mode === "development" || orderId.startsWith("DEV-ORD");

  if (!orderId || (mode !== "server" && mode !== "development")) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <AlertTriangle aria-hidden="true" className="mx-auto size-12 text-amber-700" />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">No verified order result</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">This page was opened without a valid checkout result. It does not confirm that an order was placed.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/cart" className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white">Return to cart</Link><Link href="/shop" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800">Browse products</Link></div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-emerald-800 px-6 py-9 text-center text-white sm:px-10">
        <CheckCircle2 aria-hidden="true" className="mx-auto size-14" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-100">Order request received</p>
        <h1 className="mt-2 text-3xl font-bold">Thank you for your order</h1>
        <p className="mt-3 text-emerald-50">Reference: <span className="font-bold">{orderId || "Unavailable"}</span></p>
      </div>
      <div className="p-6 sm:p-10">
        {isDevelopment ? (
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900" role="status">
            <AlertTriangle aria-hidden="true" className="mt-1 size-5 shrink-0" />
            <p><strong>Development mode fallback:</strong> the database/API was unavailable, so this request is saved only in this browser. It has not reached a shared order system and should not be treated as a live confirmed order.</p>
          </div>
        ) : null}
        <h2 className="text-xl font-bold text-slate-950">What happens next?</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 sm:grid-cols-3">
          <li className="rounded-2xl bg-slate-50 p-4"><span className="block font-bold text-emerald-800">1. Review</span>We verify the submitted products and quantities.</li>
          <li className="rounded-2xl bg-slate-50 p-4"><span className="block font-bold text-emerald-800">2. Confirmation</span>We confirm availability, delivery coverage, charges and final total.</li>
          <li className="rounded-2xl bg-slate-50 p-4"><span className="block font-bold text-emerald-800">3. Fulfilment</span>Your order proceeds only after those details are agreed.</li>
        </ol>
        {order ? (
          <div className="mt-7 rounded-2xl border border-slate-200 p-5">
            <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold text-slate-950">Submitted products</h2><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{order.status}</span></div>
            <ul className="mt-4 space-y-3 border-b border-slate-200 pb-4">
              {order.items.map(({ product, quantity }) => <li key={product.id} className="flex justify-between gap-4 text-sm"><span className="text-slate-600">{product.name} × {quantity} carton{quantity === 1 ? "" : "s"}</span><span className="font-semibold text-slate-950">{product.priceOnRequest ? "Quote required" : formatPrice(getPrice(product) * quantity)}</span></li>)}
            </ul>
            <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-slate-600">Wholesale carton pricing</dt><dd className="font-bold text-slate-950">{order.items.some(({ product }) => product.priceOnRequest) ? "Final quote required" : formatPrice(order.subtotal)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Packing, delivery and final payable total</dt><dd className="text-right font-semibold text-amber-700">Confirmed after review</dd></div></dl>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Detailed order information is not available in this browser. Keep the reference above when contacting us.</p>
        )}
        <div className="mt-7 flex flex-col gap-3 rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold">Questions about your request?</span>
          <span className="flex flex-wrap gap-4"><a className="inline-flex items-center gap-2 font-semibold hover:underline" href={`tel:${company.phoneHref}`}><Phone aria-hidden="true" className="size-4" />{company.phone}</a><a className="inline-flex items-center gap-2 font-semibold hover:underline" href={`mailto:${company.email}`}><Mail aria-hidden="true" className="size-4" />Email us</a></span>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/shop" className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900">Continue shopping</Link><Link href="/account" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">View account & orders</Link></div>
      </div>
    </section>
  );
}
