"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDown, LoaderCircle, MapPin, Package, Phone, Save } from "lucide-react";
import { EmptyState, panelClass } from "./ui";

export type AdminOrderRow = { id: string; orderNumber: string; customerName: string; customerEmail: string; customerPhone: string; companyName: string; address: string; city: string; paymentMethod: string; paymentStatus: string; total: number | string; status: string; createdAt: string; items: Array<{ name: string; sku: string; quantity: number }> };
export type AdminQuoteRow = { id: string; quoteNumber: string; customerName: string; companyName: string; email: string; phone: string; city: string; notes: string; adminNotes: string; status: string; createdAt: string; items: Array<{ name: string; quantity: number; details: string }> };
const orderStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const quoteStatuses = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"];
const title = (status: string) => status.charAt(0) + status.slice(1).toLowerCase();
const moneyFormatter = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const money = { format: (value: number | string) => typeof value === "string" ? value : moneyFormatter.format(value) };

/** Format a date string consistently to avoid server/client hydration mismatches. */
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

type LocalOrder = {
  id: string;
  orderNumber?: string;
  customer?: { fullName?: string; email?: string; phone?: string; companyName?: string; address?: string; city?: string };
  paymentMethod?: string;
  total?: number;
  requiresQuote?: boolean;
  status?: string;
  createdAt?: string;
  items?: Array<{ product?: { name?: string; sku?: string }; name?: string; quantity?: number }>;
};

type LocalQuote = {
  id: string;
  quoteNumber?: string;
  customerName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  city?: string;
  notes?: string;
  status?: string;
  createdAt?: string;
  items?: Array<{ product?: string; productName?: string; quantity?: number | string; details?: string }>;
};

function subscribeLocalRecords(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("pmh-local-records", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("pmh-local-records", callback);
  };
}

function useLocalRecordJson(key: string) {
  return useSyncExternalStore(subscribeLocalRecords, () => localStorage.getItem(key) || "[]", () => "[]");
}

