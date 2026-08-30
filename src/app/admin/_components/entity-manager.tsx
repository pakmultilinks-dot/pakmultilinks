"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Archive, Check, Edit3, LoaderCircle, Plus, X } from "lucide-react";
import { buttonClass, inputClass, panelClass, textareaClass } from "./ui";

type CategoryRow = { id: string; name: string; slug: string; description: string; imageUrl: string; icon: string; sortOrder: number; isActive: boolean; productCount: number };
type BrandRow = { id: string; name: string; slug: string; logoUrl: string; isActive: boolean; productCount: number };
type Props = { kind: "categories"; rows: CategoryRow[]; disabled: boolean } | { kind: "brands"; rows: BrandRow[]; disabled: boolean };

export function EntityManager(props: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const isCategory = props.kind === "categories";

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending("new"); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") || "");
    const body = isCategory
      ? { name, slug: form.get("slug"), description: form.get("description"), imageUrl: form.get("imageUrl") || null, icon: "", sortOrder: Number(form.get("sortOrder") || 0), isActive: true }
      : { name, slug: form.get("slug"), logoUrl: form.get("logoUrl") || null, isActive: true };
    const saved = await mutate(`/api/admin/${props.kind}`, "POST", body);
    setPending(null);
    if (saved) formElement.reset();
  }

  function begin(row: CategoryRow | BrandRow) { setEditing(row.id); setDraft({ ...row }); setMessage(""); }
  async function save() { if (!editing) return; setPending(editing); const body = isCategory ? { name: draft.name, slug: draft.slug, description: draft.description || "", imageUrl: draft.imageUrl || null, icon: draft.icon || "", sortOrder: Number(draft.sortOrder || 0), isActive: Boolean(draft.isActive) } : { name: draft.name, slug: draft.slug, logoUrl: draft.logoUrl || null, isActive: Boolean(draft.isActive) }; await mutate(`/api/admin/${props.kind}/${editing}`, "PATCH", body); setPending(null); }
  async function archive(id: string) { if (!window.confirm(`Archive this ${isCategory ? "category" : "brand"}? Product records are preserved.`)) return; setPending(id); await mutate(`/api/admin/${props.kind}/${id}`, "DELETE"); setPending(null); }
  async function mutate(url: string, method: string, body?: unknown) { try { const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined }); const result = await response.json(); if (!response.ok) throw new Error(result.issues?.map((issue: { message: string }) => issue.message).join(" ") || result.error || "Unable to save."); setEditing(null); router.refresh(); return true; } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save."); return false; } }
  function change(key: string, value: unknown) { setDraft((current) => ({ ...current, [key]: value })); }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className={`${panelClass} order-2 overflow-hidden xl:order-1`}>
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold">Existing {props.kind}</h2><p className="text-xs text-slate-500">Edit details or archive entries without removing historical product links.</p></div>
        <div className="divide-y divide-slate-100">{props.rows.map((row) => <div key={row.id} className="p-5">{editing === row.id ? <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Name<input value={String(draft.name || "")} onChange={(event) => change("name",event.target.value)} className={inputClass} /></label><label className="text-xs font-bold text-slate-600">Slug<input value={String(draft.slug || "")} onChange={(event) => change("slug",event.target.value)} className={inputClass} /></label>{isCategory ? <><label className="text-xs font-bold text-slate-600 sm:col-span-2">Description<textarea value={String(draft.description || "")} onChange={(event) => change("description",event.target.value)} className={textareaClass} /></label><label className="text-xs font-bold text-slate-600">Image URL<input value={String(draft.imageUrl || "")} onChange={(event) => change("imageUrl",event.target.value)} className={inputClass} /></label><label className="text-xs font-bold text-slate-600">Sort order<input type="number" value={Number(draft.sortOrder || 0)} onChange={(event) => change("sortOrder",Number(event.target.value))} className={inputClass} /></label></> : <label className="text-xs font-bold text-slate-600 sm:col-span-2">Logo URL<input value={String(draft.logoUrl || "")} onChange={(event) => change("logoUrl",event.target.value)} className={inputClass} /></label>}</div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(draft.isActive)} onChange={(event) => change("isActive",event.target.checked)} className="size-4 accent-emerald-800" />Active</label><div className="flex gap-2"><button onClick={save} disabled={pending===row.id} className={buttonClass}>{pending===row.id ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}Save</button><button onClick={() => setEditing(null)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold"><X className="size-4" />Cancel</button></div></div> : <div className="flex items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h3 className="font-bold">{row.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{row.isActive ? "Active" : "Archived"}</span></div><p className="mt-1 text-xs text-slate-500">/{row.slug} · {row.productCount} product{row.productCount === 1 ? "" : "s"}</p></div><div className="flex gap-1"><button onClick={() => begin(row)} disabled={props.disabled} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-40" aria-label={`Edit ${row.name}`}><Edit3 className="size-4" /></button><button onClick={() => archive(row.id)} disabled={props.disabled || pending===row.id || !row.isActive} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40" aria-label={`Archive ${row.name}`}>{pending===row.id ? <LoaderCircle className="size-4 animate-spin" /> : <Archive className="size-4" />}</button></div></div>}</div>)}</div>
      </section>
      <aside className={`${panelClass} order-1 h-fit p-5 xl:order-2`}><h2 className="font-bold">Add {isCategory ? "category" : "brand"}</h2><p className="mt-1 text-xs leading-5 text-slate-500">Use verified names and media. No supplier partnership is implied.</p>{message && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}<form onSubmit={create} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">Name<input name="name" required disabled={props.disabled} className={inputClass} /></label><label className="block text-sm font-semibold text-slate-700">Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required disabled={props.disabled} className={inputClass} /></label>{isCategory ? <><label className="block text-sm font-semibold text-slate-700">Description<textarea name="description" disabled={props.disabled} className={textareaClass} /></label><label className="block text-sm font-semibold text-slate-700">Image URL<input name="imageUrl" disabled={props.disabled} placeholder="/images/categories/..." className={inputClass} /></label><label className="block text-sm font-semibold text-slate-700">Sort order<input name="sortOrder" type="number" min="0" defaultValue="0" disabled={props.disabled} className={inputClass} /></label></> : <label className="block text-sm font-semibold text-slate-700">Logo URL<input name="logoUrl" disabled={props.disabled} placeholder="/images/brands/..." className={inputClass} /></label>}<button disabled={props.disabled || pending==="new"} className={`${buttonClass} w-full`}>{pending==="new" ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}Create</button></form></aside>
    </div>
  );
}
