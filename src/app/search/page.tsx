import type { Metadata } from "next";

import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import { listPublicCategories, listPublicProducts } from "@/lib/catalog-server";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : params.q?.[0] ?? "";
  return {
    title: query ? `Search results for ${query}` : "Search products",
    description: "Search the Pak Multilinks Hygiene product catalog.",
    alternates: { canonical: "/search" },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : params.q?.[0] ?? "";
  const [products, categories] = await Promise.all([
    listPublicProducts(),
    listPublicCategories(),
  ]);

  return (
    <CatalogExplorer
      key={query}
      products={products}
      categoryOptions={categories}
      initialQuery={query}
      eyebrow="Catalog search"
      title={query ? `Search results for “${query}”` : "Search our catalog"}
      description="Search by product name, SKU, category, brand or description, then use the filters to narrow the results."
    />
  );
}
