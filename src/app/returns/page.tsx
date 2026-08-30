import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { PolicyContent } from "@/components/ui/policy-content";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "Returns and Refund Policy", description: `Return, damaged-product and refund guidance for orders placed with ${company.name}.`, alternates: { canonical: "/returns" } };

export default function ReturnsPage() { return <><PageHero eyebrow="Customer support" title="Returns policy" description="The business’s final return and refund rules are still awaiting confirmation." /><PolicyContent sections={[
  ["Before ordering", "A final return/refund policy has not been provided. Please confirm the applicable terms before placing a live order, particularly for opened consumables, chemicals, hygiene products and custom bulk orders."],
  ["If there is an issue", `Keep the product, packaging and order reference, and contact ${company.name} promptly at ${company.phone} or ${company.email}. The team will review the specific order and advise next steps.`],
  ["Do not return without confirmation", "Do not send a product back until the return location, eligibility and handling instructions have been confirmed by the business."],
  ["Final policy required", "Eligibility windows, unopened-item requirements, damaged goods handling, refund method, delivery costs and exclusions must be approved and published before production launch."],
]} /></>; }
