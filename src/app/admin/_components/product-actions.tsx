"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, Edit3, Eye, EyeOff, LoaderCircle, PackageCheck, PackageX } from "lucide-react";

export function ProductActions({
  id,
  stock,
  status,
  disabled,
}: {
  id: string;
  stock?: number;
  status: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggleVisibility() {
    if (disabled || pending) return;
    const visible = status !== "ACTIVE";
    setPending(true);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        window.alert(result.error || "Storefront visibility update nahi ho saki.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Network error updating storefront visibility.");
    } finally {
      setPending(false);
    }
  }

  async function toggleAvailability() {
    if (disabled || pending) return;
    const isOutOfStock = stock === 0;
    const confirmMsg = isOutOfStock
      ? "Carton ko 'In Stock' mark karein? Storefront par add to cart available ho jayega."
      : "Carton ko 'Out of Stock' mark karein? Storefront par unavailable show hoga.";
    if (!window.confirm(confirmMsg)) return;

    setPending(true);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: isOutOfStock }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        window.alert(result.error || "Availability update nahi ho saki.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Network error updating availability.");
    } finally {
      setPending(false);
    }
  }

  async function archive() {
    if (!window.confirm("Archive this product? Existing order records will be preserved.")) return;
    setPending(true);
    const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      window.alert(result.error || "Product could not be archived.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex justify-end items-center gap-1">
      <button
        onClick={toggleVisibility}
        disabled={disabled || pending}
        role="switch"
        aria-checked={status === "ACTIVE"}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition disabled:opacity-40 ${
          status === "ACTIVE"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "border-line bg-surface-soft text-muted"
        }`}
        title={status === "ACTIVE" ? "Visible on storefront — click to hide" : "Hidden from storefront — click to show"}
      >
        {status === "ACTIVE" ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        {status === "ACTIVE" ? "ON" : "OFF"}
      </button>
      {stock !== undefined && (
        <button
          onClick={toggleAvailability}
          disabled={disabled || pending}
          className={`rounded-lg p-2 transition ${
            stock === 0
              ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          } disabled:opacity-40`}
          title={
            stock === 0
              ? "Carton Out of Stock — Click to mark In Stock"
              : "Carton In Stock — Click to mark Out of Stock"
          }
          aria-label={stock === 0 ? "Mark In Stock" : "Mark Out of Stock"}
        >
          {stock === 0 ? <PackageX className="size-4" /> : <PackageCheck className="size-4" />}
        </button>
      )}
      <Link href={`/admin/products/${id}`} className="rounded-lg p-2 text-muted hover:bg-accent-soft hover:text-accent" aria-label="Edit product"><Edit3 className="size-4" /></Link>
      <button onClick={archive} disabled={disabled || pending} className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger disabled:opacity-40" aria-label="Archive product">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Archive className="size-4" />}</button>
    </div>
  );
}

