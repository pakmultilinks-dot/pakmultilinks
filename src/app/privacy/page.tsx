import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { PolicyContent } from "@/components/ui/policy-content";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "Privacy Policy", description: `How ${company.name} collects, uses and protects information submitted with accounts, orders and quotation requests.`, alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <><PageHero eyebrow="Customer support" title="Privacy policy" description="A plain-language overview of the information used to process orders and quotation requests." /><PolicyContent sections={[
    ["Information we collect", "When you place an order, create an account, contact us or request a quotation, we may receive your name, phone, email, company, delivery address, ordered products and notes you choose to provide."],
    ["How it is used", "We use submitted information to respond to inquiries, review quotations, fulfill and support orders, maintain inventory records, protect the service and meet applicable business obligations."],
    ["Who can access it", "Customer information is restricted to authorized business personnel and service providers that are necessary to operate hosting, database, delivery or communication services. It is not displayed publicly."],
    ["Payments", "The site does not collect card details. Cash on Delivery is prepared as the initial option. Bank transfer must remain unavailable until verified bank instructions are configured."],
    ["Analytics", "If website analytics is enabled, limited technical and usage information may be processed to measure page performance and customer journeys. Analytics remains disabled unless a measurement provider and identifier are deliberately configured."],
    ["Your choices", `To ask about, correct or request deletion of information you provided, email ${company.email}. Some records may need to be retained where required for legitimate order or legal purposes.`],
    ["Policy status", "Retention periods, cookie choices and any third-party provider disclosures must be finalized before the production launch once hosting, analytics, delivery and communication providers are selected."],
  ]} /></>;
}
