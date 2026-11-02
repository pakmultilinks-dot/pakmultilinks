"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Building2, Loader2, LockKeyhole, PackageCheck } from "lucide-react";
import { persistOrder, useStore } from "@/components/providers/store-provider";
import type { CustomerDetails, Order } from "@/lib/types";
import { createReference, formatPrice, MINIMUM_ORDER_AMOUNT } from "@/lib/utils";

const inputClass =
  "mt-2 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-content outline-none transition placeholder:text-muted focus:border-focus focus:ring-4 focus:ring-focus";

const fallbackStatus = (status: number) =>
  status === 404 || status === 501;

async function responseData(response: Response): Promise<Record<string, unknown>> {
  try {
    const data: unknown = await response.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function errorMessage(data: Record<string, unknown>, fallback: string) {
  return typeof data.error === "string" && data.error.trim() ? data.error : fallback;
}

export function CheckoutForm({ initialCustomer = {} }: { initialCustomer?: Partial<CustomerDetails> }) {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bankTransferEnabled, setBankTransferEnabled] = useState(false);
  const hasQuotePricing = cart.some(({ product }) => product.priceOnRequest);
  const belowMinOrder = !hasQuotePricing && subtotal < MINIMUM_ORDER_AMOUNT;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings/public", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.settings?.bankTransferEnabled) setBankTransferEnabled(true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || cart.length === 0) return;

    if (belowMinOrder) {
      setError(`Orders under ${formatPrice(MINIMUM_ORDER_AMOUNT)} cannot be placed. Current order value is ${formatPrice(subtotal)}. Please add more cartons.`);
      return;
    }

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const customer: CustomerDetails = {
      fullName: String(values.get("fullName") ?? "").trim(),
      phone: String(values.get("phone") ?? "").trim(),
      email: String(values.get("email") ?? "").trim(),
      companyName: String(values.get("companyName") ?? "").trim() || undefined,
      ntn: String(values.get("ntn") ?? "").trim() || undefined,
      province: String(values.get("province") ?? "").trim(),
      city: String(values.get("city") ?? "").trim(),
      address: String(values.get("address") ?? "").trim(),
      postalCode: String(values.get("postalCode") ?? "").trim() || undefined,
      notes: String(values.get("notes") ?? "").trim() || undefined,
    };
    const paymentMethod = (String(values.get("paymentMethod") ?? "Cash on Delivery") as "Cash on Delivery" | "Bank Transfer");
    const payload = {
      customer,
      paymentMethod,
      items: cart.map(({ product, quantity, variantId }) => ({
        productId: product.id,
        variantId: variantId || undefined,
        quantity,
      })),
    };

    setSubmitting(true);
    setError("");

    const complete = (order: Order, mode: "server" | "development") => {
      const stored = persistOrder(order);
      if (mode === "development" && !stored) {
        setError("Development fallback could not save this order in browser storage. Nothing was submitted or recorded. Please contact us directly or enable browser storage and try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      const query = new URLSearchParams({ order: order.id, mode });
      router.push(`/order-confirmation?${query.toString()}`);
    };

    const developmentFallback = () => {
      const order: Order = {
        id: createReference("DEV-ORD"),
        items: cart,
        customer,
        paymentMethod,
        subtotal,
        delivery: null,
        total: subtotal,
        requiresQuote: hasQuotePricing,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };
      complete(order, "development");
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await responseData(response);

      if (!response.ok) {
        if (process.env.NODE_ENV === "development" && fallbackStatus(response.status)) {
          developmentFallback();
          return;
        }
        if (process.env.NODE_ENV === "development" && response.status >= 500) {
          console.warn("[Checkout] Server error:", response.status, data);
        }
        throw new Error(errorMessage(data, "We could not place the order. Please review your details and try again."));
      }

      const serverOrder =
        data.order && typeof data.order === "object"
          ? (data.order as Record<string, unknown>)
          : data;
      const reference =
        (typeof serverOrder.orderNumber === "string" && serverOrder.orderNumber) ||
        (typeof serverOrder.id === "string" && serverOrder.id) ||
        createReference("ORD");
      const serverTotal = Number(serverOrder.total);
      const order: Order = {
        id: reference,
        items: cart,
        customer,
        paymentMethod,
        subtotal,
        delivery: null,
        total: Number.isFinite(serverTotal) ? serverTotal : subtotal,
        requiresQuote: Boolean(serverOrder.requiresQuote),
        status: "Pending",
        createdAt:
          typeof serverOrder.createdAt === "string"
            ? serverOrder.createdAt
            : new Date().toISOString(),
      };
      complete(order, "server");
    } catch (submissionError) {
      if (
        process.env.NODE_ENV === "development" &&
        submissionError instanceof TypeError
      ) {
        developmentFallback();
        return;
      }
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The order could not be submitted. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <section className="rounded-3xl border border-line bg-surface p-8 text-center shadow-sm sm:p-12">
        <PackageCheck aria-hidden="true" className="mx-auto size-12 text-accent" />
        <h2 className="mt-4 text-2xl font-bold text-content">Your cart is empty</h2>
        <p className="mt-2 text-secondary">Add products before starting checkout.</p>
        <Link href="/shop" className="commerce-button commerce-button-primary mt-6 inline-flex items-center">
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-7" aria-labelledby="delivery-heading">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent"><Building2 aria-hidden="true" className="size-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step 1</p>
              <h2 id="delivery-heading" className="text-xl font-bold text-content">Contact and delivery details</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-content">Full name <span aria-hidden="true" className="text-danger">*</span>
              <input className={inputClass} name="fullName" autoComplete="name" required maxLength={100} defaultValue={initialCustomer.fullName || ""} />
            </label>
            <label className="text-sm font-semibold text-content">Phone <span aria-hidden="true" className="text-danger">*</span>
              <input className={inputClass} name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} pattern="[+0-9][0-9 \(\)\-]{7,19}" placeholder="03XX XXXXXXX" defaultValue={initialCustomer.phone || ""} />
            </label>
            <label className="text-sm font-semibold text-content">Email <span aria-hidden="true" className="text-danger">*</span>
              <input className={inputClass} name="email" type="email" autoComplete="email" required maxLength={160} defaultValue={initialCustomer.email || ""} />
            </label>
            <label className="text-sm font-semibold text-content">Company / organization <span aria-hidden="true" className="text-danger">*</span>
              <input className={inputClass} name="companyName" autoComplete="organization" required maxLength={160} defaultValue={initialCustomer.companyName || ""} />
            </label>
            <label className="text-sm font-semibold text-content">NTN <span className="font-normal text-muted">(optional)</span><input className={inputClass} name="ntn" maxLength={30} /></label>
            <label className="text-sm font-semibold text-content">Province / territory <span aria-hidden="true" className="text-danger">*</span>
              <select className={inputClass} name="province" autoComplete="address-level1" required defaultValue={initialCustomer.province || ""}>
                <option value="" disabled>Select province or territory</option>
                <option>Punjab</option><option>Sindh</option><option>Khyber Pakhtunkhwa</option><option>Balochistan</option><option>Islamabad Capital Territory</option><option>Gilgit-Baltistan</option><option>Azad Jammu and Kashmir</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-content">City <span aria-hidden="true" className="text-danger">*</span>
              <input className={inputClass} name="city" autoComplete="address-level2" required maxLength={100} defaultValue={initialCustomer.city || ""} />
            </label>
            <label className="text-sm font-semibold text-content sm:col-span-2">Full address <span aria-hidden="true" className="text-danger">*</span>
              <textarea className={`${inputClass} min-h-28 resize-y`} name="address" autoComplete="street-address" required maxLength={500} defaultValue={initialCustomer.address || ""} />
            </label>
            <label className="text-sm font-semibold text-content">Postal code <span className="font-normal text-muted">(optional)</span>
              <input className={inputClass} name="postalCode" autoComplete="postal-code" maxLength={20} placeholder="e.g. 54000" defaultValue={initialCustomer.postalCode || ""} />
            </label>
            <label className="text-sm font-semibold text-content sm:col-span-2">Order notes <span className="font-normal text-muted">(optional)</span>
              <textarea className={`${inputClass} min-h-24 resize-y`} name="notes" maxLength={1000} placeholder="Access instructions, preferred contact time, or other requirements" />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-7" aria-labelledby="payment-heading">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent"><LockKeyhole aria-hidden="true" className="size-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step 2</p>
              <h2 id="payment-heading" className="text-xl font-bold text-content">Payment method</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <label className="flex items-center gap-3 rounded-xl border border-line p-4 has-[:checked]:border-focus has-[:checked]:bg-accent-soft transition cursor-pointer">
              <input type="radio" name="paymentMethod" value="Cash on Delivery" defaultChecked className="accent-focus" />
              <div>
                <p className="font-semibold text-content">Cash on Delivery</p>
                <p className="text-xs text-muted">Pay when your order arrives</p>
              </div>
            </label>
            {bankTransferEnabled && (
              <label className="flex items-center gap-3 rounded-xl border border-line p-4 has-[:checked]:border-focus has-[:checked]:bg-accent-soft transition cursor-pointer">
                <input type="radio" name="paymentMethod" value="Bank Transfer" className="accent-focus" />
                <div>
                  <p className="font-semibold text-content">Bank Transfer</p>
                  <p className="text-xs text-muted">Transfer before dispatch</p>
                </div>
              </label>
            )}
          </div>
        </section>

      </div>

      <aside className="rounded-3xl border border-line bg-surface p-6 shadow-sm lg:sticky lg:top-28">
        <h2 className="text-xl font-bold text-content">Review order</h2>
        <ul className="mt-5 space-y-4 border-b border-line pb-5">
          {cart.map(({ product, quantity, variantId, variantLabel, variantPrice }) => {
            const unitPrice = variantPrice ?? (product.salePrice ?? product.price);
            return (
              <li key={`${product.id}:${variantId || ""}`} className="flex justify-between gap-4 text-sm">
                <span className="text-secondary">
                  <span className="font-medium text-content">{product.name}</span>
                  {variantLabel && (
                    <span className="ml-1 text-xs font-semibold text-accent">({variantLabel})</span>
                  )}
                  {" "}× {quantity} carton{quantity === 1 ? "" : "s"}
                </span>
                <span className="shrink-0 font-semibold text-content">
                  {product.priceOnRequest ? "Quote required" : formatPrice(unitPrice * quantity)}
                </span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-secondary">Carton pricing</dt><dd className="font-bold text-content">{hasQuotePricing ? "Final quote required" : formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-secondary">Delivery charge</dt><dd className="max-w-40 text-right font-semibold text-warning">Confirmed after review</dd></div>
          <div className="flex justify-between gap-3 border-t border-line pt-4"><dt className="font-bold text-content">Final payable total</dt><dd className="font-bold text-content">To be confirmed</dd></div>
        </dl>
        <p className="mt-4 rounded-xl bg-warning-soft p-3 text-xs leading-5 text-warning">Delivery coverage, charges, stock and the final total are not assumed. We will confirm them before fulfilment.</p>
        {belowMinOrder && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-bold">⚠️ Minimum Order Value is PKR 5,000</p>
            <p className="mt-1">
              Current order subtotal is <strong>{formatPrice(subtotal)}</strong>. Wholesale order place karne ke liye kam az kam <strong>PKR 5,000</strong> ka order hona lazmi hai. Please return to your cart and add more items.
            </p>
          </div>
        )}
        {error ? <div className="mt-4 flex gap-2 rounded-xl border border-danger-line bg-danger-soft p-3 text-sm text-danger" role="alert"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{error}</div> : null}
        <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-secondary"><input type="checkbox" required className="mt-1 accent-focus" /><span>I confirm that these details are correct and agree to the <Link href="/terms" className="font-semibold text-accent hover:underline">terms and conditions</Link>.</span></label>
        <button type="submit" disabled={submitting || belowMinOrder} className="commerce-button commerce-button-primary mt-5 inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? <><Loader2 aria-hidden="true" className="size-4 animate-spin" /> Submitting request…</> : <><LockKeyhole aria-hidden="true" className="size-4" /> Submit bulk order request</>}
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-muted">This does not process an online payment.</p>
        <Link href="/cart" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-accent hover:underline"><ArrowLeft aria-hidden="true" className="size-4" /> Return to cart</Link>
      </aside>
    </form>
  );
}
