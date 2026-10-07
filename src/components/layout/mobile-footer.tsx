import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function MobileFooter() {
  return (
    <footer className="mobile-footer md:hidden">
      <nav aria-label="Store information" className="flex flex-wrap justify-center gap-x-5">
        <Link href="/about">About us</Link><Link href="/contact">Help & contact</Link><Link href="/account">My account</Link>
      </nav>
      <details className="group">
        <summary className="mx-auto flex min-h-11 w-fit cursor-pointer list-none items-center gap-1.5">More information <ChevronDown size={14} className="transition-transform group-open:rotate-180" /></summary>
        <nav aria-label="More store information" className="flex flex-wrap justify-center gap-x-5 pb-3">
          <Link href="/corporate-orders">Business orders</Link><Link href="/request-quote">Request a quote</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/returns">Returns</Link>
        </nav>
      </details>
    </footer>
  );
}
