import { NextResponse } from "next/server";

import {
  isDevelopmentProduct,
  listPublicCategories,
  listPublicProducts,
} from "@/lib/catalog-server";

export async function GET() {
  const [products, categories] = await Promise.all([
    listPublicProducts(),
    listPublicCategories(),
  ]);
  const demoMode = products.length > 0 && products.every(isDevelopmentProduct);

  return NextResponse.json(
    { products, categories, demoMode },
    {
      headers: {
        "Cache-Control": demoMode
          ? "public, max-age=30"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
