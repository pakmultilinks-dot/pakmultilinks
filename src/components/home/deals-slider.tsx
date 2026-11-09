"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PublicDealBanner } from "@/lib/deals";

const ROTATION_DELAY = 5_000;
function subscribeToMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function DealsSlider({ deals }: { deals: PublicDealBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const rotating = !reducedMotion && !hovered && !focused;
  const active = current % Math.max(1, deals.length);

  useEffect(() => {
    if (deals.length < 2 || !rotating) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setCurrent(index => (index + 1) % deals.length);
    }, ROTATION_DELAY);
    return () => window.clearInterval(timer);
  }, [deals.length, rotating]);

  function select(index: number) {
    setCurrent((index + deals.length) % deals.length);
  }
  if (!deals.length) return null;

  return (
    <section className="relative w-full border-b border-line bg-canvas overflow-hidden" aria-label="Featured offers">
      <div className="mx-auto w-full max-w-[1920px] px-2.5 pt-2 sm:px-0 sm:pt-0">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Current deals"
          className="deals-slider-viewport relative isolate w-full overflow-hidden rounded-xl md:rounded-none bg-white dark:bg-surface shadow-xs animate-scale-enter"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) select(active + (dx < 0 ? 1 : -1));
        }}
      >
        {deals.map((deal, index) => (
          <Link
            key={deal.id}
            href={deal.linkUrl}
            aria-hidden={index !== active}
            tabIndex={index === active ? 0 : -1}
            className={`absolute inset-0 block size-full transition-transform duration-700 ease-out motion-reduce:transition-none ${
              index === active
                ? "z-10 translate-x-0"
                : index > active
                ? "pointer-events-none translate-x-full"
                : "pointer-events-none -translate-x-full"
            }`}
          >
            <div className="relative size-full overflow-hidden bg-white dark:bg-surface">
              {/* Mobile banner image */}
              <div className="relative size-full block md:hidden">
                <Image
                  src={deal.mobileImageUrl || deal.imageUrl}
                  alt={deal.alt}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                  unoptimized
                  sizes="100vw"
                  className="size-full object-cover object-center"
                />
              </div>

              {/* Desktop banner image */}
              <div className="relative size-full hidden md:block">
                <Image
                  src={deal.imageUrl}
                  alt={deal.alt}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                  unoptimized
                  sizes="(min-width: 768px) 100vw, 1920px"
                  className="size-full object-cover object-center"
                />
              </div>
            </div>
            <span className="sr-only">{deal.title}</span>
          </Link>
        ))}

        {/* Floating Overlay Dots & Controls */}
        {deals.length > 1 && (
          <>
            <div
              className="pointer-events-none absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-md shadow-md sm:bottom-4"
              aria-label="Offer controls"
            >
              {deals.map((deal, index) => (
                <button
                  key={deal.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    select(index);
                  }}
                  aria-label={`Show ${deal.title}`}
                  aria-current={index === active ? "true" : undefined}
                  className="pointer-events-auto p-0.5 focus-ring rounded-full"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      index === active ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Metro-style direct white Chevrons matching Metro.pk */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                select(active - 1);
              }}
              aria-label="Previous offer"
              className="absolute left-1 sm:left-4 top-1/2 z-20 -translate-y-1/2 p-1.5 sm:p-2 text-white/90 hover:text-white hover:scale-110 active:scale-95 transition-all drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] focus:outline-none"
            >
              <ChevronLeft className="size-7 sm:size-11" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                select(active + 1);
              }}
              aria-label="Next offer"
              className="absolute right-1 sm:right-4 top-1/2 z-20 -translate-y-1/2 p-1.5 sm:p-2 text-white/90 hover:text-white hover:scale-110 active:scale-95 transition-all drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] focus:outline-none"
            >
              <ChevronRight className="size-7 sm:size-11" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>
      </div>
    </section>
  );
}
