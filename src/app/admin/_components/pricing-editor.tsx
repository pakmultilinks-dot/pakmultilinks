"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Download,
  Search,
  Save,
  Package,
  CheckCircle2,
  FileQuestion,
  TrendingUp,
  X,
  AlertCircle,
  Percent,
} from "lucide-react";
import { buttonClass, panelClass } from "./ui";

export type PricingRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand?: string;
  updatedAt: string;
  price: number;
  salePrice: number | null;
  priceOnRequest: boolean;
  stock: number;
  unitsPerCarton: number;
  minimumOrderCartons: number;
};

export function inferBrandFromName(name: string, brand?: string): string {
  if (brand && brand !== "Unbranded" && brand !== "Pak Multilinks") return brand;
  const lower = name.toLowerCase();
  if (lower.includes("rose petal") || lower.includes("hi-jeen") || lower.includes("zzoop") || lower.includes("maxob")) return "Rose Petal";
  if (lower.includes("nozomi")) return "Nozomi";
  if (lower.includes("fine life") || lower.includes("finelife")) return "Fine Life";
  if (lower.includes("fresco")) return "Fresco";
  if (lower.includes("germi cure") || lower.includes("germicure")) return "Germi Cure";
  if (lower.includes("shine well") || lower.includes("shinewell")) return "Shine Well";
  if (lower.includes("airnergy") || lower.includes("air energy")) return "Airnergy";
  if (lower.includes("super soft") || lower.includes("supersoft")) return "Super Soft";
  if (lower.includes("softex")) return "Softex";
  if (lower.includes("sicura")) return "Sicura";
  if (lower.includes("glad")) return "Glad";
  if (lower.includes("harpic")) return "Harpic";
  if (lower.includes("dettol")) return "Dettol";
  if (lower.includes("vim")) return "Vim";
  if (lower.includes("bonus")) return "Bonus";
  if (lower.includes("glint")) return "Glint";
  return brand || "Other";
}

type Draft = {
  price: string;
  piecePrice: string;
  salePrice: string;
  salePiecePrice: string;
  priceOnRequest: boolean;
  stock: string;
  unitsPerCarton: string;
  minimumOrderCartons: string;
  cartonEnabled: boolean;
};

export function detectUnitsFromName(name: string): number {
  if (!name) return 0;
  const match = name.match(/(\d+)\s*(?:\/|\s)?(?:pcs|pieces|pack|packs|cans|bottles|boxes|rolls|ctn|carton)/i);
  if (match) {
    const val = parseInt(match[1], 10);
    if (val > 1 && val <= 10000) return val;
  }
  return 0;
}

function calcPiece(cartonStr: string, units: number): string {
  if (!cartonStr || cartonStr.trim() === "") return "";
  const num = Number(cartonStr);
  const safeUnits = Math.max(1, Math.floor(units || 1));
  if (!Number.isFinite(num) || num <= 0) return "";
  const p = num / safeUnits;
  return Number.isInteger(p) ? String(p) : p.toFixed(2);
}

const toDraft = (row: PricingRow): Draft => {
  const storedUnits = Number(row.unitsPerCarton) || 0;
  const cartonEnabled = storedUnits > 1;
  const price = String(row.price);
  const salePrice = row.salePrice === null ? "" : String(row.salePrice);

  // Carton pricing off: `price` is the product (piece) price — no derivation.
  if (!cartonEnabled) {
    return {
      price,
      piecePrice: price,
      salePrice,
      salePiecePrice: salePrice,
      priceOnRequest: row.priceOnRequest,
      stock: String(row.stock),
      unitsPerCarton: "0",
      minimumOrderCartons: String(row.minimumOrderCartons || 1),
      cartonEnabled: false,
    };
  }

  return {
    price,
    piecePrice: calcPiece(price, storedUnits),
    salePrice,
    salePiecePrice: salePrice === "" ? "" : calcPiece(salePrice, storedUnits),
    priceOnRequest: row.priceOnRequest,
    stock: String(row.stock),
    unitsPerCarton: String(storedUnits),
    minimumOrderCartons: String(row.minimumOrderCartons || 1),
    cartonEnabled: true,
  };
};

