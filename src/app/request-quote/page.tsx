import type { Metadata } from "next";
import { QuoteForm } from "@/components/commerce/quote-form";
import { CommerceShell } from "@/components/commerce/commerce-shell";

export const metadata: Metadata = {
  title: "Request a Wholesale Hygiene Supply Quote",
  description: "Send Pak Multilinks Hygiene your required products, carton quantities and delivery city for a business quotation.",
  alternates: { canonical: "/request-quote" },
};

export default async function RequestQuotePage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const params = await searchParams;
  return (
    <CommerceShell eyebrow="Corporate and bulk supply" title="Request a quotation" description="Share the products, estimated quantities, and delivery city. Pricing, availability, delivery, and commercial terms are provided only after review.">
      <div className="grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-3xl bg-emerald-900 p-6 text-white lg:sticky lg:top-28">
          <h2 className="text-xl font-bold">Before you submit</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-emerald-50">
            <li><strong className="block text-white">Add multiple products</strong>Enter separate estimated quantities for easier review.</li>
            <li><strong className="block text-white">No invented pricing</strong>Your quotation is prepared from reviewed product and delivery information.</li>
            <li><strong className="block text-white">Dedicated follow-up</strong>Provide reachable contact details so the business team can clarify requirements.</li>
          </ul>
        </aside>
        <QuoteForm initialProduct={params.product ?? ""} />
      </div>
    </CommerceShell>
  );
}
