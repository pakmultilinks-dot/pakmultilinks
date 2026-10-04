import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeHero() {
  return <section className="store-hero" aria-labelledby="home-hero-title">
    <div className="site-shell grid items-center gap-8 py-9 sm:py-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-14 lg:py-16">
      <div className="max-w-lg">
        <p className="text-[11px] font-medium uppercase tracking-[.18em] text-neutral-500">Tissue, paper & everyday care</p>
        <h1 id="home-hero-title" className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-[1.08] tracking-[-.045em] text-[#23372d]">The essentials.<br />Always within reach.</h1>
        <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-600 sm:text-base">Tissues and hygiene supplies for your everyday spaces. Order by the carton, or speak to us about your business needs.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"><Link href="/shop" className="commerce-button commerce-button-primary">Shop the collection<ArrowRight className="size-4" /></Link><Link href="/request-quote" className="commerce-button commerce-button-secondary">Request a bulk quote</Link></div>
        <p className="mt-6 text-xs text-neutral-500">Based in Lahore · Wholesale & business supply</p>
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e9e8e2] lg:aspect-square"><Image src="/images/warehouse-team.webp" alt="Warehouse staff packing tissue cartons and checking inventory, with colleagues organizing stock in the background" fill preload sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" /></div>
    </div>
  </section>;
}
