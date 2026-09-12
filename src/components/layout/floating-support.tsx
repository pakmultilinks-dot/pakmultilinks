"use client";

import { Bot, BriefcaseBusiness, MessageCircle, Phone, ShoppingBag, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { company } from "@/lib/company";

const supportPhone = company.phoneHref;

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {open && (
        <div id="support-assistant" ref={panelRef} role="dialog" aria-modal="false" aria-labelledby="support-assistant-title" className="fixed bottom-[13rem] left-4 z-[70] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-[#c9ddcf] bg-white shadow-[0_24px_70px_rgba(10,57,34,.22)] animate-slide-up">
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f5634,#176c40)] px-5 py-5 text-white">
            <div className="absolute -right-7 -top-8 size-28 rounded-full bg-white/10" />
            <div className="relative flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><Bot className="size-5" /></span>
              <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-100/75">Online support</p><h2 id="support-assistant-title" className="mt-1 text-lg font-extrabold">Pak Multilinks Assistant</h2></div>
              <button type="button" onClick={() => setOpen(false)} className="ml-auto grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white" aria-label="Close assistant"><X className="size-4" /></button>
            </div>
          </div>
          <div className="p-4">
            <div className="rounded-2xl rounded-tl-md bg-[#eef7f0] px-4 py-3 text-sm leading-6 text-[#315943]">Assalam-o-Alaikum! Bulk hygiene supplies ke liye kis cheez mein help chahiye?</div>
            <div className="mt-4 grid gap-2">
              <Link href="/shop" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d7e6db] px-4 text-sm font-bold text-[#174c30] transition hover:border-[#8db89a] hover:bg-[#f3faf5]"><ShoppingBag className="size-4 text-[#20814f]" />Browse products <span className="ml-auto">→</span></Link>
              <Link href="/request-quote" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d7e6db] px-4 text-sm font-bold text-[#174c30] transition hover:border-[#8db89a] hover:bg-[#f3faf5]"><BriefcaseBusiness className="size-4 text-[#20814f]" />Request bulk quote <span className="ml-auto">→</span></Link>
              <a href={`tel:${supportPhone}`} className="flex min-h-12 items-center gap-3 rounded-xl bg-[#17643a] px-4 text-sm font-bold text-white transition hover:bg-[#10522f]"><Phone className="size-4" />Call {company.contactPerson} <span className="ml-auto">→</span></a>
            </div>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#718077]">Packing, price and delivery are confirmed with your requirement.</p>
          </div>
        </div>
      )}

      <div className="fixed bottom-20 left-4 z-[65] flex flex-col items-start gap-2.5">
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="support-assistant" aria-label="Ask assistant" title="Ask assistant" className="focus-ring group relative grid size-12 place-items-center rounded-full border border-white/60 bg-gradient-to-br from-[#28a760] via-[#177a46] to-[#0b4f2e] text-white shadow-[0_12px_30px_rgba(12,91,49,.3)] transition hover:-translate-y-0.5 hover:from-[#32b86c] hover:via-[#1c8a50] hover:to-[#0d5b35] hover:shadow-[0_16px_36px_rgba(12,91,49,.38)]"><Sparkles className="size-5" /><span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-[#177a46] bg-[#8ff0ad]" /></button>

        <a href={`https://wa.me/${supportPhone.replace("+", "")}`} target="_blank" rel="noreferrer" className="focus-ring grid size-12 place-items-center rounded-full border border-white/60 bg-gradient-to-br from-[#2fbd69] via-[#209451] to-[#116638] text-white shadow-[0_12px_30px_rgba(12,91,49,.3)] transition hover:-translate-y-0.5 hover:from-[#39ca75] hover:via-[#25a35b] hover:to-[#147441] hover:shadow-[0_16px_36px_rgba(12,91,49,.38)]" aria-label="Chat on WhatsApp with +92 300 6917 385" title="WhatsApp · +92 300 6917 385"><MessageCircle className="size-6" strokeWidth={2.4} /></a>
      </div>
    </>
  );
}
