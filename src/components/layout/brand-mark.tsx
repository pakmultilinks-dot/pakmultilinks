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
        "focus-ring inline-flex min-w-0 items-center rounded-xl",
        light && "bg-surface-soft px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,.12)] ring-1 ring-white/20",
      )}
      aria-label={`${company.name} home`}
    >
      <Image
        src="/images/pak-multilinks-logo.webp"
        alt="Pak Multilinks Hygiene — Corporate Supplies"
        width={500}
        height={189}
        priority
        unoptimized
        sizes={compact ? "160px" : light ? "290px" : "280px"}
        className={cn(
          "brand-logo brand-logo-light h-[56px] sm:h-[64px] md:h-[74px] lg:h-[80px] w-auto max-w-[185px] sm:max-w-[215px] md:max-w-[255px] lg:max-w-[280px] object-contain transition-transform duration-200 hover:scale-[1.02]",
          compact && "!h-[44px] sm:!h-[48px] !w-auto !max-w-[155px]",
          light && "!h-[68px] sm:!h-[76px] md:!h-[82px] !w-auto !max-w-[270px]",
        )}
      />
      <Image
        src="/images/pak-multilinks-logo-dark.webp"
        alt="Pak Multilinks Hygiene — Corporate Supplies"
        width={500}
        height={189}
        priority
        unoptimized
        sizes={compact ? "160px" : light ? "290px" : "280px"}
        className={cn(
          "brand-logo brand-logo-dark h-[56px] sm:h-[64px] md:h-[74px] lg:h-[80px] w-auto max-w-[185px] sm:max-w-[215px] md:max-w-[255px] lg:max-w-[280px] object-contain transition-transform duration-200 hover:scale-[1.02]",
          compact && "!h-[44px] sm:!h-[48px] !w-auto !max-w-[155px]",
          light && "!h-[68px] sm:!h-[76px] md:!h-[82px] !w-auto !max-w-[270px]",
        )}
      />
    </Link>
  );
}
