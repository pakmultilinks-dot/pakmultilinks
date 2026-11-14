import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { company } from "@/lib/company";
import type { RateListFileRecord } from "@/lib/types";
import { RateListFilesStrip } from "./rate-list-files-strip";

interface RateListProps {
  rateListFiles?: RateListFileRecord[];
}

export function RateList({ rateListFiles = [] }: RateListProps) {
  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="site-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">Official rate list</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-content sm:text-4xl">
            Wholesale Rate List
          </h1>
          <p className="mt-3 text-sm text-secondary sm:text-base leading-relaxed">
            Download our official wholesale rate lists. For custom corporate pricing, institutional contracts, or bulk carton supplies, contact us directly on WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hi Pak Multilinks, I am inquiring about wholesale supplies")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="commerce-button commerce-button-primary inline-flex items-center gap-2"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Confirm rates on WhatsApp
            </a>
            <Link href="/request-quote" className="commerce-button commerce-button-secondary inline-flex items-center">
              Request a bulk quote
            </Link>
          </div>
        </div>

        {/* Official PDF Downloads Section (Managed dynamically from Backend) */}
        {rateListFiles.length > 0 && (
          <div className="mt-12 sm:mt-16 border-t border-line pt-10 sm:pt-14">
            <RateListFilesStrip files={rateListFiles} />
          </div>
        )}
      </div>
    </section>
  );
}

