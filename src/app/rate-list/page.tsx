import type { Metadata } from "next";
import { RateList } from "@/components/catalog/rate-list";
import { listPublicRateLists } from "@/lib/rate-lists-server";

export const metadata: Metadata = {
  title: "Wholesale Rate List: Tissue & Hygiene Prices in Pakistan",
  description:
    "Official wholesale rate list of Pak Multilinks Hygiene: tissue paper, washroom, cleaning and disposable product carton rates for businesses in Lahore and across Pakistan. Minimum order one carton, WhatsApp ordering.",
  alternates: { canonical: "/rate-list" },
  openGraph: {
    title: "Wholesale Rate List: Tissue & Hygiene Prices in Pakistan",
    description:
      "Current wholesale carton rates for tissue and hygiene supplies, supplied from Lahore to businesses across Pakistan.",
    url: "/rate-list",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function RateListPage() {
  const rateListFiles = await listPublicRateLists();
  return <RateList rateListFiles={rateListFiles} />;
}

