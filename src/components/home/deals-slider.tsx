"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
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
  const [playback, setPlayback] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const playing = playback ?? !reducedMotion;
  const rotating = playing && !hovered && !focused;
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
    setPlayback(false);
  }
  if (!deals.length) return null;

  return <section className="w-full border-b border-neutral-200 bg-[#f4f3ee]" aria-label="Featured offers">
    <h1 className="sr-only">Pak Multilinks tissue and hygiene supplies</h1>
    <div role="region" aria-roledescription="carousel" aria-label="Current deals" className="relative isolate aspect-[3/4] w-full overflow-hidden md:aspect-[16/9]"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onTouchStart={event => { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; }}
      onTouchEnd={event => { const start = touchStart.current; touchStart.current = null; if (!start) return; const touch = event.changedTouches[0]; const dx = touch.clientX - start.x; const dy = touch.clientY - start.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) select(active + (dx < 0 ? 1 : -1)); }}>
      {deals.map((deal, index) => <Link key={deal.id} href={deal.linkUrl} aria-hidden={index !== active} tabIndex={index === active ? 0 : -1}
        className={`absolute inset-0 flex flex-col transition-transform duration-700 ease-out motion-reduce:transition-none ${index === active ? "z-10 translate-x-0" : index > active ? "pointer-events-none translate-x-full" : "pointer-events-none -translate-x-full"}`}>
        <div className="relative aspect-[16/9] w-full shrink-0 md:absolute md:inset-0 md:aspect-auto"><Image src={deal.imageUrl} alt={deal.alt} fill preload={index === 0} unoptimized={deal.imageUrl.startsWith("https://")} sizes="100vw" className="object-contain object-center" /></div>
        <div className="flex flex-1 flex-col justify-center px-6 py-5 text-[#23372d] md:hidden"><p className="text-[10px] uppercase tracking-[.16em] text-neutral-500">Tissue & hygiene essentials</p><h2 className="mt-3 font-serif text-[clamp(24px,7vw,36px)] leading-tight">{deal.title}</h2><p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">Everyday supplies for your home and workplace. Explore our range or arrange a bulk order.</p><span className="mt-5 w-fit border-b border-[#23372d] pb-1 text-sm font-medium">Shop the collection →</span></div>
        <span className="sr-only md:not-sr-only md:hidden">{deal.title}</span>
      </Link>)}
    </div>
    {deals.length > 1 && <div className="flex items-center justify-center gap-1 bg-white py-2" aria-label="Offer controls">
      <button type="button" onClick={() => select(active - 1)} aria-label="Previous offer" className="focus-ring grid size-11 place-items-center text-[#263f31]"><ChevronLeft className="size-5" /></button>
      {deals.map((deal, index) => <button key={deal.id} type="button" onClick={() => select(index)} aria-label={`Show ${deal.title}`} aria-current={index === active ? "true" : undefined} className="focus-ring grid size-11 place-items-center"><span className={`h-2 rounded-full ${index === active ? "w-6 bg-[#263f31]" : "w-2 bg-neutral-300"}`} /></button>)}
      <button type="button" onClick={() => select(active + 1)} aria-label="Next offer" className="focus-ring grid size-11 place-items-center text-[#263f31]"><ChevronRight className="size-5" /></button>
      <button type="button" onClick={() => setPlayback(!playing)} aria-label={playing ? "Pause offers" : "Play offers"} className="focus-ring grid size-11 place-items-center text-[#263f31]">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</button>
    </div>}
  </section>;
}
