"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, LogOut, MapPin, PackageOpen, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { formatPrice } from "@/lib/utils";

type AccountUser = { id: string; name: string; email: string; phone?: string | null };
type Address = { id: string; label: string; address: string; city: string; province: string; isDefault?: boolean; fullName?: string; phone?: string; company?: string | null; postalCode?: string | null };
type ServerOrder = { id: string; orderNumber: string; status: string; paymentStatus?: string; total: string | number; requiresQuote?: boolean; createdAt: string; _count?: { items: number } };
type OrderDetail = ServerOrder & { subtotal?: string | number; deliveryFee?: string | number; items?: Array<{ id?: string; productName: string; quantity: number; lineTotal: string | number }> };
type AccountData = { user: AccountUser; addresses: Address[]; orders: ServerOrder[] };
type LoadState = "loading" | "ready" | "guest" | "unavailable" | "error";

const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";
const provinces = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Jammu and Kashmir"];

async function json(response: Response) {
  try { const value: unknown = await response.json(); return value && typeof value === "object" ? value as Record<string, unknown> : {}; } catch { return {} as Record<string, unknown>; }
}

function message(data: Record<string, unknown>, fallback: string) {
  return typeof data.error === "string" ? data.error : fallback;
}

function titleCase(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function date(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? "Date unavailable" : new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(parsed);
}

export function AccountClient({ welcome = false }: { welcome?: boolean }) {
  const router = useRouter();
  const { orders: deviceOrders, quotes } = useStore();
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | "new" | null>(null);
  const [details, setDetails] = useState<Record<string, OrderDetail>>({});
  const [loadingOrder, setLoadingOrder] = useState("");

  const loadAccount = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      const body = await json(response);
      if (response.status === 401) { setState("guest"); return; }
      if (response.status === 404 || response.status === 503) { setState("unavailable"); setError(message(body, "Customer accounts require a configured database and authentication service.")); return; }
      if (!response.ok) throw new Error(message(body, "Your account could not be loaded."));
      setData({
        user: body.user as AccountUser,
        addresses: Array.isArray(body.addresses) ? body.addresses as Address[] : [],
        orders: Array.isArray(body.orders) ? body.orders as ServerOrder[] : [],
      });
      setState("ready");
    } catch (requestError) {
      setState("error");
      setError(requestError instanceof Error ? requestError.message : "Your account could not be loaded.");
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void loadAccount());
    return () => window.cancelAnimationFrame(frame);
  }, [loadAccount]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: values.get("name"), phone: values.get("phone") }) });
      const body = await json(response);
      if (!response.ok) throw new Error(message(body, "Profile changes could not be saved."));
      await loadAccount();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Profile changes could not be saved."); }
    finally { setSaving(false); }
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || !editingAddress) return;
    const values = new FormData(form);
    const payload = { label: values.get("label"), fullName: values.get("fullName"), phone: values.get("phone"), company: values.get("company"), address: values.get("address"), city: values.get("city"), province: values.get("province"), postalCode: values.get("postalCode"), isDefault: values.get("isDefault") === "on" };
    setSaving(true); setError("");
    try {
      const isNew = editingAddress === "new";
      const response = await fetch(isNew ? "/api/account/addresses" : `/api/account/addresses/${editingAddress.id}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await json(response);
      if (!response.ok) throw new Error(message(body, "The address could not be saved."));
      setEditingAddress(null); await loadAccount();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "The address could not be saved."); }
    finally { setSaving(false); }
  }

  async function deleteAddress(address: Address) {
    if (!window.confirm(`Remove the ${address.label} address?`)) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/account/addresses/${address.id}`, { method: "DELETE" });
      const body = await json(response);
      if (!response.ok) throw new Error(message(body, "The address could not be removed."));
      await loadAccount();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "The address could not be removed."); }
    finally { setSaving(false); }
  }

  async function loadOrder(orderId: string) {
    if (details[orderId]) return;
    setLoadingOrder(orderId); setError("");
    try {
      const response = await fetch(`/api/account/orders/${orderId}`, { cache: "no-store" });
      const body = await json(response);
      if (!response.ok) throw new Error(message(body, "Order details could not be loaded."));
      setDetails((current) => ({ ...current, [orderId]: body.order as OrderDetail }));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Order details could not be loaded."); }
    finally { setLoadingOrder(""); }
  }

  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok) { setData(null); setState("guest"); router.push("/"); router.refresh(); }
    else setError("Sign out failed. Please try again.");
  }

  if (state === "loading") return <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm" role="status"><Loader2 aria-hidden="true" className="mx-auto size-8 animate-spin text-emerald-800" /><p className="mt-3 text-sm text-slate-600">Loading your account…</p></div>;

  const linkedNumbers = new Set(data?.orders.map((order) => order.orderNumber) ?? []);
  const browserOnlyOrders = deviceOrders.filter((order) => !linkedNumbers.has(order.id));
  const currentAddress = editingAddress === "new" ? undefined : editingAddress || undefined;

  return (
    <div className="space-y-7">
      {welcome && state === "ready" ? <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status"><CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />Your account was created and you are signed in.</div> : null}
      {error ? <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><AlertCircle aria-hidden="true" className="size-5 shrink-0" />{error}</div> : null}
      {state === "guest" ? <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><UserRound aria-hidden="true" className="size-10 text-emerald-800" /><h2 className="mt-4 text-2xl font-bold text-slate-950">Sign in for your customer account</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Server-backed profile, saved addresses, and linked order history require authentication. Orders saved on this device remain visible below.</p><div className="mt-6 flex gap-3"><Link href="/login?next=/account" className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white">Sign in</Link><Link href="/register" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800">Register</Link></div></section> : null}
      {(state === "unavailable" || state === "error") ? <section className="rounded-3xl border border-amber-200 bg-amber-50 p-7"><h2 className="text-xl font-bold text-amber-950">Customer account service unavailable</h2><p className="mt-2 text-sm leading-6 text-amber-900">Authentication and profile management need a configured database and session secret. No local profile or fake sign-in has been created. Guest checkout and this device’s order records can still be used.</p><button type="button" onClick={() => void loadAccount()} className="mt-5 rounded-xl border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-900">Try again</button></section> : null}

      {state === "ready" && data ? <>
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-slate-500">Signed in as</p><p className="font-bold text-slate-950">{data.user.email}</p></div><button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><LogOut aria-hidden="true" className="size-4" />Sign out</button></div>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold text-slate-950">Personal information</h2><form onSubmit={saveProfile} className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-800">Full name<input className={inputClass} name="name" defaultValue={data.user.name} minLength={2} maxLength={100} required /></label><label className="text-sm font-semibold text-slate-800">Phone<input className={inputClass} name="phone" type="tel" defaultValue={data.user.phone ?? ""} maxLength={24} /></label><label className="text-sm font-semibold text-slate-800 sm:col-span-2">Email address<input className={`${inputClass} bg-slate-100 text-slate-500`} value={data.user.email} disabled /><span className="mt-2 block text-xs font-normal text-slate-500">Email changes require a verified account workflow and are not available here.</span></label><div className="sm:col-span-2"><button disabled={saving} className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Save profile</button></div></form></section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-950">Saved addresses</h2><p className="mt-1 text-sm text-slate-600">Use addresses for future customer-account orders.</p></div><button type="button" onClick={() => setEditingAddress("new")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white"><Plus aria-hidden="true" className="size-4" />Add address</button></div>
          {data.addresses.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{data.addresses.map((address) => <article key={address.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex justify-between gap-3"><div><p className="font-bold text-slate-950">{address.label} {address.isDefault ? <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Default</span> : null}</p><p className="mt-2 text-sm leading-6 text-slate-600">{address.fullName ? <>{address.fullName}<br /></> : null}{address.address}<br />{address.city}, {address.province}{address.postalCode ? ` ${address.postalCode}` : ""}</p></div><MapPin aria-hidden="true" className="size-5 shrink-0 text-emerald-700" /></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => setEditingAddress(address)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"><Pencil aria-hidden="true" className="size-3" />Edit</button><button type="button" onClick={() => void deleteAddress(address)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"><Trash2 aria-hidden="true" className="size-3" />Remove</button></div></article>)}</div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">No saved addresses yet.</p>}
          {editingAddress ? <form onSubmit={saveAddress} className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5"><h3 className="font-bold text-slate-950">{editingAddress === "new" ? "Add delivery address" : "Edit delivery address"}</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Label<input className={inputClass} name="label" defaultValue={currentAddress?.label ?? "Delivery"} required maxLength={40} /></label><label className="text-sm font-semibold">Recipient name<input className={inputClass} name="fullName" defaultValue={currentAddress?.fullName ?? data.user.name} required maxLength={100} /></label><label className="text-sm font-semibold">Phone<input className={inputClass} name="phone" type="tel" defaultValue={currentAddress?.phone ?? data.user.phone ?? ""} required maxLength={24} /></label><label className="text-sm font-semibold">Company <span className="font-normal text-slate-500">(optional)</span><input className={inputClass} name="company" defaultValue={currentAddress?.company ?? ""} maxLength={120} /></label><label className="text-sm font-semibold sm:col-span-2">Address<textarea className={`${inputClass} min-h-24`} name="address" defaultValue={currentAddress?.address ?? ""} required maxLength={300} /></label><label className="text-sm font-semibold">City<input className={inputClass} name="city" defaultValue={currentAddress?.city ?? ""} required maxLength={80} /></label><label className="text-sm font-semibold">Province / territory<select className={inputClass} name="province" defaultValue={currentAddress?.province ?? ""} required><option value="" disabled>Select one</option>{provinces.map((province) => <option key={province}>{province}</option>)}</select></label><label className="text-sm font-semibold">Postal code <span className="font-normal text-slate-500">(optional)</span><input className={inputClass} name="postalCode" defaultValue={currentAddress?.postalCode ?? ""} maxLength={20} /></label><label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold"><input name="isDefault" type="checkbox" defaultChecked={currentAddress?.isDefault} className="accent-emerald-800" />Set as default</label></div><div className="mt-5 flex gap-3"><button disabled={saving} className="rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save address</button><button type="button" onClick={() => setEditingAddress(null)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold">Cancel</button></div></form> : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold text-slate-950">Account order history</h2>{data.orders.length ? <div className="mt-5 space-y-3">{data.orders.map((order) => { const detail = details[order.id]; return <article key={order.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-slate-950">{order.orderNumber}</p><p className="text-xs text-slate-500">{date(order.createdAt)} · {order._count?.items ?? "—"} products</p></div><div className="text-right"><p className="font-bold text-slate-950">{order.requiresQuote ? "Quote required" : formatPrice(Number(order.total))}</p><p className="text-xs font-semibold text-amber-700">{titleCase(order.status)}</p></div><button type="button" onClick={() => void loadOrder(order.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">{loadingOrder === order.id ? <Loader2 className="size-4 animate-spin" /> : <ChevronDown className="size-4" />}View order detail</button></div>{detail?.items ? <ul className="mt-4 space-y-2 border-t border-slate-200 pt-4">{detail.items.map((item, index) => <li key={item.id ?? index} className="flex justify-between gap-4 text-sm text-slate-600"><span>{item.productName} × {item.quantity} cartons</span><span className="font-semibold text-slate-900">{detail.requiresQuote ? "Quote required" : formatPrice(Number(item.lineTotal))}</span></li>)}</ul> : null}</article>; })}</div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">No orders are linked to this customer account yet.</p>}</section>
      </> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold text-slate-950">Records saved on this device</h2><p className="mt-2 text-sm leading-6 text-slate-600">These browser records are not proof that an order or quotation reached the business database. Development fallback references are marked <strong>DEV</strong>.</p>
        {browserOnlyOrders.length ? <div className="mt-5 space-y-3">{browserOnlyOrders.map((order) => <details key={order.id} className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer font-semibold text-slate-950">{order.id} · {order.status} · {order.requiresQuote ? "Quote required" : formatPrice(order.subtotal)}</summary><ul className="mt-3 space-y-1 text-sm text-slate-600">{order.items.map(({ product, quantity }) => <li key={product.id}>{product.name} × {quantity} cartons</li>)}</ul><p className="mt-3 text-xs text-amber-700">Delivery charge and final total: confirmed after review.</p></details>)}</div> : <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600"><PackageOpen aria-hidden="true" className="size-5 text-emerald-700" />No additional order records are stored in this browser.</div>}
        {quotes.length ? <div className="mt-6"><h3 className="font-bold text-slate-950">Quotation requests on this device</h3><ul className="mt-3 space-y-2">{quotes.map((quote) => <li key={quote.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-950">{quote.id}</span><span className="ml-2 text-slate-500">{quote.items.length} product request(s) · {quote.status}</span></li>)}</ul></div> : null}
      </section>
    </div>
  );
}
