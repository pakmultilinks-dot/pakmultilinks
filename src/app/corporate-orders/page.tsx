import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Factory, GraduationCap, HeartPulse, Hotel, Landmark, ShoppingBag, Utensils } from "lucide-react";
import { CommerceShell } from "@/components/commerce/commerce-shell";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Corporate Hygiene Supplies in Lahore",
  description: "Request wholesale tissue, washroom and hygiene supplies by carton for offices, institutions and commercial facilities in Lahore.",
  alternates: { canonical: "/corporate-orders" },
};

const industries = [
  [Building2, "Offices"], [HeartPulse, "Hospitals"], [Utensils, "Restaurants"], [Hotel, "Hotels"],
  [GraduationCap, "Schools"], [Factory, "Factories"], [ShoppingBag, "Shopping centres"], [Landmark, "Commercial buildings"],
] as const;

export default function CorporateOrdersPage() {
  return (
    <CommerceShell eyebrow="B2B supply support" title="Hygiene solutions for your business" description="Share recurring, bulk, or multi-site supply requirements with Pak Multilinks Hygiene. Our team will review your needs and prepare a quotation without assuming prices or delivery terms.">
      <section className="overflow-hidden rounded-3xl bg-emerald-900 text-white">
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">A clearer way to source workplace hygiene supplies</h2>
            <p className="mt-4 max-w-2xl leading-7 text-emerald-50">Request the products and estimated quantities you need. The team can then review availability, pack sizes, delivery location, and applicable commercial terms with you.</p>
            <ul className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
              {["Multiple products in one request", "Bulk and repeat-order requirements", "Delivery details reviewed directly", "No payment required to request a quote"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-300" />{item}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/request-quote" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-50">Request corporate quote <ArrowRight aria-hidden="true" className="size-4" /></Link><a href={`tel:${company.phoneHref}`} className="rounded-xl border border-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Call {company.phone}</a></div>
          </div>
          <div className="bg-emerald-800/80 p-7 sm:p-10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">Organisations we can discuss requirements with</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {industries.map(([Icon, label]) => <div key={label} className="rounded-2xl border border-emerald-700 bg-emerald-950/20 p-4"><Icon aria-hidden="true" className="size-5 text-emerald-200" /><span className="mt-3 block text-sm font-semibold">{label}</span></div>)}
            </div>
          </div>
        </div>
      </section>
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {[['1', 'Tell us what you need', 'List products, estimated quantities, company details, and delivery city.'], ['2', 'Requirements review', 'The team checks the request and follows up where product or delivery details need clarification.'], ['3', 'Receive a quotation', 'Pricing and commercial terms are shared only after the requested details have been reviewed.']].map(([step, title, copy]) => <article key={step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 font-bold text-emerald-900">{step}</span><h2 className="mt-5 text-lg font-bold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></article>)}
      </section>
    </CommerceShell>
  );
}
