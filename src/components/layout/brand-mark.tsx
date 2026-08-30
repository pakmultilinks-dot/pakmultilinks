import Image from "next/image";
import Link from "next/link";

import { company } from "@/lib/company";
import { cn } from "@/lib/utils";

export function BrandMark({ compact = false, light = false, onNavigate }: { compact?: boolean; light?: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center rounded-xl",
        light && "bg-[#f5faf6] px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,.12)] ring-1 ring-white/20",
      )}
      aria-label={`${company.name} home`}
    >
      <Image
        src="/images/pak-multilinks-logo.png"
        alt="Pak Multilinks Hygiene — Corporate Supplies"
        width={2039}
        height={771}
        priority
        sizes={compact ? "142px" : light ? "250px" : "210px"}
        className={cn(
          "h-auto w-[178px] object-contain sm:w-[210px]",
          compact && "w-[142px] sm:w-[160px]",
          light && "w-[220px] sm:w-[250px]",
        )}
      />
    </Link>
  );
}
