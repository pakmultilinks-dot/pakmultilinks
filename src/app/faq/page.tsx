import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, HelpCircle, MessageSquare } from "lucide-react";

import { FaqAccordion } from "@/components/ui/faq-accordion";
import { company } from "@/lib/company";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Wholesale & Procurement FAQs | Pak Multilinks Lahore",
  description:
    "Find answers to common questions about wholesale tissue and hygiene orders, carton quantities, minimum order values, Lahore delivery, and nationwide dispatch.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Wholesale & Procurement FAQs | Pak Multilinks Lahore",
    description:
      "Find answers to common questions about wholesale tissue and hygiene orders, carton quantities, minimum order values, Lahore delivery, and nationwide dispatch.",
    type: "website",
    url: "/faq",
    siteName: company.name,
  },
};

const FAQ_DATA = [
  {
    question: "What is the minimum order?",
    answer:
      "One wholesale carton, or a PKR 5,000 order, whichever applies to the product. Carton quantities and MOQ are shown on every product page.",
    renderedAnswer: (
      <p>
        One wholesale carton, or a PKR 5,000 order, whichever applies to the
        product. Carton quantities and MOQ are shown on every{" "}
        <Link href="/shop" className="text-action font-semibold hover:underline">
          product page
        </Link>
        .
      </p>
    ),
  },
  {
    question: "Do you sell by carton or by single piece?",
    answer:
      "By carton for wholesale. Where a product page shows pieces per carton, the carton price and the per-piece price are both shown.",
    renderedAnswer: (
      <p>
        By carton for wholesale. Where a product page shows pieces per carton,
        the carton price and the per-piece price are both shown.
      </p>
    ),
  },
  {
    question: "How fast is delivery in Lahore?",
    answer:
      "Same-day or next-day scheduled delivery across Gulberg, DHA, Bahria Town, Model Town, Johar Town and other commercial zones in Lahore.",
    renderedAnswer: (
      <p>
        Same-day or next-day scheduled delivery across Gulberg, DHA, Bahria
        Town, Model Town, Johar Town and other commercial zones in Lahore.
      </p>
    ),
  },
  {
    question: "Do you deliver outside Lahore?",
    answer:
      "Yes, daily cargo and freight dispatch to Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Sialkot, Peshawar and other cities across Pakistan.",
    renderedAnswer: (
      <p>
        Yes, daily cargo and freight dispatch to Karachi, Islamabad,
        Rawalpindi, Faisalabad, Multan, Sialkot, Peshawar and other cities
        across Pakistan.
      </p>
    ),
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Cash on Delivery (COD) and direct bank transfer (IBFT). Corporate account terms are available for contract clients.",
    renderedAnswer: (
      <p>
        Cash on Delivery (COD) and direct bank transfer (IBFT). Corporate
        account terms are available for contract clients per our{" "}
        <Link href="/terms" className="text-action font-semibold hover:underline">
          terms of service
        </Link>
        .
      </p>
    ),
  },
  {
    question: "How do I order on WhatsApp?",
    answer:
      "Message +92 325 8166 829 with the product name and carton quantity for an instant carton quotation, packing confirmation and delivery coordination.",
    renderedAnswer: (
      <p>
        Message{" "}
        <a
          href="https://wa.me/923258166829"
          target="_blank"
          rel="noopener noreferrer"
          className="text-action font-bold hover:underline"
        >
          +92 325 8166 829
        </a>{" "}
        with the product name and carton quantity for an instant carton
        quotation, packing confirmation and delivery coordination.
      </p>
    ),
  },
  {
    question: "Are your products genuine?",
    answer:
      "Yes, original sealed factory cartons from brands including Rose Petal, Nozomi and Fresco.",
    renderedAnswer: (
      <p>
        Yes, original sealed factory cartons from brands including Rose Petal,
        Nozomi and Fresco. For return or exchange details, see our{" "}
        <Link href="/returns" className="text-action font-semibold hover:underline">
          return policy
        </Link>
        .
      </p>
    ),
  },
  {
    question: "Do you offer bulk discounts above 10 cartons?",
    answer:
      "Ask on WhatsApp for a bulk quotation for orders above 10 cartons. Do not publish a discount percentage unless I confirm one.",
    renderedAnswer: (
      <p>
        Ask on{" "}
        <a
          href="https://wa.me/923258166829?text=Hello%2C%20I%20would%20like%20a%20bulk%20quotation%20for%20an%20order%20above%2010%20cartons."
          target="_blank"
          rel="noopener noreferrer"
          className="text-action font-bold hover:underline"
        >
          WhatsApp (+92 325 8166 829)
        </a>{" "}
        for a bulk quotation for orders above 10 cartons.
      </p>
    ),
  },
  {
    question: "Where is your shop?",
    answer:
      "Shop No LG-9, Rehman Tower, Main Market, Gulberg II, Lahore, Punjab 54000, Pakistan.",
    renderedAnswer: (
      <p>
        Shop No LG-9, Rehman Tower, Main Market, Gulberg II, Lahore, Punjab
        54000, Pakistan. You can view our map and directions on the{" "}
        <Link href="/contact" className="text-action font-semibold hover:underline">
          contact page
        </Link>
        .
      </p>
    ),
  },
  {
    question: "How do I contact you?",
    answer:
      "WhatsApp +92 325 8166 829, email zohair.shah8@gmail.com, or the /contact page.",
    renderedAnswer: (
      <p>
        WhatsApp{" "}
        <a
          href="https://wa.me/923258166829"
          target="_blank"
          rel="noopener noreferrer"
          className="text-action font-bold hover:underline"
        >
          +92 325 8166 829
        </a>
        , email{" "}
        <a
          href="mailto:zohair.shah8@gmail.com"
          className="text-action font-semibold hover:underline"
        >
          zohair.shah8@gmail.com
        </a>
        , or visit our{" "}
        <Link href="/contact" className="text-action font-semibold hover:underline">
          contact page
        </Link>
        .
      </p>
    ),
  },
];

