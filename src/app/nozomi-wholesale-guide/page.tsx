import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { company } from "@/lib/company";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Nozomi Wholesale Buying Guide & FAQs | Pak Multilinks Lahore",
  description:
    "Wholesale buying guide for Nozomi hygiene products in Pakistan: packing, carton quantities, commercial use and procurement. Minimum order one carton, Lahore delivery and nationwide dispatch.",
  alternates: { canonical: "/nozomi-wholesale-guide" },
  openGraph: {
    title: "Nozomi Wholesale Buying Guide & FAQs | Pak Multilinks Lahore",
    description:
      "Packing, commercial use and procurement information for Nozomi tissue, hand wash, sanitizer, dispenser and hand dryer products, supplied wholesale from Lahore.",
    type: "website",
    url: "/nozomi-wholesale-guide",
    siteName: company.name,
  },
};

const FAQ_DATA = [
  {
    question: "What is the minimum order for Nozomi products?",
    answer: (
      <p>
        One wholesale carton. Every Nozomi{" "}
        <Link href="/shop" className="text-action font-semibold hover:underline">
          product page
        </Link>{" "}
        shows its units per carton and its MOQ, which is 1 carton.
      </p>
    ),
  },
  {
    question: "Are Nozomi products sold by carton or by single piece?",
    answer: (
      <p>
        By carton for wholesale. Where a product page shows pieces per carton,
        the carton price and the per-piece price are both shown.
      </p>
    ),
  },
  {
    question: "Which businesses use Nozomi products?",
    answer: (
      <p>
        Offices, hotels, restaurants, hospitals, schools, gyms, mosques,
        factories and retail shops use Nozomi tissue, hand wash, sanitizer,
        dispenser and hand dryer products for daily washroom and cleaning use.
      </p>
    ),
  },
  {
    question: "How do I order Nozomi products wholesale?",
    answer: (
      <p>
        Add cartons to your cart on the{" "}
        <Link href="/shop" className="text-action font-semibold hover:underline">
          shop
        </Link>
        , or contact Pak Multilinks on WhatsApp for a wholesale order. Prices
        and carton quantities are listed on each product page.
      </p>
    ),
  },
  {
    question: "Do you deliver outside Lahore?",
    answer: (
      <p>
        Yes. Pak Multilinks supplies wholesale orders from Lahore to businesses
        across Pakistan.
      </p>
    ),
  },
];

export default function NozomiWholesaleGuidePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {" / "}
        <span>Nozomi Wholesale Buying Guide</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Nozomi Wholesale Buying Guide &amp; FAQs
      </h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Nozomi products cover tissue, hand wash, hand sanitizer, air freshener,
        dish wash, insect killer, hand dryers, dispensers, car polish and face
        masks. This guide explains packing, commercial use and how to buy them
        wholesale from Pak Multilinks in Lahore.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Packing</h2>
        <p className="mt-3 text-base leading-7 text-muted">
          Nozomi products are packed by the carton. The units per carton are
          shown on every product page and differ by product:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7">
          <li>
            <strong>Tissue and hand towels:</strong> Softex hand towels,
            Super Soft tissue boxes and GLAD tissue boxes, sold by the carton.
          </li>
          <li>
            <strong>Hand wash and sanitizer:</strong> FRESCO and GERMI CURE
            hand wash and sanitizer, commonly 24 pieces per carton.
          </li>
          <li>
            <strong>Air freshener and dish wash:</strong> FRESCO air freshener
            48 pieces per carton; FRESCO dish wash liquid 24 pieces per carton.
          </li>
          <li>
            <strong>Hand dryers:</strong> FRESCO and SIEMENSE hand dryers,
            2 to 8 pieces per carton depending on the model.
          </li>
          <li>
            <strong>Dispensers:</strong> FRESCO and Germi Cure sanitizer and
            soap dispensers, 16 to 32 pieces per carton depending on the model.
          </li>
          <li>
            <strong>Car polish and face masks:</strong> SHINE WELL car polish
            24 pieces per carton; Germi Cure face masks by the carton.
          </li>
        </ul>
        <p className="mt-4 text-base leading-7 text-muted">
          Minimum order is 1 carton (MOQ: 1 ctn) on every Nozomi product.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Commercial use</h2>
        <p className="mt-3 text-base leading-7 text-muted">
          Nozomi products are made for commercial and institutional use:
          washrooms in offices, hotels, restaurants, hospitals, schools and
          factories, cleaning for retail shops and warehouses, and hygiene
          supplies for clinics and mosques. Tissue, hand wash, sanitizer and
          dispensers are the everyday washroom range; hand dryers and
          dispensers are the fixed washroom fittings; car polish and face
          masks serve workshops and front-line staff.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Procurement</h2>
        <p className="mt-3 text-base leading-7 text-muted">
          Buy by the carton from the shop, or contact Pak Multilinks for a
          wholesale order. Each product page shows its carton quantity, its
          per-piece price where it applies, and its MOQ. For repeat or bulk
          orders, ask for a quote with the product name and the number of
          cartons you need.
        </p>
        <p className="mt-4">
          <Link
            href="/shop"
            className="text-action font-semibold hover:underline"
          >
            Browse the Nozomi range in the shop
          </Link>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">FAQs</h2>
        <div className="mt-4">
          <FaqAccordion faqs={FAQ_DATA} />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbStructuredData([
              { name: "Home", path: "/" },
              { name: "Nozomi Wholesale Buying Guide", path: "/nozomi-wholesale-guide" },
            ]),
          }),
        }}
      />
    </main>
  );
}
