import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ShowcaseProduct {
  name: string;
  subtitle?: string;
  image: string;
  href: string;
}

const ROSE_PETAL_PRODUCTS: ShowcaseProduct[] = [
  { name: "Essentials", image: "/images/products/rose-petal/rose-petal-essentials.jpg", href: "/brand/rose-petal" },
  { name: "Multicolor", image: "/images/products/rose-petal/rose-petal-multicolor.jpg", href: "/brand/rose-petal" },
  { name: "Perfumed", image: "/images/products/rose-petal/rose-petal-perfumed.jpg", href: "/brand/rose-petal" },
  { name: "Luxury", image: "/images/products/rose-petal/rose-petal-luxury.jpg", href: "/brand/rose-petal" },
  { name: "Pop-up", image: "/images/products/rose-petal/rose-petal-pop-up.jpg", href: "/brand/rose-petal" },
  { name: "Soft Pack", image: "/images/products/rose-petal/rose-petal-soft-pack.jpg", href: "/brand/rose-petal" },
  { name: "Maxob Single", image: "/images/products/rose-petal/rose-petal-maxob-single.jpg", href: "/brand/rose-petal" },
  { name: "Maxob 3+1", image: "/images/products/rose-petal/rose-petal-maxob-3-plus-1.jpg", href: "/brand/rose-petal" },
  { name: "Zzoop Twin Roll", image: "/images/products/rose-petal/rose-petal-zzoop-twin-roll.jpg", href: "/brand/rose-petal" },
  { name: "Zzoop Maxi Roll", image: "/images/products/rose-petal/rose-petal-zzoop-maxi-roll.jpg", href: "/brand/rose-petal" },
  { name: "Party Pack", image: "/images/products/rose-petal/rose-petal-party-pack.jpg", href: "/brand/rose-petal" },
  { name: "Pocket Pack", image: "/images/products/rose-petal/rose-petal-pocket-pack.jpg", href: "/brand/rose-petal" },
];

const TISSUE_CRAFT_PRODUCTS: ShowcaseProduct[] = [
  { name: "For You Pop-Up", subtitle: "Ultra Strong \u00b7 300 sheets", image: "/images/products/for-you-pop-up-300.jpg", href: "/product/for-you-pop-up-300" },
  { name: "For You Facial Tissues", subtitle: "400 sheets", image: "/images/products/for-you-facial-tissues-400.jpg", href: "/product/for-you-facial-tissues-400" },
  { name: "Eco Fresh Towel", subtitle: "Multi Purpose", image: "/images/products/eco-fresh-multi-purpose-towel.jpg", href: "/product/eco-fresh-multi-purpose-towel" },
  { name: "Eco Fresh Toilet Paper", subtitle: "2 rolls", image: "/images/products/eco-fresh-toilet-paper-2-rolls.jpg", href: "/product/eco-fresh-toilet-paper-2-rolls" },
];

function ProductMarquee({ products, tone }: { products: ShowcaseProduct[]; tone: "rose" | "craft" }) {
  const loop = [...products, ...products];
  return (
    <div className="brand-marquee overflow-hidden" aria-label="Featured products">
      <div className="brand-marquee-track">
        {loop.map((product, idx) => (
          <Link
            key={`${product.name}-${idx}`}
            href={product.href}
            aria-hidden={idx >= products.length}
            tabIndex={idx >= products.length ? -1 : undefined}
            className="group w-40 shrink-0 overflow-hidden rounded-2xl border border-line bg-white shadow-2xs transition hover:shadow-md sm:w-44"
          >
            <span className={`relative block h-24 w-full overflow-hidden ${tone === "craft" ? "bg-white" : "bg-white"}`}>
              <Image
                src={product.image}
                alt={product.name}
                width={176}
                height={96}
                loading="lazy"
                unoptimized
                className="size-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
              />
            </span>
            <span className="block px-2.5 py-2 text-center">
              <span className="block text-xs font-bold text-content">{product.name}</span>
              {product.subtitle ? <span className="mt-0.5 block text-[11px] text-secondary">{product.subtitle}</span> : null}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BrandShowcase() {
  return (
    <div className="space-y-5">
      {/* Rose Petal */}
      <section className="overflow-hidden rounded-3xl border border-line bg-[#e9f1fd]">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="w-full shrink-0 lg:w-72">
            <Image src="/images/brands/rose-petal-wordmark.jpg" alt="Rose Petal" width={355} height={142} loading="lazy" unoptimized className="h-auto w-56 sm:w-64" />
            <h2 className="mt-4 text-xl font-bold text-[#0b3d91] sm:text-2xl">Go Soft with Rose Petal</h2>
            <p className="mt-1 text-sm text-secondary">Tissues, rolls &amp; everyday essentials</p>
            <Link href="/brand/rose-petal" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0b3d91] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a357e]">
              Shop Now <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="min-w-0 flex-1">
            <ProductMarquee products={ROSE_PETAL_PRODUCTS} tone="rose" />
          </div>
        </div>
      </section>

      {/* Tissue Craft */}
      <section className="overflow-hidden rounded-3xl border border-line bg-[#e7f3f0]">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="w-full shrink-0 lg:w-72">
            <Image src="/images/brands/tissue-craft-wordmark.jpg" alt="Tissue Craft" width={365} height={150} loading="lazy" unoptimized className="h-auto w-56 sm:w-64" />
            <h2 className="mt-4 text-xl font-bold text-[#0c3b32] sm:text-2xl">We value your hygiene</h2>
            <p className="mt-1 text-sm text-secondary">Facial tissues, towels &amp; toilet rolls</p>
            <Link href="/shop?category=tissue-paper-products" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#14584c] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f463c]">
              View Collection <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="min-w-0 flex-1">
            <ProductMarquee products={TISSUE_CRAFT_PRODUCTS} tone="craft" />
          </div>
        </div>
      </section>
    </div>
  );
}