export default function FaqPage() {
  const breadcrumbs = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Frequently Asked Questions", path: "/faq" },
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="faq-page bg-surface-soft/40 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([breadcrumbs, faqSchema]),
        }}
      />

      {/* Top Breadcrumb */}
      <div className="border-b border-line bg-surface py-3">
        <div className="site-shell">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-xs font-semibold text-muted">
              <li>
                <Link href="/" className="hover:text-accent transition">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 text-muted/60" />
              </li>
              <li className="text-accent font-bold" aria-current="page">
                FAQs
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="border-b border-line bg-surface py-10 sm:py-14">
        <div className="site-shell max-w-4xl text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-action/30 bg-action/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-action mb-3">
            <HelpCircle className="size-3.5" />
            Support &amp; Ordering Information
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-content tracking-tight leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-secondary max-w-2xl">
            Everything you need to know about wholesale carton ordering, minimum quantities,
            delivery timelines across Lahore, nationwide shipping, and payment terms.
          </p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <FaqAccordion
        faqs={FAQ_DATA.map((item) => ({
          question: item.question,
          answer: item.renderedAnswer,
        }))}
        className="border-none"
      />

      {/* Contact Sales Support Banner */}
      <section className="pb-16 sm:pb-20">
        <div className="site-shell max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-3xl border border-action/30 bg-action/5 p-6 sm:p-8 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-action font-extrabold text-xs mb-1">
                <MessageSquare className="size-4" />
                <span>Still have questions?</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-content">
                Need customized carton pricing or a formal quotation?
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-secondary">
                Our sales desk is active on WhatsApp for direct carton quotes, delivery coordination, and corporate accounts.
              </p>
            </div>
            <a
              href="https://wa.me/923258166829?text=Hello%20Pak%20Multilinks%2C%20I%20have%20an%20inquiry%20regarding%20wholesale%20supplies."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-6 text-xs sm:text-sm font-extrabold text-white transition hover:bg-action-hover shadow-xs shrink-0"
            >
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
