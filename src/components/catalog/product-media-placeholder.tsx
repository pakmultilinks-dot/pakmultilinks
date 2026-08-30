import { ImageIcon, PackageOpen } from "lucide-react";

import { cn } from "@/lib/utils";

export function ProductMediaPlaceholder({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid h-full w-full place-items-center bg-[linear-gradient(145deg,#f4f8f2,#e7f1e9)] text-center text-[#54705d]", className)}>
      <div className={compact ? "p-2" : "p-6"}>
        <span className={cn("mx-auto grid place-items-center rounded-2xl bg-white/90 shadow-sm", compact ? "size-10" : "size-16")}>
          {compact ? <ImageIcon className="size-5" /> : <PackageOpen className="size-7" />}
        </span>
        {!compact && <><p className="mt-4 text-sm font-extrabold text-[#284c36]">Image coming soon</p><p className="mt-1 text-xs">Product media will be added by admin.</p></>}
      </div>
    </div>
  );
}
