import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { brandNameToSlug, getBrandBySlug } from "@/lib/brands";
import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import {
  isDevelopmentProduct,
  listPublicCategories,
  listPublicProducts,
} from "@/lib/catalog-server";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

type ShopPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    brand?: string | string[];
  }>;
};

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : (params.q?.[0] ?? "");
  const brandParam =
    typeof params.brand === "string" ? params.brand : (params.brand?.[0] ?? "");

  let title = "Wholesale Hygiene Products by Carton in Lahore";
  let description =
    "Browse wholesale tissue, washroom and hygiene products supplied by carton for businesses and institutions in Lahore.";
  let canonical = "/shop";

  if (brandParam) {
    const brandSlug = brandNameToSlug(brandParam);
    const knownBrand = getBrandBySlug(brandSlug);
    canonical = knownBrand ? `/brand/${brandSlug}` : "/shop";
    title = `${brandParam} Wholesale Supplies & Rates in Lahore | Pak Multilinks`;
    description = `Browse official ${brandParam} products, wholesale carton rates and packing specifications available in Lahore.`;
  } else if (query) {
    title = `Products matching ${query}`;
    description = `Search results for ${query} in the Pak Multilinks wholesale hygiene catalog.`;
  }

  return {
    title,
    description,
    alternates: { canonical },
    robots: query ? { index: false, follow: true } : undefined,
    openGraph: { title, description, type: "website", url: canonical },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : (params.q?.[0] ?? "");
  const categoryParam =
    typeof params.category === "string"
      ? params.category
      : (params.category?.[0] ?? "");
  const brandParam =
    typeof params.brand === "string" ? params.brand : (params.brand?.[0] ?? "");

  const [products, categories] = await Promise.all([
    listPublicProducts(),
    listPublicCategories(),
  ]);
  const indexableProducts = products.filter(
    (product) => !isDevelopmentProduct(product),
  );
  const structuredData = [
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Wholesale Hygiene Products by Carton",
      description:
        "Wholesale tissue, washroom and hygiene products for businesses in Lahore.",
      url: absoluteUrl("/shop"),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: indexableProducts.length,
        itemListElement: indexableProducts.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          url: absoluteUrl(`/product/${product.slug}`),
        })),
      },
    },
  ];

  const pageTitle = brandParam
    ? `${brandParam} Products & Wholesale Rates`
    : query
      ? `Products matching “${query}”`
      : "Wholesale Hygiene Supplies & Products";

  const pageDescription = brandParam
    ? `Explore official wholesale carton rates, specifications and bulk stock for ${brandParam} in Lahore.`
    : query
      ? `Search results for “${query}” across our wholesale hygiene, washroom, and cleaning products catalog.`
      : "Browse wholesale hygiene, washroom, tissue, and cleaning supplies supplied by the carton. Guaranteed factory packaging, transparent rates, and fast delivery in Lahore.";

  return (
    <div className="shop-page bg-surface-soft/40 min-h-screen">
      {!query && indexableProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
        />
      )}

      {/* Visible Shop Hero Header */}
      <section className="catalog-page-heading border-b border-line bg-surface py-8 sm:py-10">
        <div className="site-shell">
          <nav
            className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-accent transition">
              Home
            </Link>
            <ChevronRight className="size-3 text-muted/60" />
            <span className="text-accent font-bold" aria-current="page">
              Shop
            </span>
            {brandParam && (
              <>
                <ChevronRight className="size-3 text-muted/60" />
                <span className="text-accent font-bold">{brandParam}</span>
              </>
            )}
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-content tracking-tight leading-tight">
            {pageTitle}
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-secondary max-w-3xl">
            {pageDescription}
          </p>
        </div>
      </section>

      <CatalogExplorer
        key={`${query}-${categoryParam}-${brandParam}`}
        products={products}
        categoryOptions={categories}
        initialQuery={query}
        initialCategorySlug={categoryParam}
        initialBrand={brandParam}
        title={pageTitle}
        description={pageDescription}
        hideH1
      />
    </div>
  );
}
