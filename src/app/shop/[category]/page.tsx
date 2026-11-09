import { ChevronRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { categories as developmentCategories } from "@/lib/catalog";
import { getCategorySeoInfo } from "@/lib/category-seo-data";
import {
  getPublicCategory,
  isDevelopmentProduct,
  listPublicCategories,
  listPublicProducts,
} from "@/lib/catalog-server";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return developmentCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getPublicCategory(slug);

  if (!category) {
    return {
      title: "Category not found",
      robots: { index: false, follow: true },
    };
  }

  const products = await listPublicProducts();
  const hasVerifiedProduct = products.some(
    (product) =>
      (product.categorySlug === category.slug ||
        product.parentCategorySlug === category.slug) &&
      !isDevelopmentProduct(product),
  );

  const seoInfo = getCategorySeoInfo(
    category.slug,
    category.name,
    category.description,
  );

  return {
    title: seoInfo.metaTitle,
    description: seoInfo.metaDescription,
    alternates: { canonical: `/shop/${category.slug}` },
    robots: hasVerifiedProduct
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: seoInfo.metaTitle,
      description: seoInfo.metaDescription,
      type: "website",
      url: `/shop/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = await getPublicCategory(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    listPublicProducts(),
    listPublicCategories(),
  ]);

  const categoryProducts = products.filter(
    (product) =>
      product.categorySlug === category.slug ||
      product.parentCategorySlug === category.slug,
  );
  const indexableProducts = categoryProducts.filter(
    (product) => !isDevelopmentProduct(product),
  );

  const seoInfo = getCategorySeoInfo(
    category.slug,
    category.name,
    category.description,
  );
  const pageUrl = absoluteUrl(`/shop/${category.slug}`);

  const breadcrumbs = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: category.name, path: `/shop/${category.slug}` },
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoInfo.heading,
    description: seoInfo.metaDescription,
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
    mainEntity: seoInfo.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="category-landing-page bg-surface-soft/40 min-h-screen">
      {indexableProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd([breadcrumbs, collectionSchema, faqSchema]),
          }}
        />
      )}

      {/* Breadcrumb Navigation */}
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
                  Shop
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 text-muted/60" />
              </li>
              <li className="text-accent font-bold" aria-current="page">
                {category.name}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Visible Category Hero Header & Intro Section */}
      <section className="catalog-page-heading border-b border-line bg-surface py-7 sm:py-9">
        <div className="site-shell">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-action/30 bg-action/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-action">
              <Sparkles className="size-3.5" />
              Wholesale Category
            </span>
            <span className="text-xs font-bold text-muted">•</span>
            <span className="text-xs font-bold text-secondary">
              Carton Supply Lahore
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-content tracking-tight leading-tight">
            {seoInfo.heading}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-secondary">
            Compare products, packing and current availability for your next
            order.
          </p>
        </div>
      </section>

      {/* Product Catalog Explorer for this Category */}
      <CatalogExplorer
        key={category.slug}
        products={categoryProducts}
        categoryOptions={categories}
        fixedCategorySlug={category.slug}
        eyebrow="Shop by category"
        title={category.name}
        description={category.description}
        hideHero
        hideH1
      />

      <section className="border-t border-line bg-surface py-10">
        <div className="site-shell">
          <div className="max-w-4xl">
            <h2 className="font-serif text-2xl sm:text-3xl text-content">
              Buying {category.name.toLowerCase()} in Lahore
            </h2>
            <p className="mt-4 text-base leading-8 text-secondary">
              {seoInfo.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Category FAQ Accordion */}
      {seoInfo.faqs.length > 0 && (
        <FaqAccordion
          faqs={seoInfo.faqs}
          title={`Frequently Asked Questions About ${category.name}`}
          description={`Procurement, carton packing, and delivery details for ${category.name.toLowerCase()} in Lahore.`}
          eyebrow="Category FAQs"
        />
      )}
    </div>
  );
}
