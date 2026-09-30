"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { PublicDealBanner } from "@/lib/deals";

const ROTATION_DELAY = 5_000;

export function DealsSlider({ deals }: { deals: PublicDealBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (deals.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % deals.length), ROTATION_DELAY);
    return () => window.clearInterval(timer);
  }, [deals.length, paused]);

  if (!deals.length) return null;

  return (
    <section className="w-full bg-[#fbfaf5]" aria-label="Featured offers">
      <div className="w-full">
        <div
          className="group relative isolate aspect-[16/9] w-full overflow-hidden bg-[#dbe9dd]"
          role="region"
          aria-roledescription="carousel"
          aria-label="Current deals"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
        >
          {deals.map((deal, index) => (
            <Link
              key={deal.id}
              href={deal.linkUrl}
              aria-hidden={index !== current}
              tabIndex={index === current ? 0 : -1}
              className={`absolute inset-0 transition duration-700 ease-out motion-reduce:transition-none ${index === current ? "z-10 translate-x-0 opacity-100" : "pointer-events-none z-0 translate-x-3 opacity-0"}`}
            >
              <Image
                src={deal.imageUrl}
                alt={deal.alt}
                fill
                priority={index === 0}
                unoptimized={deal.imageUrl.startsWith("https://")}
                sizes="100vw"
                className="object-cover object-center"
              />
              <span className="sr-only">{deal.title}</span>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}
