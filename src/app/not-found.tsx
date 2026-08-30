import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return <section className="site-shell grid min-h-[62vh] place-items-center py-20 text-center"><div><span className="mx-auto grid size-20 place-items-center rounded-full bg-[#eaf6ed] text-[#17643a]"><SearchX className="size-9" /></span><p className="eyebrow mt-6">404 · Not found</p><h1 className="mt-3 text-4xl font-black tracking-[-.04em] text-[#173c29]">We couldn’t find that page.</h1><p className="mx-auto mt-4 max-w-md text-[#66756c]">The link may have changed, or the item may no longer be available.</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="rounded-xl border border-[#bfd3c5] px-5 py-3 text-sm font-extrabold text-[#17643a]">Go home</Link><Link href="/shop" className="rounded-xl bg-[#17643a] px-5 py-3 text-sm font-extrabold text-white">Browse shop</Link></div></div></section>;
}
