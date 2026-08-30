import type { Metadata } from "next";
import { OrderConfirmationClient } from "@/components/commerce/order-confirmation-client";

export const metadata: Metadata = {
  title: "Order Received",
  description: "Your Pak Multilinks Hygiene order request has been received for review.",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string; mode?: string }> }) {
  const params = await searchParams;
  return (
    <div className="min-h-[65vh] bg-slate-50/70 px-4 py-12 sm:px-6 sm:py-16">
      <OrderConfirmationClient orderId={params.order ?? ""} mode={params.mode} />
    </div>
  );
}
