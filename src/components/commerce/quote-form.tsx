"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { persistQuote } from "@/components/providers/store-provider";
import { products } from "@/lib/catalog";
import type { QuoteItem, QuoteRequest } from "@/lib/types";
import { createReference } from "@/lib/utils";
import { trackStorefrontEvent } from "@/lib/analytics";

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

type QuoteLine = QuoteItem & { key: string };
type Success = { id: string; development: boolean };

const newLine = (): QuoteLine => ({
  key: Math.random().toString(36).slice(2),
  product: "",
  quantity: 1,
});

function allowsDevelopmentFallback(status: number) {
  return status === 404 || status === 501;
}

async function parseResponse(response: Response) {
  try {
    const value: unknown = await response.json();
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {} as Record<string, unknown>;
  }
}

export function QuoteForm({ initialProduct = "" }: { initialProduct?: string }) {
  const [items, setItems] = useState<QuoteLine[]>([
    { ...newLine(), product: initialProduct },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Success | null>(null);

  const updateItem = (key: string, field: "product" | "quantity", value: string) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: field === "quantity" ? Math.max(1, Math.floor(Number(value) || 0)) : value } : item)),
    );
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const requestedItems = items
      .map(({ product, quantity }) => ({ product: product.trim(), quantity }))
      .filter((item) => item.product && Number(item.quantity) > 0);
    if (requestedItems.length === 0) {
      setError("Add at least one product and a valid carton quantity.");
      return;
    }

    const formData = new FormData(form);
    const base = {
      customerName: String(formData.get("customerName") ?? "").trim(),
      companyName: String(formData.get("companyName") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      items: requestedItems,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    };

    setSubmitting(true);
    setError("");
    setSuccess(null);

    const complete = (id: string, createdAt: string, development: boolean) => {
      const quote: QuoteRequest = {
        id,
        ...base,
        status: "New",
        createdAt,
      };
      const stored = persistQuote(quote);
      if (development && !stored) {
        setError("Development fallback could not save this request in browser storage. Nothing was submitted or recorded. Please contact us directly or enable browser storage and try again.");
        setSubmitting(false);
        return;
      }
      form.reset();
      setItems([newLine()]);
      setSuccess({ id, development });
      if (!development) trackStorefrontEvent("generate_lead", { currency: "PKR", lead_source: "quote_form", items_requested: requestedItems.length });
      setSubmitting(false);
    };

    const developmentFallback = () =>
      complete(createReference("DEV-QUOTE"), new Date().toISOString(), true);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(base),
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        if (process.env.NODE_ENV === "development" && allowsDevelopmentFallback(response.status)) {
          developmentFallback();
          return;
        }
        const message =
          typeof data.error === "string"
            ? data.error
            : "We could not submit your quotation request. Please review the form and try again.";
        throw new Error(message);
      }

      const serverQuote =
        data.quote && typeof data.quote === "object"
          ? (data.quote as Record<string, unknown>)
          : data;
      const id =
        (typeof serverQuote.quoteNumber === "string" && serverQuote.quoteNumber) ||
        (typeof serverQuote.id === "string" && serverQuote.id) ||
        createReference("QUOTE");
      const createdAt =
        typeof serverQuote.createdAt === "string"
          ? serverQuote.createdAt
          : new Date().toISOString();
      complete(id, createdAt, false);
    } catch (submissionError) {
      if (process.env.NODE_ENV === "development" && submissionError instanceof TypeError) {
        developmentFallback();
        return;
      }
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The quotation request could not be submitted. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-800">Customer name <span aria-hidden="true" className="text-red-600">*</span>
          <input className={inputClass} name="customerName" autoComplete="name" required maxLength={100} />
        </label>
        <label className="text-sm font-semibold text-slate-800">Company name <span aria-hidden="true" className="text-red-600">*</span>
          <input className={inputClass} name="companyName" autoComplete="organization" required maxLength={160} />
        </label>
        <label className="text-sm font-semibold text-slate-800">Phone <span aria-hidden="true" className="text-red-600">*</span>
          <input className={inputClass} name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} pattern="[+0-9][0-9 \(\)\-]{7,19}" placeholder="03XX XXXXXXX" />
        </label>
        <label className="text-sm font-semibold text-slate-800">Email <span aria-hidden="true" className="text-red-600">*</span>
          <input className={inputClass} name="email" type="email" autoComplete="email" required maxLength={160} />
        </label>
        <label className="text-sm font-semibold text-slate-800 sm:col-span-2">Delivery city <span aria-hidden="true" className="text-red-600">*</span>
          <input className={inputClass} name="city" autoComplete="address-level2" required maxLength={100} />
        </label>
      </div>

      <fieldset className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><legend className="text-lg font-bold text-slate-950">Requested products</legend><p className="mt-1 text-sm text-slate-600">Add each item separately and enter the required number of cartons.</p></div>
          <button type="button" onClick={() => setItems((current) => [...current, newLine()])} className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"><Plus aria-hidden="true" className="size-4" /> Add product</button>
        </div>
        <datalist id="quote-product-options">
          {products.map((product) => <option key={product.id} value={product.name} />)}
        </datalist>
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div key={item.key} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end">
              <label className="text-sm font-semibold text-slate-800">Product or requirement {index + 1}<span className="sr-only">, required</span>
                <input className={inputClass} list="quote-product-options" value={item.product} onChange={(event) => updateItem(item.key, "product", event.target.value)} required maxLength={180} placeholder="Select or type a product" />
              </label>
              <label className="text-sm font-semibold text-slate-800">Required cartons
                <input className={inputClass} type="number" inputMode="numeric" min="1" max="999999" step="1" value={item.quantity} onChange={(event) => updateItem(item.key, "quantity", event.target.value)} required />
              </label>
              <button type="button" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((line) => line.key !== item.key))} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Remove requested product ${index + 1}`}><Trash2 aria-hidden="true" className="size-4" /><span className="sm:sr-only">Remove</span></button>
            </div>
          ))}
        </div>
      </fieldset>

      <label className="mt-6 block text-sm font-semibold text-slate-800">Additional requirements <span className="font-normal text-slate-500">(optional)</span>
        <textarea className={`${inputClass} min-h-32 resize-y`} name="notes" maxLength={2000} placeholder="Pack sizes, usage, delivery location details, or other requirements" />
      </label>

      {error ? <div className="mt-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{error}</div> : null}
      {success ? <div className={`mt-5 flex gap-3 rounded-xl border p-4 text-sm leading-6 ${success.development ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} role="status"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><p>{success.development ? <><strong>Development mode fallback:</strong> saved only in this browser as <strong>{success.id}</strong> because the database/API is unavailable. It has not reached a shared quotation system.</> : <><strong>Quotation request received.</strong> Keep reference <strong>{success.id}</strong>. Our team will review the requirements and contact you.</>}</p></div> : null}

      <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">Submitting this form does not confirm pricing, stock, delivery, or a contract.</p>
        <button type="submit" disabled={submitting} className="commerce-button commerce-button-primary inline-flex shrink-0 items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60">{submitting ? <><Loader2 aria-hidden="true" className="size-4 animate-spin" /> Sending…</> : "Send quote request"}</button>
      </div>
    </form>
  );
}
