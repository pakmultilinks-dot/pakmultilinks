import type { Metadata } from "next";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import { CommerceShell } from "@/components/commerce/commerce-shell";

export const metadata: Metadata = {
  title: "Bulk Order Request",
  description: "Submit your company and delivery details with the required carton quantities.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <CommerceShell eyebrow="Wholesale order request" title="Bulk carton checkout" description="Submit company details and carton quantities without making an online payment. Packing, price, stock, delivery and final total are confirmed after review.">
      <CheckoutForm />
    </CommerceShell>
  );
}
