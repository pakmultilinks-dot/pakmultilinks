import type { Metadata } from "next";
import { CartPageClient } from "@/components/commerce/cart-page-client";
import { CommerceShell } from "@/components/commerce/commerce-shell";

export const metadata: Metadata = {
  title: "Bulk Carton Cart",
  description: "Review your wholesale carton requirements before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <CommerceShell title="Your bulk carton cart" description="Review carton quantities, packing and availability before continuing.">
      <CartPageClient />
    </CommerceShell>
  );
}