export function PricingEditor({
  initialRows,
  disabled,
}: {
  initialRows: PricingRow[];
  disabled: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [adjustment, setAdjustment] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Remembers each row's last positive pcs/ctn so toggling carton pricing
  // back on restores the previous value instead of a guess.
  const lastUnitsRef = useRef<Record<string, string>>({});

  const dirtyIds = Object.keys(drafts);

  const totalCount = rows.length;
  const quoteOnlyCount = rows.filter(
    (row) => (drafts[row.id]?.priceOnRequest ?? row.priceOnRequest),
  ).length;
  const publishedCount = totalCount - quoteOnlyCount;
  const onSaleCount = rows.filter((row) => {
    const sale = drafts[row.id]?.salePrice ?? row.salePrice;
    return sale !== null && sale !== "" && Number(sale) > 0;
  }).length;
  const outOfStockCount = rows.filter(
    (row) => Number(drafts[row.id]?.stock ?? row.stock) === 0,
  ).length;
  const missingUnitsCount = rows.filter((row) => {
    const draft = drafts[row.id];
    const cartonOn = draft ? draft.cartonEnabled : row.unitsPerCarton > 1;
    if (!cartonOn) return false; // carton intentionally off — not "missing"
    const units = Number(draft?.unitsPerCarton ?? row.unitsPerCarton) || detectUnitsFromName(row.name);
    return units <= 1;
  }).length;

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const b = inferBrandFromName(row.name, row.brand);
      if (b && b !== "Other") {
        counts.set(b, (counts.get(b) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [rows]);

  const categoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      if (row.category) {
        counts.set(row.category, (counts.get(row.category) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const visible = useMemo(
    () =>
      rows.filter((row) => {
        const rowBrand = inferBrandFromName(row.name, row.brand);

        // Multi-word smart search: every typed word matches anywhere in product info
        const queryWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const searchable = `${row.name} ${row.sku} ${row.category} ${rowBrand} ${row.unitsPerCarton > 0 ? `${row.unitsPerCarton} pcs` : ""}`.toLowerCase();
        const matchesQuery =
          queryWords.length === 0 ||
          queryWords.every((word) => searchable.includes(word));

        // Category filter
        const matchesCategory = !category || row.category === category;

        // Brand filter
        const matchesBrand =
          !selectedBrand ||
          rowBrand.toLowerCase() === selectedBrand.toLowerCase() ||
          row.name.toLowerCase().includes(selectedBrand.toLowerCase());

        // Status filter
        const currentQuote = drafts[row.id]?.priceOnRequest ?? row.priceOnRequest;
        const currentStock = Number(drafts[row.id]?.stock ?? row.stock);
        const currentSale = drafts[row.id]?.salePrice ?? row.salePrice;
        const currentDraft = drafts[row.id];
        const currentCartonOn = currentDraft ? currentDraft.cartonEnabled : row.unitsPerCarton > 1;
        const currentUnits = Number(currentDraft?.unitsPerCarton ?? row.unitsPerCarton) || detectUnitsFromName(row.name);

        let matchesFilter = true;
        if (filter === "quote") matchesFilter = currentQuote;
        else if (filter === "priced") matchesFilter = !currentQuote;
        else if (filter === "sale") matchesFilter = Boolean(currentSale && Number(currentSale) > 0);
        else if (filter === "stock") matchesFilter = currentStock === 0;
        else if (filter === "missing-units") matchesFilter = currentCartonOn && currentUnits <= 1;

        return matchesQuery && matchesCategory && matchesBrand && matchesFilter;
      }),
    [rows, drafts, query, category, selectedBrand, filter],
  );

  const categories = useMemo(
    () => [...new Set(rows.map((row) => row.category))].sort(),
    [rows],
  );

  useEffect(() => {
    if (!dirtyIds.length) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyIds.length]);

  function edit(row: PricingRow, patch: Partial<Draft>) {
    setDrafts((current) => {
      const next = {
        ...current,
        [row.id]: { ...(current[row.id] ?? toDraft(row)), ...patch },
      };
      if (JSON.stringify(next[row.id]) === JSON.stringify(toDraft(row))) {
        delete next[row.id];
      }
      return next;
    });
    setMessage("");
  }

  function handlePiecePriceChange(row: PricingRow, draft: Draft, val: string) {
    const num = Number(val);
    if (!draft.cartonEnabled) {
      // Carton off: the product price IS the piece price — no derivation.
      if (!val || val.trim() === "") {
        edit(row, { piecePrice: "", price: "" });
      } else if (Number.isFinite(num)) {
        edit(row, { piecePrice: val, price: val });
      }
      return;
    }
    const units = Number(draft.unitsPerCarton) > 0 ? Number(draft.unitsPerCarton) : (detectUnitsFromName(row.name) || 1);
    if (!val || val.trim() === "") {
      edit(row, { piecePrice: "", price: "" });
    } else if (Number.isFinite(num)) {
      const calculatedCarton = (num * units).toFixed(2);
      edit(row, {
        piecePrice: val,
        price: calculatedCarton,
        unitsPerCarton: String(units),
      });
    }
  }

  function handleCartonPriceChange(row: PricingRow, draft: Draft, val: string) {
    if (!draft.cartonEnabled) return;
    const num = Number(val);
    const units = Number(draft.unitsPerCarton) > 0 ? Number(draft.unitsPerCarton) : (detectUnitsFromName(row.name) || 1);
    if (!val || val.trim() === "") {
      edit(row, { price: "", piecePrice: "" });
    } else if (Number.isFinite(num)) {
      const calculatedPiece = (num / units).toFixed(2);
      edit(row, {
        price: val,
        piecePrice: calculatedPiece,
        unitsPerCarton: String(units),
      });
    }
  }

  function handleCartonToggle(row: PricingRow, draft: Draft, on: boolean) {
    const piece = Number(draft.piecePrice) > 0 ? draft.piecePrice : draft.price;
    const salePiece = Number(draft.salePiecePrice) > 0 ? draft.salePiecePrice : draft.salePrice;

    if (on) {
      const remembered = lastUnitsRef.current[row.id];
      const units = Number(remembered) > 0 ? remembered : String(detectUnitsFromName(row.name) || 1);
      const patch: Partial<Draft> = { cartonEnabled: true, unitsPerCarton: units };
      if (Number(piece) > 0) patch.price = (Number(piece) * Number(units)).toFixed(2);
      if (Number(salePiece) > 0) patch.salePrice = (Number(salePiece) * Number(units)).toFixed(2);
      edit(row, patch);
      setMessage("");
      return;
    }

    lastUnitsRef.current[row.id] = draft.unitsPerCarton;
    edit(row, {
      cartonEnabled: false,
      unitsPerCarton: "0",
      price: piece,
      piecePrice: piece,
      salePrice: salePiece,
      salePiecePrice: salePiece,
    });
    setMessage("");
  }

  function handleUnitsChange(row: PricingRow, draft: Draft, val: string) {
    const newUnits = Number(val) > 0 ? Number(val) : 0;
    const currentPiece = Number(draft.piecePrice);
    const currentCarton = Number(draft.price);
    const currentSalePiece = Number(draft.salePiecePrice);
    const currentSaleCarton = Number(draft.salePrice);

    if (newUnits <= 0) {
      // Clearing/zeroing pcs-per-ctn switches carton pricing off entirely.
      handleCartonToggle(row, draft, false);
      return;
    }

    if (newUnits > 0 && Number.isFinite(currentPiece) && currentPiece > 0) {
      const newCarton = (currentPiece * newUnits).toFixed(2);
      const newSaleCarton = Number.isFinite(currentSalePiece) && currentSalePiece > 0
        ? (currentSalePiece * newUnits).toFixed(2)
        : draft.salePrice;
      edit(row, {
        unitsPerCarton: val,
        price: newCarton,
        salePrice: newSaleCarton,
      });
    } else if (newUnits > 0 && Number.isFinite(currentCarton) && currentCarton > 0) {
      const newPiece = (currentCarton / newUnits).toFixed(2);
      const newSalePiece = Number.isFinite(currentSaleCarton) && currentSaleCarton > 0
        ? (currentSaleCarton / newUnits).toFixed(2)
        : draft.salePiecePrice;
      edit(row, {
        unitsPerCarton: val,
        piecePrice: newPiece,
        salePiecePrice: newSalePiece,
      });
    } else {
      edit(row, { unitsPerCarton: val });
    }
  }

  function handleSalePiecePriceChange(row: PricingRow, draft: Draft, val: string) {
    const num = Number(val);
    if (!draft.cartonEnabled) {
      // Carton off: sale price is stored directly as the piece sale price.
      if (!val || val.trim() === "") {
        edit(row, { salePiecePrice: "", salePrice: "" });
      } else if (Number.isFinite(num)) {
        edit(row, { salePiecePrice: val, salePrice: val });
      }
      return;
    }
    const units = Number(draft.unitsPerCarton) > 0 ? Number(draft.unitsPerCarton) : (detectUnitsFromName(row.name) || 1);
    if (!val || val.trim() === "") {
      edit(row, { salePiecePrice: "", salePrice: "" });
    } else if (Number.isFinite(num)) {
      const calculatedSaleCarton = (num * units).toFixed(2);
      edit(row, {
        salePiecePrice: val,
        salePrice: calculatedSaleCarton,
        unitsPerCarton: String(units),
      });
    }
  }

  function handleSaleCartonPriceChange(row: PricingRow, draft: Draft, val: string) {
    if (!draft.cartonEnabled) return;
    const num = Number(val);
    const units = Number(draft.unitsPerCarton) > 0 ? Number(draft.unitsPerCarton) : (detectUnitsFromName(row.name) || 1);
    if (!val || val.trim() === "") {
      edit(row, { salePrice: "", salePiecePrice: "" });
    } else if (Number.isFinite(num)) {
      const calculatedPiece = (num / units).toFixed(2);
      edit(row, {
        salePrice: val,
        salePiecePrice: calculatedPiece,
        unitsPerCarton: String(units),
      });
    }
  }

  function applyAdjustment() {
    const percent = Number(adjustment);
    if (!adjustment || !Number.isFinite(percent) || percent < -100 || percent > 1000) {
      setError("Enter an adjustment percentage between −100% and 1000%.");
      return;
    }
    for (const row of rows.filter((row) => selected.includes(row.id))) {
      const value = drafts[row.id] ?? toDraft(row);
      const newPrice = (Number(value.price) * (1 + percent / 100)).toFixed(2);
      const newSale =
        value.salePrice === ""
          ? ""
          : (Number(value.salePrice) * (1 + percent / 100)).toFixed(2);
      if (value.cartonEnabled) {
        edit(row, { price: newPrice, salePrice: newSale });
      } else {
        // Carton off: price IS the piece price — keep both fields in sync.
        edit(row, {
          price: newPrice,
          piecePrice: newPrice,
          salePrice: newSale,
          salePiecePrice: newSale,
        });
      }
    }
    setError("");
    setMessage(`Updated rates for ${selected.length} products by ${percent}%. Remember to click Save.`);
  }

  function bulkSetQuoteOnly(quoteOnly: boolean) {
    for (const row of rows.filter((row) => selected.includes(row.id))) {
      edit(row, { priceOnRequest: quoteOnly });
    }
    setMessage(
      `${selected.length} products set to ${quoteOnly ? "Quote Only" : "Published"}. Click Save changes to apply.`,
    );
  }

  function bulkSetStock(outOfStock: boolean) {
    for (const row of rows.filter((row) => selected.includes(row.id))) {
      edit(row, { stock: outOfStock ? "0" : "20" });
    }
    setMessage(
      `${selected.length} products marked as ${outOfStock ? "Out of Stock" : "In Stock"}. Click Save changes to apply.`,
    );
  }

  async function save() {
    setError("");
    setMessage("");
    if (dirtyIds.length > 100) {
      setError("Save up to 100 changed products at a time.");
      return;
    }

    // Ensure consistent carton and piece prices across all dirty items
    for (const id of dirtyIds) {
      const draft = drafts[id];
      const row = rows.find((r) => r.id === id);

      if (!draft.cartonEnabled) {
        // Carton pricing off: price IS the piece price; units stay 0.
        if (!draft.price && draft.piecePrice) draft.price = draft.piecePrice;
        if (!draft.piecePrice && draft.price) draft.piecePrice = draft.price;
        if (!draft.salePrice && draft.salePiecePrice) draft.salePrice = draft.salePiecePrice;
        if (!draft.salePiecePrice && draft.salePrice) draft.salePiecePrice = draft.salePrice;
        draft.unitsPerCarton = "0";
      } else {
        const units = Number(draft.unitsPerCarton) > 0
          ? Number(draft.unitsPerCarton)
          : (row ? detectUnitsFromName(row.name) : 1) || 1;

        if ((!draft.price || Number(draft.price) <= 0) && draft.piecePrice && Number(draft.piecePrice) > 0) {
          draft.price = (Number(draft.piecePrice) * units).toFixed(2);
          draft.unitsPerCarton = String(units);
        }
        if ((!draft.piecePrice || Number(draft.piecePrice) <= 0) && draft.price && Number(draft.price) > 0) {
          draft.piecePrice = (Number(draft.price) / units).toFixed(2);
        }
        if ((!draft.salePrice || Number(draft.salePrice) <= 0) && draft.salePiecePrice && Number(draft.salePiecePrice) > 0) {
          draft.salePrice = (Number(draft.salePiecePrice) * units).toFixed(2);
        }
        if ((!draft.salePiecePrice || Number(draft.salePiecePrice) <= 0) && draft.salePrice && Number(draft.salePrice) > 0) {
          draft.salePiecePrice = (Number(draft.salePrice) / units).toFixed(2);
        }
        if (!draft.unitsPerCarton || Number(draft.unitsPerCarton) <= 0) {
          draft.unitsPerCarton = String(units);
        }
      }
      // If sale price >= regular price, it's not a discount; clear salePrice
      if (draft.salePrice && Number(draft.salePrice) >= Number(draft.price)) {
        draft.salePrice = "";
        draft.salePiecePrice = "";
      }
    }

    const products = dirtyIds.map((id) => {
      const draft = drafts[id];
      return {
        id,
        price: Number(draft.price),
        salePrice: draft.salePrice === "" ? null : Number(draft.salePrice),
        priceOnRequest: draft.priceOnRequest,
        stock: Number(draft.stock),
        unitsPerCarton: Number(draft.unitsPerCarton),
        minimumOrderCartons: Number(draft.minimumOrderCartons),
      };
    });

    if (
      dirtyIds.some((id) =>
        Object.entries(drafts[id]).some(
          ([key, value]) =>
            key !== "salePrice" &&
            key !== "piecePrice" &&
            key !== "salePiecePrice" &&
            typeof value === "string" &&
            value.trim() === "",
        ),
      )
    ) {
      setError("Fill in all numeric fields. Only sale price may be left blank.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/admin/products/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.issues?.map((issue: { message: string }) => issue.message).join(". ") ||
            result.error ||
            "Unable to save changes.",
        );
      }
      setRows((current) =>
        current.map((row) => {
          const updated = result.products?.find((item: { id: string }) => item.id === row.id);
          return updated
            ? {
                ...row,
                ...updated,
                price: Number(updated.price),
                salePrice: updated.salePrice == null ? null : Number(updated.salePrice),
                stock: Number(updated.stock),
                unitsPerCarton: Number(updated.unitsPerCarton),
                minimumOrderCartons: Number(updated.minimumOrderCartons),
                priceOnRequest: Boolean(updated.priceOnRequest),
                updatedAt: updated.updatedAt,
              }
            : row;
        }),
      );
      setDrafts({});
      setMessage(
        `${products.length} product${products.length === 1 ? "" : "s"} saved successfully. Prices and stock availability updated.`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save changes.");
    } finally {
      setPending(false);
    }
  }

  function exportCsv() {
    const cell = (value: unknown) =>
      `"${String(value).replace(/^[=+@\-]/, "'$&").replaceAll('"', '""')}"`;
    const csv = [
      [
        "Product",
        "SKU",
        "Category",
        "Regular Carton Price PKR",
        "Regular Piece Price PKR",
        "Sale Carton Price PKR",
        "Price on request",
        "Stock cartons",
        "Units per carton",
        "Minimum cartons",
      ],
      ...visible.map((row) => {
        const draft = drafts[row.id] ?? toDraft(row);
        if (!draft.cartonEnabled) {
          // Carton off: price column carries the piece price; carton column blank.
          return [
            row.name,
            row.sku,
            row.category,
            "",
            draft.piecePrice || draft.price,
            draft.salePiecePrice ?? draft.salePrice ?? "",
            draft.priceOnRequest ? "Yes" : "No",
            draft.stock,
            "0",
            draft.minimumOrderCartons,
          ];
        }
        const units = Number(draft.unitsPerCarton) || detectUnitsFromName(row.name) || 0;
        const pieceRate = draft.piecePrice || (units > 1 ? calcPiece(draft.price, units) : "");
        return [
          row.name,
          row.sku,
          row.category,
          draft.price,
          pieceRate,
          draft.salePrice ?? "",
          draft.priceOnRequest ? "Yes" : "No",
          draft.stock,
          draft.unitsPerCarton,
          draft.minimumOrderCartons,
        ];
      }),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "pak-multilinks-pricing-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Total Products */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-xs transition hover:border-line-strong">
          <div>
            <p className="text-xs font-semibold text-muted">Total Products</p>
            <p className="mt-1 font-serif text-2xl font-bold text-content sm:text-3xl">
              {totalCount}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-secondary">
              Active catalog items
            </p>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-surface-soft text-action">
            <Package className="size-5" />
          </div>
        </div>

        {/* Published Prices */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-xs transition hover:border-line-strong">
          <div>
            <p className="text-xs font-semibold text-muted">Published Prices</p>
            <p className="mt-1 font-serif text-2xl font-bold text-action sm:text-3xl">
              {publishedCount}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Direct online order active
            </p>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        {/* Quote on Request */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-xs transition hover:border-line-strong">
          <div>
            <p className="text-xs font-semibold text-muted">Quote On Request</p>
            <p className="mt-1 font-serif text-2xl font-bold text-amber-800 dark:text-amber-400 sm:text-3xl">
              {quoteOnlyCount}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-amber-800/80 dark:text-amber-300">
              Requires bulk inquiry
            </p>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <FileQuestion className="size-5" />
          </div>
        </div>
      </div>

      {/* Wholesale Pricing Formula Guidance Banner */}
      <div className="rounded-2xl border border-action/20 bg-action-soft/30 p-3.5 text-xs text-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-action text-white">
            <Package className="size-4" />
          </div>
          <div>
            <p className="font-bold text-accent">Wholesale Pricing Formula (Carton ⇄ Piece)</p>
            <p className="text-[11px] text-muted">
              1 Carton Rate = Piece Rate × Carton Pieces. Piece rate ya Carton rate me se koi bhi likhein, doosra khud calculate ho jata hai. Agar dono rate same aa rahe hon to &ldquo;1 Ctn = X pcs&rdquo; me carton ke pieces set karein! Jis product par carton packing nahi hai, us ka &ldquo;Ctn&rdquo; toggle OFF karein — sirf product (piece) price active rahegi.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-surface px-3 py-1.5 border border-line text-[11px] font-bold text-accent shadow-2xs shrink-0">
          <span>📦 Formula:</span>
          <span className="text-action font-black">1 Ctn ÷ Pieces = Piece Rate</span>
        </div>
      </div>

      {/* Main Table Section */}
      <section className={`${panelClass} overflow-hidden rounded-2xl shadow-xs`}>
        {/* Top Control Bar: Filter Tabs & CSV Export */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-surface p-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: `All (${totalCount})` },
              { id: "priced", label: `Published (${publishedCount})` },
              { id: "quote", label: `Quote only (${quoteOnlyCount})` },
              { id: "sale", label: `On Sale (${onSaleCount})` },
              { id: "stock", label: `Out of stock (${outOfStockCount})` },
              { id: "missing-units", label: `Missing Pcs/Ctn (${missingUnitsCount})` },
            ].map(({ id, label }) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-action text-white shadow-xs"
                      : "border border-line bg-surface text-secondary hover:bg-surface-soft hover:text-content"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-secondary shadow-xs transition hover:border-action hover:text-action shrink-0"
          >
            <Download className="size-3.5 text-muted" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Brand Quick-Filter Pills Row */}
        {brands.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-line bg-surface px-3 py-2 sm:px-4 scrollbar-thin">
            <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-muted pr-2 border-r border-line/60">
              Brands
            </span>
            <button
              type="button"
              onClick={() => setSelectedBrand("")}
              className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                !selectedBrand
                  ? "bg-action text-white shadow-2xs"
                  : "border border-line bg-surface-soft text-secondary hover:text-content hover:bg-surface"
              }`}
            >
              <span>All Brands</span>
              <span className={`rounded-full px-1.5 text-[10px] font-bold ${!selectedBrand ? "bg-white/20 text-white" : "bg-line text-muted"}`}>
                {totalCount}
              </span>
            </button>
            {brands.map(({ name, count }) => {
              const active = selectedBrand.toLowerCase() === name.toLowerCase();
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedBrand(active ? "" : name)}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-action text-white shadow-2xs"
                      : "border border-line bg-surface-soft text-secondary hover:text-content hover:bg-surface"
                  }`}
                >
                  <span>{name}</span>
                  <span className={`rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-line text-muted"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Category Filter Row */}
        <div className="flex flex-col gap-2.5 border-b border-line bg-surface-soft/40 p-3 sm:flex-row sm:items-center sm:px-4">
          {/* Search Input */}
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted" />
            <input
              aria-label="Search products"
              placeholder="Search by any word, name, brand, SKU or pieces (e.g. Fresco 300, 36 pcs)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-line-strong/80 bg-surface pl-9 pr-8 text-xs font-medium text-content outline-none transition focus:border-action focus:ring-1 focus:ring-action sm:text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 rounded-full p-1 text-muted hover:text-content"
                title="Clear search query"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:w-64">
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-xl border border-line-strong/80 bg-surface px-3 text-xs font-medium text-content outline-none transition focus:border-action focus:ring-1 focus:ring-action sm:text-sm"
            >
              <option value="">All categories ({totalCount})</option>
              {categoriesWithCounts.map(({ name, count }) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Clear Filter Bar */}
        {(selectedBrand || category || query.trim() || filter !== "all") && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-action-soft/20 px-4 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-accent">
                Showing {visible.length} of {totalCount} items
              </span>
              <span className="text-muted">•</span>
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 rounded-md border border-action/30 bg-action/10 px-2 py-0.5 text-[11px] font-bold text-action">
                  Brand: {selectedBrand}
                  <button
                    type="button"
                    onClick={() => setSelectedBrand("")}
                    className="hover:text-action-hover"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] font-bold text-content">
                  Category: {category}
                  <button
                    type="button"
                    onClick={() => setCategory("")}
                    className="hover:text-action"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {filter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] font-bold text-content">
                  Status: {filter === "priced" ? "Published" : filter === "quote" ? "Quote only" : filter === "sale" ? "On Sale" : filter === "stock" ? "Out of stock" : "Missing Pcs/Ctn"}
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="hover:text-action"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
              {query.trim() && (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] font-bold text-content">
                  &ldquo;{query}&rdquo;
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="hover:text-action"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedBrand("");
                setCategory("");
                setFilter("all");
                setQuery("");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-bold text-action transition hover:bg-surface-soft"
            >
              <X className="size-3" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}

        {/* Bulk Selection Actions Banner */}
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-accent-soft/70 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-action px-2 py-0.5 font-bold text-white">
                {selected.length} selected
              </span>
              <button
                onClick={() => setSelected([])}
                className="font-semibold text-action underline hover:text-action-hover"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Percentage adjustment */}
              <div className="flex items-center gap-1.5">
                <span className="text-secondary font-medium">Adjust:</span>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="-100"
                    max="1000"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    placeholder="10"
                    className="h-7 w-16 rounded-lg border border-line-strong bg-surface px-2 text-xs font-bold text-content"
                  />
                  <span className="pointer-events-none absolute right-1.5 text-[11px] text-muted font-bold">
                    %
                  </span>
                </div>
                <button
                  disabled={disabled || pending || !adjustment}
                  onClick={applyAdjustment}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-bold text-action transition hover:border-action disabled:opacity-50"
                >
                  Apply
                </button>
              </div>

              {/* Set Quote Only / Published */}
              <div className="flex items-center gap-1.5 border-l border-line pl-2">
                <button
                  disabled={disabled || pending}
                  onClick={() => bulkSetQuoteOnly(true)}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
                >
                  Set Quote Only
                </button>
                <button
                  disabled={disabled || pending}
                  onClick={() => bulkSetQuoteOnly(false)}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
                >
                  Set Published
                </button>
              </div>

              {/* Set Stock / Availability */}
              <div className="flex items-center gap-1.5 border-l border-line pl-2">
                <button
                  disabled={disabled || pending}
                  onClick={() => bulkSetStock(true)}
                  className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-900 transition hover:bg-rose-100 disabled:opacity-50"
                  title="Mark selected products as Out of Stock"
                >
                  Mark Out of Stock
                </button>
                <button
                  disabled={disabled || pending}
                  onClick={() => bulkSetStock(false)}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
                  title="Mark selected products as In Stock (20 ctns)"
                >
                  Mark In Stock
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="border-b border-line bg-surface-soft/80 text-[11px] font-bold uppercase tracking-wider text-secondary">
              <tr>
                <th className="w-10 p-3.5 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all visible products"
                    checked={
                      visible.length > 0 &&
                      visible.every((row) => selected.includes(row.id))
                    }
                    onChange={(e) =>
                      setSelected(e.target.checked ? visible.map((r) => r.id) : [])
                    }
                    className="size-4 accent-action cursor-pointer rounded"
                  />
                </th>
                <th className="min-w-56 p-3.5">Product & SKU</th>
                <th className="w-40 p-3.5">
                  <div className="flex items-center gap-1">
                    <span>Regular Rate</span>
                    <span className="text-[10px] font-normal normal-case text-muted">
                      (Ctn ⇄ Piece)
                    </span>
                  </div>
                </th>
                <th className="w-40 p-3.5">
                  <div className="flex items-center gap-1">
                    <span>Sale Rate</span>
                    <span className="text-[10px] font-normal normal-case text-muted">
                      (Optional)
                    </span>
                  </div>
                </th>
                <th className="w-36 p-3.5 text-center">Store Status</th>
                <th className="w-24 p-3.5">Stock (ctn)</th>
                <th className="w-24 p-3.5">Pcs / Ctn</th>
                <th className="w-24 p-3.5">MOQ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line/70">
              {visible.map((row) => {
                const draft = drafts[row.id] ?? toDraft(row);
                const isDirty = Boolean(drafts[row.id]);
                const cartonOn = draft.cartonEnabled;
                const units = cartonOn
                  ? (Number(draft.unitsPerCarton) > 0 ? Number(draft.unitsPerCarton) : (detectUnitsFromName(row.name) || 1))
                  : 0;
                const regPiece = cartonOn
                  ? draft.piecePrice || calcPiece(draft.price, units)
                  : draft.piecePrice || draft.price;
                const salePiece = cartonOn
                  ? (draft.salePiecePrice || (draft.salePrice ? calcPiece(draft.salePrice, units) : ""))
                  : (draft.salePiecePrice || draft.salePrice);
                const isOutOfStock = Number(draft.stock) === 0;

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isDirty
                        ? "bg-amber-50/40 dark:bg-amber-950/20"
                        : "hover:bg-surface-soft/60"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center align-top pt-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.name}`}
                        checked={selected.includes(row.id)}
                        onChange={(e) =>
                          setSelected((curr) =>
                            e.target.checked
                              ? [...curr, row.id]
                              : curr.filter((id) => id !== row.id),
                          )
                        }
                        className="size-4 accent-action cursor-pointer rounded"
                      />
                    </td>

                    {/* Product Info */}
                    <td className="p-3.5 align-top">
                      <div className="min-w-48 max-w-72">
                        <Link
                          href={`/admin/products/${row.id}`}
                          className="font-bold text-content hover:text-action transition-colors line-clamp-2"
                        >
                          {row.name}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[11px] text-muted">
                            {row.sku}
                          </span>
                          <span className="text-muted/40">•</span>
                          {inferBrandFromName(row.name, row.brand) && inferBrandFromName(row.name, row.brand) !== "Other" && (
                            <button
                              type="button"
                              onClick={() => setSelectedBrand(inferBrandFromName(row.name, row.brand))}
                              className="rounded-md bg-action/10 px-1.5 py-0.5 text-[10px] font-bold text-action hover:bg-action hover:text-white transition"
                              title={`Filter by brand: ${inferBrandFromName(row.name, row.brand)}`}
                            >
                              {inferBrandFromName(row.name, row.brand)}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setCategory(row.category)}
                            className="rounded-md bg-surface-soft px-1.5 py-0.5 text-[10px] font-semibold text-secondary hover:text-action transition"
                            title={`Filter by category: ${row.category}`}
                          >
                            {row.category}
                          </button>
                          {isDirty && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                              Unsaved
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Regular Price (Carton & Piece Linked) */}
                    <td className="p-3.5 align-top">
                      <div className="w-36 space-y-1.5">
                                            {/* Carton Rate Input — only when carton pricing is on */}
                                            {cartonOn && (
                                              <div className="relative flex items-center">
                                                <span className="pointer-events-none absolute left-2 text-[11px] font-bold text-muted">
                                                  Rs
                                                </span>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  aria-label={`${row.name} carton rate`}
                                                  value={draft.price}
                                                  disabled={disabled || pending}
                                                  onChange={(e) => handleCartonPriceChange(row, draft, e.target.value)}
                                                  placeholder={draft.piecePrice && units > 1 ? (Number(draft.piecePrice) * units).toFixed(2) : "0.00"}
                                                  className="h-8 w-full rounded-lg border border-line-strong/80 bg-surface pl-5 pr-9 text-xs font-bold text-content tabular-nums outline-none transition focus:border-action focus:ring-1 focus:ring-action"
                                                />
                                                <span className="pointer-events-none absolute right-1.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                                                  /ctn
                                                </span>
                                              </div>
                                            )}

                                            {/* Piece Rate Input (Two-Way Calculation) - High-Visibility Red */}
                                            <div className="relative flex items-center">
                                              <span className="pointer-events-none absolute left-2 text-[10px] font-extrabold text-red-600 dark:text-red-400">
                                                Rs
                                              </span>
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                aria-label={`${row.name} piece rate`}
                                                value={regPiece}
                                                disabled={disabled || pending}
                                                onChange={(e) => handlePiecePriceChange(row, draft, e.target.value)}
                                                placeholder="0.00"
                                                className={`${cartonOn ? "h-7 text-[11px]" : "h-8 text-xs"} w-full rounded-lg border border-red-300 bg-red-50/90 pl-5 pr-8 font-extrabold text-red-700 tabular-nums outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 placeholder:text-red-300`}
                                              />
                                              <span className="pointer-events-none absolute right-1.5 text-[9px] font-extrabold text-red-600 dark:text-red-400">
                                                /pc
                                              </span>
                                            </div>
                                          </div>
                                        </td>

                    {/* Sale Price (Carton & Piece) */}
                    <td className="p-3.5 align-top">
                      <div className="w-36 space-y-1.5">
                                            {/* Sale Carton Rate — only when carton pricing is on */}
                                            {cartonOn && (
                                              <div className="relative flex items-center">
                                                <span className="pointer-events-none absolute left-2 text-[11px] font-bold text-muted">
                                                  Rs
                                                </span>
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  aria-label={`${row.name} sale carton rate`}
                                                  value={draft.salePrice}
                                                  disabled={disabled || pending}
                                                  onChange={(e) => handleSaleCartonPriceChange(row, draft, e.target.value)}
                                                  placeholder="No sale"
                                                  className="h-8 w-full rounded-lg border border-line-strong/80 bg-surface pl-5 pr-9 text-xs font-bold text-content tabular-nums outline-none transition focus:border-action focus:ring-1 focus:ring-action placeholder:font-normal placeholder:text-muted/60"
                                                />
                                                <span className="pointer-events-none absolute right-1.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                                                  /ctn
                                                </span>
                                              </div>
                                            )}

                                            {/* Sale Piece Rate */}
                                            <div className="relative flex items-center">
                                              <span className="pointer-events-none absolute left-2 text-[10px] font-bold text-muted">
                                                Rs
                                              </span>
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                aria-label={`${row.name} sale piece rate`}
                                                value={salePiece}
                                                disabled={disabled || pending}
                                                onChange={(e) => handleSalePiecePriceChange(row, draft, e.target.value)}
                                                placeholder={cartonOn ? "—" : "No sale"}
                                                className={`${cartonOn ? "h-7 text-[11px]" : "h-8 text-xs"} w-full rounded-lg border ${cartonOn ? "border-line bg-surface-soft/60 text-secondary" : "border-line-strong/80 bg-surface text-content"} pl-5 pr-8 font-medium tabular-nums outline-none transition focus:border-action focus:ring-1 focus:ring-action placeholder:text-muted/40`}
                                              />
                                              <span className="pointer-events-none absolute right-1.5 text-[9px] font-medium text-muted">
                                                /pc
                                              </span>
                                            </div>
                                          </div>
                                        </td>

                    {/* Storefront Pricing Mode / Quote Only */}
                    <td className="p-3.5 text-center align-top pt-4">
                      <button
                        type="button"
                        disabled={disabled || pending}
                        onClick={() =>
                          edit(row, { priceOnRequest: !draft.priceOnRequest })
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition shadow-xs ${
                          draft.priceOnRequest
                            ? "border border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200"
                            : "border border-emerald-500 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-100"
                        }`}
                        title={
                          draft.priceOnRequest
                            ? "Currently Quote Only (Customer requests quote). Click to publish price."
                            : "Currently Published (Price visible in store). Click to make Quote Only."
                        }
                      >
                        <span
                          className={`size-2 rounded-full ${
                            draft.priceOnRequest
                              ? "bg-amber-600"
                              : "bg-emerald-600"
                          }`}
                        />
                        <span>
                          {draft.priceOnRequest ? "Quote Only" : "Published"}
                        </span>
                      </button>
                    </td>

                    {/* Stock */}
                    <td className="p-3.5 align-top pt-4">
                      <div className="w-20">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          aria-label={`${row.name} stock`}
                          value={draft.stock}
                          disabled={disabled || pending}
                          onChange={(e) => edit(row, { stock: e.target.value })}
                          className={`h-8 w-full rounded-lg border px-2 text-xs font-bold tabular-nums outline-none transition ${
                            isOutOfStock
                              ? "border-danger-line bg-danger-soft text-danger focus:border-danger"
                              : "border-line-strong/80 bg-surface text-content focus:border-action focus:ring-1 focus:ring-action"
                          }`}
                        />
                        {isOutOfStock ? (
                          <button
                            type="button"
                            onClick={() => edit(row, { stock: "20" })}
                            className="mt-1 block text-left text-[10px] font-bold uppercase tracking-wider text-danger hover:underline cursor-pointer"
                            title="Carton unavailable. Click to mark In Stock (20 ctns)"
                          >
                            Out of stock
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => edit(row, { stock: "0" })}
                            className="mt-1 block text-left text-[10px] font-bold uppercase tracking-wider text-emerald-700 hover:text-danger hover:underline cursor-pointer"
                            title="Click to mark Carton Unavailable / Out of Stock"
                          >
                            In stock
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Units per Carton + Carton pricing toggle */}
                    <td className="p-3.5 align-top pt-4">
                      <div className="w-24 space-y-1.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={cartonOn}
                          aria-label={`${row.name} carton pricing`}
                          disabled={disabled || pending}
                          onClick={() => handleCartonToggle(row, draft, !cartonOn)}
                          className={`inline-flex w-full items-center justify-between gap-1 rounded-full border px-2 py-1 text-[10px] font-extrabold transition shadow-xs ${
                            cartonOn
                              ? "border-emerald-500 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-100"
                              : "border-line-strong bg-surface-soft text-muted hover:text-secondary"
                          }`}
                          title={
                            cartonOn
                              ? "Carton pricing ON — turn off to sell by piece only (carton price deactivated)"
                              : "Carton pricing OFF — only product (piece) price is active. Click to enable carton pricing."
                          }
                        >
                          <span className="size-2 rounded-full bg-current opacity-70" />
                          <span className="flex-1 text-left">{cartonOn ? "Ctn ON" : "Ctn OFF"}</span>
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          aria-label={`${row.name} units per carton`}
                          value={cartonOn ? draft.unitsPerCarton : ""}
                          placeholder="—"
                          disabled={disabled || pending || !cartonOn}
                          onChange={(e) =>
                            handleUnitsChange(row, draft, e.target.value)
                          }
                          className={`h-8 w-full rounded-lg border px-2 text-xs font-bold tabular-nums outline-none transition ${
                            !cartonOn
                              ? "border-line bg-surface-soft/60 text-muted/50 placeholder:text-muted/40"
                              : units <= 1
                                ? "border-amber-400 bg-amber-50 text-amber-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200"
                                : "border-line-strong/80 bg-surface text-content focus:border-action focus:ring-1 focus:ring-action"
                          }`}
                        />
                        {cartonOn && units <= 1 && (
                          <span className="mt-1 block text-[9px] font-bold text-amber-800 dark:text-amber-300">
                            Set pcs/ctn
                          </span>
                        )}
                        {!cartonOn && (
                          <span className="mt-1 block text-[9px] font-bold text-muted">
                            Piece only
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Minimum Order Cartons */}
                    <td className="p-3.5 align-top pt-4">
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          aria-label={`${row.name} minimum cartons`}
                          value={draft.minimumOrderCartons}
                          disabled={disabled || pending}
                          onChange={(e) =>
                            edit(row, { minimumOrderCartons: e.target.value })
                          }
                          className="h-8 w-full rounded-lg border border-line-strong/80 bg-surface px-2 text-xs font-bold text-content tabular-nums outline-none transition focus:border-action focus:ring-1 focus:ring-action"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!visible.length && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-surface-soft text-muted mb-3">
                <Search className="size-6" />
              </div>
              <p className="text-sm font-bold text-content">No products match your active filters</p>
              <p className="mt-1 text-xs text-muted max-w-sm">
                Try clearing the search query or selecting a different brand or category to see more products.
              </p>
              {(selectedBrand || category || query.trim() || filter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand("");
                    setCategory("");
                    setFilter("all");
                    setQuery("");
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-action px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-action-hover"
                >
                  <X className="size-3.5" />
                  <span>Clear all filters ({totalCount} total products)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-soft/40 px-4 py-3 text-xs text-muted">
          <span>
            Showing <strong>{visible.length}</strong> of {totalCount} products. Enter either Carton or Piece price — both synchronize automatically. Products with the Ctn toggle OFF use only the product (piece) price.
          </span>
          <span className="font-semibold text-action">
            Wholesale minimum checkout: PKR 5,000
          </span>
        </div>
      </section>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xl">
        <div>
          <p className="text-sm font-bold text-content">
            {dirtyIds.length ? (
              <span className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {dirtyIds.length} unsaved product{dirtyIds.length === 1 ? "" : "s"}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-secondary">
                <Check className="size-4 text-action" />
                <span>All prices and stock are up to date</span>
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Click &ldquo;Quote Only&rdquo; to prompt customers for custom quote, or &ldquo;Published&rdquo; to show rates online.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!dirtyIds.length || pending}
            onClick={() => {
              setDrafts({});
              setError("");
            }}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-secondary shadow-xs transition hover:bg-surface-soft disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={disabled || pending || !dirtyIds.length}
            onClick={save}
            className={`${buttonClass} rounded-xl px-5 py-2 text-xs font-bold shadow-md`}
          >
            <Save className="size-4" />
            {pending ? "Saving changes…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-danger-line bg-danger-soft p-4 text-xs font-semibold text-danger shadow-xs"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-line bg-accent-soft p-4 text-xs font-semibold text-accent shadow-xs"
        >
          <Check className="size-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
