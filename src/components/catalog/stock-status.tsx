import { cn } from "@/lib/utils";

type StockStatusProps = {
  stock: number;
  lowStockThreshold: number;
  allowBackorder?: boolean;
  minimumOrderCartons?: number;
  showQuantity?: boolean;
  className?: string;
};

export function StockStatus({
  stock,
  lowStockThreshold,
  allowBackorder,
  minimumOrderCartons = 1,
  showQuantity = false,
  className,
}: StockStatusProps) {
  const availableForMinimum = stock >= minimumOrderCartons;
  const isOutOfStock = !availableForMinimum && !allowBackorder;
  const isBackorder = !availableForMinimum && allowBackorder;
  const isLowStock = availableForMinimum && stock <= lowStockThreshold;

  const label = isOutOfStock
    ? "Out of stock"
    : isBackorder
      ? "Availability confirmed on request"
      : isLowStock
        ? showQuantity
          ? `Only ${stock} cartons left`
          : "Low stock"
        : showQuantity
          ? `${stock} cartons in stock`
          : "In stock";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isOutOfStock && "bg-stone-100 text-stone-600",
        isBackorder && "bg-amber-50 text-amber-800",
        isLowStock && "bg-amber-50 text-amber-800",
        !isOutOfStock && !isBackorder && !isLowStock &&
          "bg-emerald-50 text-emerald-800",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          isOutOfStock && "bg-stone-400",
          (isBackorder || isLowStock) && "bg-amber-500",
          !isOutOfStock && !isBackorder && !isLowStock && "bg-emerald-600",
        )}
      />
      {label}
    </span>
  );
}
