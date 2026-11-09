import { ChevronDown, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import { getAllBrandSlugs, getBrandBySlug } from "@/lib/brands";
import {
  isDevelopmentProduct,
  listPublicCategories,
  listPublicProducts,
} from "@/lib/catalog-server";
import { company } from "@/lib/company";
import {
  absoluteUrl,
  breadcrumbStructuredData,
  cleanDescription,
  safeJsonLd,
} from "@/lib/seo";

type BrandPageProps = {
  params: Promise<{ brand: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return getAllBrandSlugs().map((slug) => ({ brand: slug }));
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    return { title: "Brand not found", robots: { index: false, follow: true } };
  }

  const title = brand.metaTitle;
  const description = cleanDescription(
    brand.metaDescription,
    `Buy official ${brand.name} wholesale supplies by carton in Lahore from Pak Multilinks Hygiene.`,
  );

  return {
    title,
    description,
    alternates: { canonical: `/brand/${brand.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/brand/${brand.slug}`,
      siteName: company.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BrandLandingPage({ params }: BrandPageProps) {
  const { brand: slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const [products, categories] = await Promise.all([
    listPublicProducts(),
    listPublicCategories(),
  ]);

  const brandProducts = products.filter(
    (p) =>
      p.brand.toLowerCase() === brand.name.toLowerCase() ||
      p.brand.toLowerCase().replace(/[^a-z0-9]/g, "") ===
        brand.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );

  const indexableProducts = brandProducts.filter(
    (p) => !isDevelopmentProduct(p),
  );
  const pageUrl = absoluteUrl(`/brand/${brand.slug}`);

  // Structured Data (Brand + CollectionPage + BreadcrumbList + FAQPage)
  const breadcrumbs = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Brands", path: "/shop" },
    { name: brand.name, path: `/brand/${brand.slug}` },
  ]);

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    description: brand.tagline,
    url: pageUrl,
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${brand.name} Wholesale Supplies in Lahore`,
    description: brand.metaDescription,
    url: pageUrl,
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
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: brand.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="brand-landing-page bg-surface-soft/40 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            breadcrumbs,
            brandSchema,
            collectionSchema,
            faqSchema,
          ]),
        }}
      />

      {/* Top Breadcrumb */}
      <div className="border-b border-line bg-surface py-3">
        <div className="site-shell">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-xs font-semibold text-muted">
              <li>
                <Link href="/" className="hover:text-accent transition">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 text-muted/60" />
              </li>
              <li>
                <Link href="/shop" className="hover:text-accent transition">
                  Brands
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 text-muted/60" />
              </li>
              <li className="text-accent font-bold" aria-current="page">
                {brand.name}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <header className="catalog-page-heading border-b border-line bg-surface py-5 sm:py-6">
        <div className="site-shell">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
            Brand collection
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
            {brand.name} products
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">
            Browse available products, compare packing and request current
            carton prices.
          </p>
        </div>
      </header>

      {/* Catalog Explorer for this Brand */}
      <CatalogExplorer
        key={brand.slug}
        products={brandProducts}
        categoryOptions={categories}
        initialBrand={brand.name}
        title={`${brand.name} Products & Carton Rates`}
        description={`Explore factory-sealed cartons of ${brand.name} with wholesale pricing, SKU codes, and instant WhatsApp ordering for Lahore.`}
        hideH1
        streamlined
      />

      <section className="border-t border-line bg-surface py-6 sm:py-8" id="buying-guide">
        <div className="site-shell">
          <details className="group mx-auto max-w-5xl rounded-xl border border-line bg-surface-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden">
              <span>
                <span className="block text-sm font-extrabold text-content">{brand.name} wholesale buying guide &amp; FAQs</span>
                <span className="mt-0.5 block text-xs text-muted">Packing, commercial use and procurement information</span>
              </span>
              <ChevronDown className="size-5 text-accent transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-line px-5 py-5">
              <h2 className="text-xl font-extrabold text-content">{brand.introHeading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-6 text-secondary">
                {brand.introParagraphs.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {brand.keyHighlights.map((highlight) => (
                  <div key={highlight.label} className="rounded-lg border border-line bg-surface p-3">
                    <h3 className="text-xs font-extrabold text-accent">{highlight.label}</h3>
                    <p className="mt-1 text-xs leading-5 text-secondary">{highlight.description}</p>
                  </div>
                ))}
              </div>
              {brand.faqs.length > 0 && (
                <div className="mt-6 border-t border-line pt-5">
                  <h2 className="text-lg font-extrabold text-content">Wholesale FAQs</h2>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {brand.faqs.map((faq) => (
                      <div key={faq.question} className="rounded-lg bg-surface p-3">
                        <h3 className="text-sm font-bold text-content">{faq.question}</h3>
                        <p className="mt-1 text-xs leading-5 text-secondary">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
