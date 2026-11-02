import type { Metadata } from "next";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import { CommerceShell } from "@/components/commerce/commerce-shell";
import { getSession } from "@/lib/auth";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
import type { CustomerDetails } from "@/lib/types";

export const metadata: Metadata = {
  title: "Bulk Order Request",
  description: "Submit your company and delivery details with the required carton quantities.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  let initialCustomer: Partial<CustomerDetails> = {};
  const session = await getSession();
  if (session?.role === "CUSTOMER" && isDatabaseConfigured) {
    try {
      const user = await withDatabaseRetry(() =>
        db.user.findUnique({
          where: { id: session.userId },
          select: {
            name: true,
            email: true,
            phone: true,
            addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }], take: 1 },
          },
        }),
      );
      const address = user?.addresses[0];
      if (user) {
        initialCustomer = {
          fullName: address?.fullName || user.name,
          email: user.email,
          phone: address?.phone || user.phone || "",
          companyName: address?.company || "",
          province: address?.province || "",
          city: address?.city || "",
          address: address?.line1 || "",
          postalCode: address?.postalCode || "",
        };
      }
    } catch (error) {
      console.error("Failed to load saved checkout details:", error);
    }
  }

  return (
    <CommerceShell eyebrow="Wholesale order request" title="Bulk carton checkout" description="Submit company details and carton quantities without making an online payment. Packing, price, stock, delivery and final total are confirmed after review.">
      <CheckoutForm initialCustomer={initialCustomer} />
    </CommerceShell>
  );
}
