"use client";

import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { PublicDealBanner } from "@/lib/deals";

const ROTATION_DELAY = 5_000;

export function DealsSlider({ deals }: { deals: PublicDealBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const select = useCallback((index: number) => {
    setCurrent((index + deals.length) % deals.length);
  }, [deals.length]);

  useEffect(() => {
    if (deals.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % deals.length), ROTATION_DELAY);
    return () => window.clearInterval(timer);
  }, [deals.length, paused]);

  if (!deals.length) return null;

  return (
    <section className="bg-[#fbfaf5] py-14 sm:py-18" aria-labelledby="deals-heading">
      <div className="w-full">
        <div className="site-shell mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Featured offers</p>
            <h2 id="deals-heading" className="mt-2 text-3xl font-black tracking-[-.04em] text-[#173c29] sm:text-4xl">Deals &amp; highlights</h2>
          </div>
          <Link href="/shop" className="hidden text-sm font-extrabold text-[#17643a] hover:underline sm:inline-flex">View all products →</Link>
        </div>

        <div
          className="group relative isolate aspect-[16/10] overflow-hidden rounded-[1.75rem] border border-[#cfe0d3] bg-[#dbe9dd] shadow-[0_24px_65px_rgba(20,72,43,.14)] sm:aspect-[16/9]"
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
                alt=""
                fill
                aria-hidden="true"
                unoptimized={deal.imageUrl.startsWith("https://")}
                sizes="(max-width: 640px) 100vw, 1px"
                className="scale-110 object-cover opacity-35 blur-xl sm:hidden"
              />
              <Image
                src={deal.imageUrl}
                alt={deal.alt}
                fill
                priority={index === 0}
                unoptimized={deal.imageUrl.startsWith("https://")}
                sizes="(max-width: 1536px) 100vw, 1440px"
                className="object-contain object-center sm:object-cover"
              />
              <span className="sr-only">{deal.title}</span>
            </Link>
          ))}

          {deals.length > 1 && (
            <>
              <button type="button" onClick={() => select(current - 1)} className="focus-ring absolute left-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/85 text-[#15472d] shadow-lg backdrop-blur transition hover:bg-white sm:left-5 sm:size-12" aria-label="Previous deal"><ArrowLeft className="size-5" /></button>
              <button type="button" onClick={() => select(current + 1)} className="focus-ring absolute right-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/85 text-[#15472d] shadow-lg backdrop-blur transition hover:bg-white sm:right-5 sm:size-12" aria-label="Next deal"><ArrowRight className="size-5" /></button>

              <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/55 bg-[#103b27]/82 px-3 py-2 shadow-xl backdrop-blur-md sm:bottom-5">
                {deals.map((deal, index) => <button key={deal.id} type="button" onClick={() => select(index)} className={`h-2 rounded-full transition-all ${index === current ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`} aria-label={`Show deal ${index + 1}: ${deal.title}`} aria-current={index === current ? "true" : undefined} />)}
                <span className="mx-0.5 h-4 w-px bg-white/25" />
                <button type="button" onClick={() => setPaused((value) => !value)} className="grid size-5 place-items-center text-white/85 hover:text-white" aria-label={paused ? "Play deals slideshow" : "Pause deals slideshow"}>{paused ? <Play className="size-3.5" fill="currentColor" /> : <Pause className="size-3.5" fill="currentColor" />}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
