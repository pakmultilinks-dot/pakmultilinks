"use client";

import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  label = "Quantity",
  disabled = false,
}: QuantitySelectorProps) {
  const decrementDisabled = disabled || value <= min;
  const incrementDisabled = disabled || (typeof max === "number" && value >= max);

  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="grid size-10 place-items-center rounded-l-xl text-slate-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-35"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={decrementDisabled}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <span className="min-w-10 px-2 text-center text-sm font-semibold text-slate-900" aria-live="polite">
        <span className="sr-only">{label}: </span>
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        className="grid size-10 place-items-center rounded-r-xl text-slate-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-35"
        onClick={() => onChange(typeof max === "number" ? Math.min(max, value + 1) : value + 1)}
        disabled={incrementDisabled}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
