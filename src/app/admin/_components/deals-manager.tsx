"use client";

import { ImagePlus, LoaderCircle, Plus, Save, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { buttonClass, inputClass, panelClass } from "./ui";

export type EditableDeal = {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyDeal: Omit<EditableDeal, "id"> = {
  title: "",
  imageUrl: "",
  alt: "",
  linkUrl: "/shop",
  sortOrder: 0,
  isActive: true,
};

export function DealsManager({ initialDeals, disabled }: { initialDeals: EditableDeal[]; disabled: boolean }) {
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);
  const [draft, setDraft] = useState(emptyDeal);
  const [pending, setPending] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function update(id: string, patch: Partial<EditableDeal>) {
    setDeals((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  async function upload(file: File | undefined, key: string, onComplete: (url: string) => void) {
    if (!file || disabled) return;
    setUploading(key);
    setMessage("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("scope", "deals");
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string") throw new Error(result.error || "Unable to upload banner.");
      onComplete(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload banner.");
    } finally {
      setUploading(null);
    }
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!draft.imageUrl) return setMessage("Upload or enter a deal image first.");
    setPending("new");
    setMessage("");
    try {
      const response = await fetch("/api/admin/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.issues?.map((issue: { message: string }) => issue.message).join(" ") || result.error || "Unable to create deal.");
      const deal = normalizeDeal(result.deal);
      setDeals((rows) => [...rows, deal].sort((a, b) => a.sortOrder - b.sortOrder));
      setDraft({ ...emptyDeal, sortOrder: deals.length });
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create deal.");
    } finally {
      setPending(null);
    }
  }

  async function save(deal: EditableDeal) {
    setPending(deal.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/deals/${deal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(deal) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.issues?.map((issue: { message: string }) => issue.message).join(" ") || result.error || "Unable to save deal.");
      const saved = normalizeDeal(result.deal);
      setDeals((rows) => rows.map((row) => row.id === saved.id ? saved : row).sort((a, b) => a.sortOrder - b.sortOrder));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save deal.");
    } finally {
      setPending(null);
    }
  }

  async function remove(deal: EditableDeal) {
    if (!window.confirm(`Delete “${deal.title}” from deals? The uploaded image file will remain available.`)) return;
    setPending(deal.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/deals/${deal.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete deal.");
      setDeals((rows) => rows.filter((row) => row.id !== deal.id));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete deal.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}</p>}

      <section className={`${panelClass} p-5 sm:p-6`}>
        <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><ImagePlus className="size-5" /></span><div><h2 className="font-bold">Add deal banner</h2><p className="mt-1 text-xs leading-5 text-slate-500">Recommended wide image. JPG, PNG or WebP up to 5 MB.</p></div></div>
        <form onSubmit={create} className="mt-5 grid gap-4 lg:grid-cols-2">
          <DealImageField
            value={draft.imageUrl}
            uploading={uploading === "new"}
            disabled={disabled}
            onUrl={(imageUrl) => setDraft((value) => ({ ...value, imageUrl }))}
            onFile={(file) => upload(file, "new", (imageUrl) => setDraft((value) => ({ ...value, imageUrl })))}
          />
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <Field label="Internal title" value={draft.title} onChange={(title) => setDraft((value) => ({ ...value, title }))} disabled={disabled} required className="sm:col-span-2" />
            <Field label="Alt text" value={draft.alt} onChange={(alt) => setDraft((value) => ({ ...value, alt }))} disabled={disabled} className="sm:col-span-2" />
            <Field label="Click destination" value={draft.linkUrl} onChange={(linkUrl) => setDraft((value) => ({ ...value, linkUrl }))} disabled={disabled} placeholder="/shop" />
            <Field label="Display order" value={String(draft.sortOrder)} onChange={(sortOrder) => setDraft((value) => ({ ...value, sortOrder: Number(sortOrder) }))} disabled={disabled} type="number" />
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft((value) => ({ ...value, isActive: event.target.checked }))} disabled={disabled} className="size-4 accent-emerald-800" />Show on storefront</label>
            <button disabled={disabled || pending === "new" || uploading === "new"} className={`${buttonClass} sm:col-span-2`}>{pending === "new" ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}Add deal</button>
          </div>
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {deals.map((deal) => (
          <article key={deal.id} className={`${panelClass} overflow-hidden`}>
            <DealImageField value={deal.imageUrl} uploading={uploading === deal.id} disabled={disabled} onUrl={(imageUrl) => update(deal.id, { imageUrl })} onFile={(file) => upload(file, deal.id, (imageUrl) => update(deal.id, { imageUrl }))} flush />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Internal title" value={deal.title} onChange={(title) => update(deal.id, { title })} disabled={disabled} required className="sm:col-span-2" />
              <Field label="Alt text" value={deal.alt} onChange={(alt) => update(deal.id, { alt })} disabled={disabled} className="sm:col-span-2" />
              <Field label="Click destination" value={deal.linkUrl} onChange={(linkUrl) => update(deal.id, { linkUrl })} disabled={disabled} />
              <Field label="Display order" value={String(deal.sortOrder)} onChange={(sortOrder) => update(deal.id, { sortOrder: Number(sortOrder) })} disabled={disabled} type="number" />
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={deal.isActive} onChange={(event) => update(deal.id, { isActive: event.target.checked })} disabled={disabled} className="size-4 accent-emerald-800" />Active on storefront</label>
              <div className="flex gap-2 sm:col-span-2"><button type="button" onClick={() => save(deal)} disabled={disabled || pending === deal.id || uploading === deal.id} className={`${buttonClass} flex-1`}>{pending === deal.id ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}Save changes</button><button type="button" onClick={() => remove(deal)} disabled={disabled || pending === deal.id} className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-40" aria-label={`Delete ${deal.title}`}><Trash2 className="size-4" /></button></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DealImageField({ value, uploading, disabled, onUrl, onFile, flush = false }: { value: string; uploading: boolean; disabled: boolean; onUrl: (url: string) => void; onFile: (file?: File) => void; flush?: boolean }) {
  return <div className={flush ? "" : "rounded-2xl border border-slate-200 bg-slate-50 p-4"}><div className={`relative aspect-[16/8] overflow-hidden ${flush ? "bg-slate-100" : "rounded-xl bg-white"}`}>{value ? <Image src={value} alt="Deal banner preview" fill unoptimized={value.startsWith("https://")} className="object-cover" /> : <div className="grid h-full place-items-center text-center text-sm text-slate-400"><div><ImagePlus className="mx-auto size-8" /><p className="mt-2">Banner preview</p></div></div>}{uploading && <div className="absolute inset-0 grid place-items-center bg-white/75"><LoaderCircle className="size-6 animate-spin text-emerald-800" /></div>}</div><div className={`grid gap-3 ${flush ? "p-5 pb-0 sm:grid-cols-[1fr_auto]" : "mt-4 sm:grid-cols-[1fr_auto]"}`}><label className="text-xs font-bold text-slate-600">Image URL<input value={value} onChange={(event) => onUrl(event.target.value)} disabled={disabled} placeholder="/uploads/deals/..." className={inputClass} /></label><label className="mt-auto inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-800 px-4 text-sm font-bold text-emerald-800 hover:bg-emerald-50"><Upload className="size-4" />Upload<input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled || uploading} onChange={(event) => { onFile(event.target.files?.[0]); event.currentTarget.value = ""; }} className="sr-only" /></label></div></div>;
}

function Field({ label, value, onChange, disabled, required, placeholder, type = "text", className = "" }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; required?: boolean; placeholder?: string; type?: string; className?: string }) {
  return <label className={`block text-sm font-semibold text-slate-700 ${className}`}>{label}<input type={type} min={type === "number" ? 0 : undefined} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} required={required} placeholder={placeholder} className={inputClass} /></label>;
}

function normalizeDeal(value: unknown): EditableDeal {
  const deal = value as Partial<EditableDeal>;
  return { id: String(deal.id || ""), title: String(deal.title || ""), imageUrl: String(deal.imageUrl || ""), alt: String(deal.alt || ""), linkUrl: String(deal.linkUrl || "/shop"), sortOrder: Number(deal.sortOrder || 0), isActive: Boolean(deal.isActive) };
}