export function OrdersTable({ initialRows, connected }: { initialRows: AdminOrderRow[]; connected: boolean }) {
  const [serverRows, setServerRows] = useState(initialRows);
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  const localJson = useLocalRecordJson("pmh.orders.v1");
  const localResult = useMemo(() => {
    try {
      const local = JSON.parse(localJson) as LocalOrder[];
      return { rows: local.map((order) => ({
        id: String(order.id), orderNumber: String(order.orderNumber || order.id), customerName: String(order.customer?.fullName || "Guest customer"), customerEmail: String(order.customer?.email || ""), customerPhone: String(order.customer?.phone || ""), companyName: String(order.customer?.companyName || ""), address: String(order.customer?.address || ""), city: String(order.customer?.city || ""), paymentMethod: String(order.paymentMethod || ""), paymentStatus: "LOCAL", total: order.requiresQuote ? "Quote required" : Number(order.total || 0), status: String(order.status || "Pending").toUpperCase(), createdAt: String(order.createdAt || new Date().toISOString()), items: Array.isArray(order.items) ? order.items.map((item) => ({ name: String(item.product?.name || item.name || "Product"), sku: String(item.product?.sku || ""), quantity: Number(item.quantity || 1) })) : [],
      })), error: "" };
    } catch { return { rows: [] as AdminOrderRow[], error: "Browser-local order records could not be read." }; }
  }, [localJson]);
  const rows = connected ? serverRows : localResult.rows;

  async function update(row: AdminOrderRow, status: string) {
    setPending(row.id); setMessage("");
    if (!connected) {
      try {
        const local = JSON.parse(localStorage.getItem("pmh.orders.v1") || "[]") as LocalOrder[];
        const next = local.map((order) => order.id === row.id ? { ...order, status: title(status) } : order);
        localStorage.setItem("pmh.orders.v1", JSON.stringify(next));
        window.dispatchEvent(new Event("pmh-local-records"));
        setMessage("Browser-local development status updated. This is not a server-backed operation.");
      } catch { setMessage("Local status could not be updated."); }
      setPending(""); return;
    }
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(row.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Status could not be updated.");
      setServerRows((current) => current.map((item) => item.id === row.id ? { ...item, status: result.order.status } : item));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Status could not be updated."); }
    setPending("");
  }

  if (!rows.length) return <EmptyState title="No orders found" body={connected ? "Customer orders will appear here as soon as checkout is completed." : "No browser-local development orders exist in this browser."} />;
  return <>{(message || localResult.error) && <p role="status" className="mb-4 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{message || localResult.error}</p>}<div className={`${panelClass} divide-y divide-slate-100 overflow-hidden`}>{rows.map((row) => <details key={row.id} className="group"><summary className="grid cursor-pointer list-none gap-3 p-5 hover:bg-slate-50 sm:grid-cols-[1.1fr_1fr_.7fr_.8fr_auto] sm:items-center"><div><p className="font-bold text-emerald-900">{row.orderNumber}</p><p className="text-xs text-slate-500">{formatDate(row.createdAt)}</p></div><div><p className="font-semibold">{row.customerName}</p><p className="truncate text-xs text-slate-500">{row.customerEmail}</p></div><p className="font-bold">{money.format(row.total)}</p><span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{title(row.status)}</span><ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" /></summary><div className="border-t border-slate-100 bg-slate-50/60 p-5"><div className="grid gap-6 lg:grid-cols-3"><div><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Items</h3><ul className="space-y-2">{row.items.map((item,index) => <li key={`${item.sku}-${index}`} className="flex justify-between gap-3 text-sm"><span><Package className="mr-2 inline size-3.5 text-slate-400" />{item.name}</span><strong>× {item.quantity}</strong></li>)}</ul></div><div className="text-sm"><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Delivery contact</h3><p className="mb-2"><Phone className="mr-2 inline size-3.5 text-slate-400" />{row.customerPhone}</p><p><MapPin className="mr-2 inline size-3.5 text-slate-400" />{row.address}, {row.city}</p></div><div><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Workflow</h3><p className="mb-3 text-xs text-slate-500">{row.paymentMethod.replaceAll("_"," ")} · {row.paymentStatus.replaceAll("_"," ")}. Delivery fee is zero until reviewed and confirmed.</p><label className="text-sm font-semibold">Order status<div className="relative"><select value={row.status} disabled={pending===row.id} onChange={(event) => update(row,event.target.value)} className="mt-1 h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold outline-none focus:border-emerald-700">{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select>{pending===row.id && <LoaderCircle className="absolute right-3 top-4 size-4 animate-spin" />}</div></label></div></div></div></details>)}</div></>;
}

export function QuotesTable({ initialRows, connected }: { initialRows: AdminQuoteRow[]; connected: boolean }) {
  const [serverRows, setServerRows] = useState(initialRows);
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const localJson = useLocalRecordJson("pmh.quotes.v1");
  const localResult = useMemo(() => {
    try {
      const local = JSON.parse(localJson) as LocalQuote[];
      return {
        rows: local.map((quote) => ({
          id: String(quote.id),
          quoteNumber: String(quote.quoteNumber || quote.id),
          customerName: String(quote.customerName || ""),
          companyName: String(quote.companyName || ""),
          email: String(quote.email || ""),
          phone: String(quote.phone || ""),
          city: String(quote.city || ""),
          notes: String(quote.notes || ""),
          adminNotes: "",
          status: String(quote.status || "New").toUpperCase(),
          createdAt: String(quote.createdAt || new Date().toISOString()),
          items: Array.isArray(quote.items)
            ? quote.items.map((item) => ({
                name: String(item.product || item.productName || "Requirement"),
                quantity: Number(item.quantity || 1),
                details: String(item.details || ""),
              }))
            : [],
        })),
        error: "",
      };
    } catch {
      return { rows: [] as AdminQuoteRow[], error: "Browser-local quotation records could not be read." };
    }
  }, [localJson]);

  const rows = connected ? serverRows : localResult.rows;

  function getDraftNotes(row: AdminQuoteRow): string {
    return editingNotes[row.id] ?? row.adminNotes;
  }

  async function updateStatus(row: AdminQuoteRow, status: string) {
    setPending(row.id);
    setMessage("");
    if (!connected) {
      try {
        const local = JSON.parse(localStorage.getItem("pmh.quotes.v1") || "[]") as LocalQuote[];
        localStorage.setItem(
          "pmh.quotes.v1",
          JSON.stringify(local.map((quote) => (quote.id === row.id ? { ...quote, status: title(status) } : quote)))
        );
        window.dispatchEvent(new Event("pmh-local-records"));
        setMessage("Browser-local development status updated. This is not a server-backed operation.");
      } catch {
        setMessage("Local status could not be updated.");
      }
      setPending("");
      return;
    }
    try {
      const response = await fetch(`/api/quotes/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: row.adminNotes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Status could not be updated.");
      setServerRows((current) =>
        current.map((item) => (item.id === row.id ? { ...item, status: result.quote.status, adminNotes: result.quote.adminNotes ?? item.adminNotes } : item))
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status could not be updated.");
    }
    setPending("");
  }

  async function saveNotes(row: AdminQuoteRow) {
    setPending(row.id);
    setMessage("");
    if (!connected) {
      setMessage("Local development mode does not support saving notes.");
      setPending("");
      return;
    }
    const draft = getDraftNotes(row);
    try {
      const response = await fetch(`/api/quotes/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: row.status, adminNotes: draft }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Notes could not be saved.");
      setServerRows((current) =>
        current.map((item) =>
          item.id === row.id ? { ...item, adminNotes: result.quote.adminNotes ?? draft } : item
        )
      );
      setEditingNotes((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      setMessage("Admin notes saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notes could not be saved.");
    }
    setPending("");
  }

  if (!rows.length)
    return (
      <EmptyState
        title="No quotation requests found"
        body={
          connected
            ? "New corporate and bulk enquiries will appear here."
            : "No browser-local development quotation requests exist in this browser."
        }
      />
    );

  return (
    <>
      {(message || localResult.error) && (
        <p role="status" className="mb-4 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">
          {message || localResult.error}
        </p>
      )}
      <div className={`${panelClass} divide-y divide-slate-100 overflow-hidden`}>
        {rows.map((row) => (
          <details key={row.id} className="group">
            <summary className="grid cursor-pointer list-none gap-3 p-5 hover:bg-slate-50 sm:grid-cols-[1fr_1fr_1fr_.7fr_auto] sm:items-center">
              <div>
                <p className="font-bold text-emerald-900">{row.quoteNumber}</p>
                <p className="text-xs text-slate-500">{formatDate(row.createdAt)}</p>
              </div>
              <div>
                <p className="font-semibold">{row.companyName}</p>
                <p className="text-xs text-slate-500">{row.customerName}</p>
              </div>
              <p className="truncate text-sm text-slate-600">
                {row.city} · {row.phone}
              </p>
              <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{title(row.status)}</span>
              <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
            </summary>

            <div className="border-t border-slate-100 bg-slate-50/60 p-5">
              <div className="grid gap-6 lg:grid-cols-3">
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Requirements</h3>
                  <ul className="space-y-2 text-sm">
                    {row.items.map((item, index) => (
                      <li key={index} className="flex justify-between gap-3">
                        <span>{item.name}</span>
                        <strong>× {item.quantity}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm">
                  <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Contact & notes</h3>
                  <p>{row.email}</p>
                  <p>{row.phone}</p>
                  {row.notes && <p className="mt-3 leading-6 text-slate-600">{row.notes}</p>}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold">
                    Quotation status
                    <div className="relative">
                      <select
                        value={row.status}
                        disabled={pending === row.id}
                        onChange={(event) => updateStatus(row, event.target.value)}
                        className="mt-1 h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold outline-none focus:border-emerald-700"
                      >
                        {quoteStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" />
                      {pending === row.id && (
                        <LoaderCircle className="absolute right-3 top-4 size-4 animate-spin" />
                      )}
                    </div>
                  </label>

                  <label className="text-sm font-semibold">
                    Admin notes
                    <textarea
                      rows={4}
                      value={getDraftNotes(row)}
                      onChange={(event) => setEditingNotes((prev) => ({ ...prev, [row.id]: event.target.value }))}
                      placeholder="Internal notes (visible only to admins)…"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-700"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={pending === row.id}
                    onClick={() => saveNotes(row)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                  >
                    <Save className="size-4" />
                    Save notes
                  </button>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
