"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, Edit3, LoaderCircle } from "lucide-react";

export function ProductActions({ id, disabled }: { id: string; disabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

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
    <div className="flex justify-end gap-1">
      <Link href={`/admin/products/${id}`} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800" aria-label="Edit product"><Edit3 className="size-4" /></Link>
      <button onClick={archive} disabled={disabled || pending} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40" aria-label="Archive product">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Archive className="size-4" />}</button>
    </div>
  );
}
