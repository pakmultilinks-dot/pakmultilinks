import { ArrowLeft, PackageSearch } from "lucide-react";
import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center bg-[#f7f9f3] px-4 py-16 text-center">
      <div>
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#e8f3ea] text-[#17643a]">
          <PackageSearch className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#173c29]">
          Category not found
        </h1>
        <p className="mx-auto mt-3 max-w-md leading-7 text-[#607066]">
          This category may have moved or is not currently available in our catalog.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#17643a] px-5 text-sm font-extrabold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Browse all products
        </Link>
      </div>
    </section>
  );
}
