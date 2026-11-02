import type { Category, Product } from "@/lib/types";

export type ClientCatalog = {
  products: Product[];
  categories: Category[];
  demoMode: boolean;
};

let catalogRequest: Promise<ClientCatalog | null> | null = null;

/** Share the public catalog request across header and footer consumers. */
export function getClientCatalog() {
  if (!catalogRequest) {
    catalogRequest = fetch("/api/catalog")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (!payload || typeof payload !== "object") return null;
        const data = payload as Partial<ClientCatalog>;
        return {
          products: Array.isArray(data.products) ? data.products : [],
          categories: Array.isArray(data.categories) ? data.categories : [],
          demoMode: Boolean(data.demoMode),
        };
      })
      .catch(() => {
        catalogRequest = null;
        return null;
      });
  }

  return catalogRequest;
}
