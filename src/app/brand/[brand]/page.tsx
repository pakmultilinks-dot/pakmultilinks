import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import { FaqAccordion } from "@/components/ui/faq-accordion";
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

export const revalidate = 3600;

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

      <header className="catalog-page-heading border-b border-line bg-surface py-7 sm:py-9">
        <div className="site-shell">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent">
            Brand collection
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-content">
            {brand.name} products
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-secondary">
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
      />

      {/* Detailed brand information follows the product collection. */}
      <section className="border-b border-line bg-surface py-10 sm:py-14">
        <div className="site-shell">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-action/30 bg-action/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-action">
                <Sparkles className="size-3.5" />
                Brand buying information
              </span>
              <span className="text-xs font-bold text-muted">•</span>
              <span className="text-xs font-bold text-secondary">
                {brand.tagline}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-content tracking-tight leading-tight">
              {brand.introHeading}
            </h2>

            <div className="mt-5 space-y-3.5 text-sm sm:text-base leading-relaxed text-secondary">
              {brand.introParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Key Highlights Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {brand.keyHighlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-line bg-surface-soft p-4 transition hover:border-action/40 shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-action font-extrabold text-xs mb-1">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{highlight.label}</span>
                  </div>
                  <p className="text-xs text-secondary leading-snug">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand FAQ Section */}
      {brand.faqs.length > 0 && (
        <section
          className="border-t border-line bg-surface py-12 sm:py-16"
          id="faq"
        >
          <div className="site-shell">
            <div className="max-w-4xl">
              <FaqAccordion
                faqs={brand.faqs}
                title={`Procurement & Wholesale FAQs for ${brand.name}`}
                description="Common questions from office managers, procurement officers, and wholesale buyers in Lahore."
                eyebrow="Frequently Asked Questions"
                className="border-none py-0 sm:py-0"
              />

              {/* Need More Assistance Banner */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-action/30 bg-action/5 p-6 text-center sm:text-left">
                <div>
                  <h3 className="text-base font-extrabold text-content">
                    Need a custom carton quote for {brand.name}?
                  </h3>
                  <p className="mt-0.5 text-xs text-secondary">
                    Our sales team is available on WhatsApp for direct wholesale
                    inquiries and bulk rates.
                  </p>
                </div>
                <a
                  href={`https://wa.me/923006917385?text=${encodeURIComponent(
                    `Hi Pak Multilinks, I am inquiring about wholesale carton pricing for ${brand.name} in Lahore.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-6 text-xs sm:text-sm font-extrabold text-white transition hover:bg-action-hover shadow-xs shrink-0"
                >
                  <span>Inquire on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
