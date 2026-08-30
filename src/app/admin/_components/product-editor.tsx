"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ImageIcon,
  LoaderCircle,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { buttonClass, inputClass, panelClass, textareaClass } from "./ui";

type Option = { id: string; name: string };
type EditableImage = { url: string; alt: string };

export type EditableProduct = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice: number | null;
  priceOnRequest: boolean;
  unitsPerCarton: number;
  minimumOrderCartons: number;
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  brandId: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  allowBackorder: boolean;
  featured: boolean;
  bestSeller: boolean;
  bulkPricing: boolean;
  images: EditableImage[];
  attributes: Array<{ name: string; value: string }>;
};

const empty: EditableProduct = {
  name: "",
  slug: "",
  sku: "",
  shortDescription: "",
  description: "",
  price: 0,
  salePrice: null,
  priceOnRequest: true,
  unitsPerCarton: 0,
  minimumOrderCartons: 1,
  stock: 0,
  lowStockThreshold: 5,
  categoryId: "",
  brandId: null,
  status: "DRAFT",
  allowBackorder: true,
  featured: false,
  bestSeller: false,
  bulkPricing: true,
  images: [],
  attributes: [],
};

export function ProductEditor({
  product,
  categories,
  brands,
  disabled,
}: {
  product?: EditableProduct;
  categories: Option[];
  brands: Option[];
  disabled: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(product || empty);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const isEdit = Boolean(product?.id);

  function set<K extends keyof EditableProduct>(key: K, next: EditableProduct[K]) {
    setValue((current) => ({ ...current, [key]: next }));
  }

  function setSlugFromName(name: string) {
    set("name", name);
    if (!isEdit) {
      set(
        "slug",
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      );
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (uploading) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.issues?.map((issue: { message: string }) => issue.message).join(" ") ||
            result.error ||
            "Unable to save product.",
        );
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setPending(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const selected = Array.from(files).slice(0, 12 - value.images.length);
    if (!selected.length || disabled) return;
    setUploading(true);
    setMessage("");
    try {
      const uploaded: EditableImage[] = [];
      for (const file of selected) {
        const form = new FormData();
        form.set("file", file);
        const response = await fetch("/api/admin/media", { method: "POST", body: form });
        const result = await response.json();
        if (!response.ok || typeof result.url !== "string") {
          throw new Error(result.error || `Unable to upload ${file.name}.`);
        }
        uploaded.push({ url: result.url, alt: value.name || file.name.replace(/\.[^.]+$/, "") });
      }
      setValue((current) => ({
        ...current,
        images: [...current.images, ...uploaded].slice(0, 12),
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateImage(index: number, patch: Partial<EditableImage>) {
    set(
      "images",
      value.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image,
      ),
    );
  }

  function moveImage(index: number, destination: number) {
    if (destination < 0 || destination >= value.images.length || destination === index) return;
    const images = [...value.images];
    const [image] = images.splice(index, 1);
    images.splice(destination, 0, image);
    set("images", images);
  }

  const field = (
    label: string,
    key: keyof EditableProduct,
    type = "text",
    min = 0,
  ) => (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        type={type}
        min={type === "number" ? min : undefined}
        value={String(value[key] ?? "")}
        onChange={(event) => {
          const raw = event.target.value;
          set(
            key,
            (type === "number"
              ? key === "salePrice" && raw === ""
                ? null
                : Number(raw)
              : raw) as never,
          );
        }}
        disabled={disabled}
        className={inputClass}
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-800">
          <ArrowLeft className="size-4" /> Products
        </Link>
        <button disabled={disabled || pending || uploading} className={buttonClass}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "Saving…" : "Save product"}
        </button>
      </div>

      {message && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{message}</p>}

      <section className={`${panelClass} p-5 sm:p-6`}>
        <h2 className="mb-5 font-bold">Product information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">Name<input value={value.name} onChange={(event) => setSlugFromName(event.target.value)} disabled={disabled} required className={inputClass} /></label>
          {field("Slug", "slug")}
          {field("SKU", "sku")}
          <label className="block text-sm font-semibold text-slate-700">Status<select value={value.status} onChange={(event) => set("status", event.target.value as EditableProduct["status"])} disabled={disabled} className={inputClass}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></select></label>
          <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Short description<textarea value={value.shortDescription} onChange={(event) => set("shortDescription", event.target.value)} disabled={disabled} className={textareaClass} maxLength={300} /></label>
          <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Full description<textarea value={value.description} onChange={(event) => set("description", event.target.value)} disabled={disabled} className={textareaClass} required maxLength={5000} /></label>
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6`}>
        <div className="mb-5"><h2 className="font-bold">Carton pricing & inventory</h2><p className="mt-1 text-xs text-slate-500">All prices and stock quantities are managed per carton—not per piece.</p></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {field("Carton price (PKR)", "price", "number")}
          {field("Sale price per carton", "salePrice", "number")}
          {field("Pieces / packs per carton", "unitsPerCarton", "number")}
          {field("Minimum order (cartons)", "minimumOrderCartons", "number", 1)}
          {field("Available stock (cartons)", "stock", "number")}
          {field("Low-stock alert (cartons)", "lowStockThreshold", "number")}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {([
            ["priceOnRequest", "Price on request"],
            ["featured", "Featured"],
            ["bestSeller", "Best seller"],
            ["bulkPricing", "Bulk pricing"],
            ["allowBackorder", "Allow order requests"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold"><input type="checkbox" checked={value[key]} onChange={(event) => set(key, event.target.checked)} disabled={disabled} className="size-4 accent-emerald-800" />{label}</label>
          ))}
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6`}>
        <h2 className="mb-5 font-bold">Organization</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">Category<select value={value.categoryId} onChange={(event) => set("categoryId", event.target.value)} disabled={disabled} required className={inputClass}><option value="">Select a category</option>{categories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
          <label className="block text-sm font-semibold text-slate-700">Brand<select value={value.brandId || ""} onChange={(event) => set("brandId", event.target.value || null)} disabled={disabled} className={inputClass}><option value="">No brand / unbranded</option>{brands.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6`}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="font-bold">Product media</h2><p className="mt-1 text-xs leading-5 text-slate-500">Optional. JPG, PNG or WebP; maximum 5 MB each and 12 images per product. The first image is primary.</p></div>
          <div className="flex gap-2"><button type="button" disabled={disabled || value.images.length >= 12} onClick={() => set("images", [...value.images, { url: "", alt: value.name }])} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700"><Plus className="size-4" />Add URL</button><button type="button" disabled={disabled || uploading || value.images.length >= 12} onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-3 text-sm font-bold text-white disabled:opacity-50">{uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}{uploading ? "Uploading…" : "Upload"}</button></div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => event.target.files && uploadFiles(event.target.files)} />
        <button type="button" disabled={disabled || uploading || value.images.length >= 12} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadFiles(event.dataTransfer.files); }} className="mb-4 flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 text-center transition hover:border-emerald-600 hover:bg-emerald-50/40 disabled:cursor-not-allowed disabled:opacity-60"><Upload className="size-6 text-emerald-700" /><span className="mt-2 text-sm font-bold text-slate-800">Drop product images here or browse</span><span className="mt-1 text-xs text-slate-500">Images remain unpublished until this product is saved.</span></button>
        <div className="space-y-3">
          {value.images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[112px_minmax(0,1fr)_auto] md:items-center">
              <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">{image.url ? <Image src={image.url} alt="" fill unoptimized={image.url.startsWith("https://")} sizes="112px" className="object-contain p-2" /> : <ImageIcon className="size-8" />}{index === 0 && <span className="absolute left-2 top-2 rounded-full bg-emerald-800 px-2 py-1 text-[10px] font-bold text-white">Primary</span>}</div>
              <div className="grid gap-3"><label className="text-xs font-bold text-slate-600">Image URL<input value={image.url} required onChange={(event) => updateImage(index, { url: event.target.value })} placeholder="/uploads/products/... or HTTPS URL" className={inputClass} /></label><label className="text-xs font-bold text-slate-600">Alt text<input value={image.alt} maxLength={160} onChange={(event) => updateImage(index, { alt: event.target.value })} placeholder="Describe the product image" className={inputClass} /></label></div>
              <div className="flex flex-wrap gap-1 md:w-24 md:justify-end"><button type="button" disabled={index === 0} onClick={() => moveImage(index, 0)} title="Make primary" aria-label={`Make image ${index + 1} primary`} className="grid size-10 place-items-center rounded-lg text-amber-700 hover:bg-amber-50 disabled:opacity-30"><Star className="size-4" /></button><button type="button" disabled={index === 0} onClick={() => moveImage(index, index - 1)} title="Move up" aria-label={`Move image ${index + 1} up`} className="grid size-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="size-4" /></button><button type="button" disabled={index === value.images.length - 1} onClick={() => moveImage(index, index + 1)} title="Move down" aria-label={`Move image ${index + 1} down`} className="grid size-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="size-4" /></button><button type="button" onClick={() => set("images", value.images.filter((_, imageIndex) => imageIndex !== index))} title="Remove" aria-label={`Remove image ${index + 1}`} className="grid size-10 place-items-center rounded-lg text-red-700 hover:bg-red-50"><Trash2 className="size-4" /></button></div>
            </div>
          ))}
          {!value.images.length && <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center"><ImageIcon className="mx-auto size-7 text-slate-400" /><p className="mt-2 text-sm font-semibold text-slate-600">No product images</p><p className="mt-1 text-xs text-slate-500">The storefront will display a clean “Image coming soon” placeholder.</p></div>}
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6`}>
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Specifications</h2><p className="text-xs text-slate-500">Flexible details such as ply, sheet count, size, or material.</p></div><button type="button" disabled={disabled || value.attributes.length >= 30} onClick={() => set("attributes", [...value.attributes, { name: "", value: "" }])} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-800"><Plus className="size-4" />Add</button></div>
        <div className="space-y-3">{value.attributes.map((attribute, index) => <div key={index} className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_2fr_auto]"><input aria-label={`Specification ${index + 1} name`} placeholder="Ply / sheet count" value={attribute.name} onChange={(event) => set("attributes", value.attributes.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} className={inputClass.replace("mt-1.5 ", "")} /><input aria-label={`Specification ${index + 1} value`} placeholder="Verified value" value={attribute.value} onChange={(event) => set("attributes", value.attributes.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} className={inputClass.replace("mt-1.5 ", "")} /><button type="button" onClick={() => set("attributes", value.attributes.filter((_, itemIndex) => itemIndex !== index))} className="grid size-11 place-items-center rounded-xl text-red-700 hover:bg-red-50"><Trash2 className="size-4" /></button></div>)}</div>
      </section>
    </form>
  );
}
