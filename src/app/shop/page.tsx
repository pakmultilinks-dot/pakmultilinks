import type { Metadata } from "next";

import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import { isDevelopmentProduct, listPublicCategories, listPublicProducts } from "@/lib/catalog-server";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

type ShopPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : params.q?.[0] ?? "";
  const title = query ? `Products matching ${query}` : "Wholesale Hygiene Products by Carton in Lahore";
  const description = query ? `Search results for ${query} in the Pak Multilinks wholesale hygiene catalog.` : "Browse wholesale tissue, washroom and hygiene products supplied by carton for businesses and institutions in Lahore.";
  return { title, description, alternates: { canonical: "/shop" }, robots: query ? { index: false, follow: true } : undefined, openGraph: { title, description, type: "website", url: "/shop" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : params.q?.[0] ?? "";
  const [products, categories] = await Promise.all([
    listPublicProducts(),
    listPublicCategories(),
  ]);
  const indexableProducts = products.filter((product) => !isDevelopmentProduct(product));
  const structuredData = [
    breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }]),
    { "@context": "https://schema.org", "@type": "CollectionPage", name: "Wholesale Hygiene Products by Carton", description: "Wholesale tissue, washroom and hygiene products for businesses in Lahore.", url: absoluteUrl("/shop"), mainEntity: { "@type": "ItemList", numberOfItems: indexableProducts.length, itemListElement: indexableProducts.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: absoluteUrl(`/product/${product.slug}`) })) } },
  ];

  return (
    <>
      {!query && indexableProducts.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />}
      <CatalogExplorer key={query} products={products} categoryOptions={categories} initialQuery={query} title={query ? `Products matching “${query}”` : "Shop all products"} description={query ? "Refine the results by category, brand, price or availability." : "Browse wholesale hygiene products supplied in cartons. Packing and pricing are confirmed before fulfilment."} />
    </>
  );
}
