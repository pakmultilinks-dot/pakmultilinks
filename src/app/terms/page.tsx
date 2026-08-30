import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { PolicyContent } from "@/components/ui/policy-content";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "Terms and Conditions", description: `Catalog, quotation, order, availability and payment terms for ${company.name}.`, alternates: { canonical: "/terms" } };

export default function TermsPage() { return <><PageHero eyebrow="Customer support" title="Terms & conditions" description="Important information about catalog details, quotations and order confirmation." /><PolicyContent sections={[
  ["Catalog and availability", "Until real catalog data is added, items marked as demo are not offers for sale. For live products, availability and specifications are subject to confirmation before dispatch."],
  ["Wholesale pricing", "Products are supplied by carton. Confirmed carton prices appear in Pakistani rupees; items marked price on request require a quotation. Tax treatment and delivery charges are confirmed before fulfilment."],
  ["Orders", "Submitting checkout records an order request. The business may contact the customer to confirm product availability, delivery scope, charges and timeframe before dispatch."],
  ["Payment", "Cash on Delivery is prepared as an initial method subject to business confirmation. Bank transfer is not available until verified account details are configured. No card transaction is represented by this site."],
  ["Product information", "Actual product labels, safety instructions and manufacturer information take priority. Do not rely on development placeholder descriptions for use, compatibility or safety decisions."],
  ["Final terms required", "Delivery coverage, timing, tax/GST, invoices, minimum wholesale order and dispute terms remain to be confirmed before production launch."],
]} /></>; }
