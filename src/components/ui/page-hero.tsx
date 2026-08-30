import Link from "next/link";

export function PageHero({ eyebrow, title, description, breadcrumb }: { eyebrow: string; title: string; description: string; breadcrumb?: string }) {
  return <section className="border-b border-[#dce8df] bg-[#edf7f0] py-12 sm:py-16"><div className="site-shell"><nav className="mb-7 flex items-center gap-2 text-xs font-semibold text-[#6d7e73]" aria-label="Breadcrumb"><Link href="/" className="hover:text-[#17643a] hover:underline">Home</Link><span aria-hidden="true">/</span><span aria-current="page">{breadcrumb ?? title}</span></nav><p className="eyebrow">{eyebrow}</p><h1 className="balance mt-4 max-w-4xl text-4xl font-black tracking-[-.045em] text-[#163c29] sm:text-6xl">{title}</h1><p className="pretty mt-5 max-w-2xl text-base leading-7 text-[#5d7164] sm:text-lg">{description}</p></div></section>;
}
