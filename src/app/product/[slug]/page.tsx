import { Building2, ChevronRight, PackageCheck, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductPurchase } from "@/components/catalog/product-purchase";
import { getPrice, products as developmentProducts } from "@/lib/catalog";
import { getPublicProduct, isDevelopmentProduct, listPublicProducts } from "@/lib/catalog-server";
import { breadcrumbStructuredData, cleanDescription, getSiteOrigin, safeJsonLd } from "@/lib/seo";
import { formatPrice, minimumCartons } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export function generateStaticParams() {
  return developmentProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: true } };
  }

  const description = cleanDescription(
    product.shortDescription,
    `${product.name} supplied by carton for wholesale and commercial requirements in Lahore.`,
  );

  return {
    title: `${product.name} Wholesale by Carton in Lahore`,
    description,
    robots: isDevelopmentProduct(product)
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `/product/${product.slug}`,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: product.name, description, images: product.image ? [product.image] : undefined },
    other: isDevelopmentProduct(product) || product.priceOnRequest
      ? undefined
      : {
          "product:price:amount": String(getPrice(product)),
          "product:price:currency": "PKR",
        },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([
    getPublicProduct(slug),
    listPublicProducts(),
  ]);
  if (!product) notFound();

  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.categorySlug === product.categorySlug) -
          Number(a.categorySlug === product.categorySlug) ||
        Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller)),
    )
    .slice(0, 4);

  const productImages = [...new Set([product.image, ...product.gallery].filter(Boolean))];
  const siteUrl = getSiteOrigin();
  const productUrl = new URL(`/product/${product.slug}`, siteUrl).toString();
  const availability =
    product.stock >= minimumCartons(product)
      ? "https://schema.org/InStock"
      : product.allowBackorder
        ? "https://schema.org/BackOrder"
        : "https://schema.org/OutOfStock";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(productImages.length ? { image: productImages.map((image) => new URL(image, siteUrl).toString()) } : {}),
    description: product.shortDescription,
    url: productUrl,
    sku: product.sku,
    productID: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    ...(product.attributes.length ? { additionalProperty: product.attributes.map((attribute) => ({ "@type": "PropertyValue", name: attribute.name, value: attribute.value })) } : {}),
    ...(product.priceOnRequest ? {} : { offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: getPrice(product),
      availability,
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteUrl}/#business` },
    } }),
  };
  const breadcrumbData = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: product.category, path: `/shop/${product.categorySlug}` },
    { name: product.name, path: `/product/${product.slug}` },
  ]);
  const developmentProduct = isDevelopmentProduct(product);

  return (
    <div className="bg-[#fbfcf8]">
      {!developmentProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd([structuredData, breadcrumbData]),
          }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pb-20 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-7 overflow-x-auto pb-1">
          <ol className="flex min-w-max items-center gap-1.5 text-sm text-[#64756a]">
            <li>
              <Link
                href="/"
                className="rounded-sm hover:text-[#17643a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link
                href="/shop"
                className="rounded-sm hover:text-[#17643a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link
                href={`/shop/${product.categorySlug}`}
                className="rounded-sm hover:text-[#17643a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]"
              >
                {product.category}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="max-w-56 truncate font-semibold text-[#354f40]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-9 lg:grid-cols-[minmax(0,1.04fr)_minmax(380px,.96fr)] lg:gap-12">
          <ProductGallery key={product.id} images={productImages} productName={product.name} />

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/shop/${product.categorySlug}`}
                className="rounded-full bg-[#e9f4eb] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#2c7047] transition hover:bg-[#dcecdf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]"
              >
                {product.category}
              </Link>
              {product.bestSeller && (
                <span className="rounded-full bg-[#fff4d9] px-3 py-1 text-xs font-extrabold text-[#775a06]">
                  Best seller
                </span>
              )}
              {product.featured && (
                <span className="rounded-full bg-[#eef1f6] px-3 py-1 text-xs font-extrabold text-[#4b596d]">
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-[#153b28] sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#5b6d61]">
              {product.shortDescription}
            </p>

            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y border-[#e0e9e2] py-4 text-sm">
              <div className="flex gap-2">
                <dt className="text-[#75827a]">SKU</dt>
                <dd className="font-bold text-[#294b36]">{product.sku}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#75827a]">Brand</dt>
                <dd className="font-bold text-[#294b36]">{product.brand}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <ProductPurchase key={product.id} product={product} />
            </div>
          </div>
        </div>

        <section className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:gap-8" aria-labelledby="product-information-heading">
          <div className="rounded-3xl border border-[#dce8df] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#eaf4ec] text-[#17643a]">
                <PackageCheck className="size-5" aria-hidden="true" />
              </span>
              <h2 id="product-information-heading" className="text-2xl font-extrabold tracking-tight text-[#173c29]">
                Product information
              </h2>
            </div>
            <p className="mt-5 leading-8 text-[#5d6d63]">{product.description}</p>

            {product.bulkPricing && (
              <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#f2f7ef] p-4">
                <Building2 className="mt-0.5 size-5 shrink-0 text-[#277144]" aria-hidden="true" />
                <div>
                  <p className="font-bold text-[#294d36]">Corporate supply support</p>
                  <p className="mt-1 text-sm leading-6 text-[#627168]">
                    This product is supplied by carton. Packing, minimum quantity, wholesale pricing and delivery are confirmed before fulfilment.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#dce8df] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#eaf4ec] text-[#17643a]">
                <Tag className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#173c29]">
                Specifications
              </h2>
            </div>
            <dl className="mt-5 divide-y divide-[#e6ece8]">
              {product.attributes.map((attribute) => (
                <div
                  key={`${attribute.name}-${attribute.value}`}
                  className="grid grid-cols-[minmax(100px,.75fr)_minmax(0,1.25fr)] gap-4 py-3.5 text-sm"
                >
                  <dt className="font-semibold text-[#68776e]">{attribute.name}</dt>
                  <dd className="text-right font-bold text-[#294d36]">{attribute.value}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[minmax(100px,.75fr)_minmax(0,1.25fr)] gap-4 py-3.5 text-sm">
                <dt className="font-semibold text-[#68776e]">Category</dt>
                <dd className="text-right font-bold text-[#294d36]">{product.category}</dd>
              </div>
              <div className="grid grid-cols-[minmax(100px,.75fr)_minmax(0,1.25fr)] gap-4 py-3.5 text-sm">
                <dt className="font-semibold text-[#68776e]">Current price</dt>
                <dd className="text-right font-bold text-[#294d36]">{formatPrice(getPrice(product))}</dd>
              </div>
            </dl>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-16" aria-labelledby="related-products-heading">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#34764c]">
                  Complete your supply list
                </p>
                <h2 id="related-products-heading" className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-[#173c29]">
                  Related products
                </h2>
              </div>
              <Link
                href={`/shop/${product.categorySlug}`}
                className="w-fit rounded-sm text-sm font-extrabold text-[#17643a] underline decoration-[#a0bda8] underline-offset-4 hover:decoration-[#17643a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a]"
              >
                View {product.category}
              </Link>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} headingLevel="h3" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
