import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  Factory,
  GraduationCap,
  HeartPulse,
  Hotel,
  Landmark,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Truck,
  Utensils,
} from "lucide-react";
import styles from "@/components/blog/blog.module.css";
import corporate from "./corporate.module.css";
import { company } from "@/lib/company";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

const title = "Corporate Hygiene Supplies in Lahore";
const description =
  "Wholesale tissue, washroom, cleaning and disposable supplies for offices, hotels and institutions in Lahore. Request a bulk quote or arrange regular restocking.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/corporate-orders" },
  openGraph: {
    title,
    description,
    url: "/corporate-orders",
    type: "website",
    images: [
      {
        url: "/images/corporate-delivery-loading-v2.webp",
        alt: "Pak Multilinks team loading Rose Petal cartons for delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/corporate-delivery-loading-v2.webp"],
  },
};

const categories = [
  {
    title: "Tissue paper products",
    description:
      "Facial tissues, soft packs, toilet rolls and kitchen towels for daily workplace use.",
    href: "/shop/tissue-paper-products",
  },
  {
    title: "Washroom supplies",
    description:
      "Hand towels, soaps and essentials to keep shared washrooms ready for use.",
    href: "/shop/washroom-supplies",
  },
  {
    title: "Cleaning products",
    description:
      "Practical cleaning supplies for housekeeping and facility teams.",
    href: "/shop/cleaning-products",
  },
  {
    title: "Dispensers",
    description:
      "Washroom dispensers and compatible refill options for busy spaces.",
    href: "/shop/dispensers",
  },
  {
    title: "Floor & surface care",
    description:
      "Products for routine floor and surface cleaning across commercial sites.",
    href: "/shop/floor-surface-care",
  },
];

const industries = [
  [Building2, "Offices"],
  [HeartPulse, "Healthcare"],
  [Utensils, "Restaurants"],
  [Hotel, "Hotels"],
  [GraduationCap, "Schools"],
  [Factory, "Factories"],
  [ShoppingBag, "Retail"],
  [Landmark, "Commercial buildings"],
] as const;

const faqs = [
  {
    question: "What products can we order for a corporate facility?",
    answer:
      "You can request tissue paper, toilet rolls, hand towels, hand wash, cleaning products, disposables and dispensers. Share your product list and quantities for a tailored quotation.",
  },
  {
    question: "Can you arrange recurring supplies for our office?",
    answer:
      "Yes. Tell us your expected usage, delivery location and preferred schedule. Our team can discuss a regular restocking plan for your workplace.",
  },
  {
    question: "Do you deliver corporate orders outside Lahore?",
    answer:
      "We coordinate local delivery in Lahore and can discuss cargo dispatch for orders elsewhere in Pakistan. Availability, timing and charges are confirmed with your quotation.",
  },
  {
    question: "How do we get a bulk quotation?",
    answer:
      "Use the request form or contact our sales team with your items, carton quantities and delivery city. We will review the requirements and share a quotation.",
  },
];

export default function CorporateOrdersPage() {
  const whatsappUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Assalam-o-Alaikum Pak Multilinks, I need a corporate hygiene supplies quotation. Please guide me.")}`;
  const structuredData = [
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Corporate orders", path: "/corporate-orders" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${absoluteUrl("/corporate-orders")}#service`,
      name: "Corporate hygiene and washroom supplies",
      description,
      url: absoluteUrl("/corporate-orders"),
      provider: { "@id": `${absoluteUrl("/")}#business` },
      areaServed: [
        { "@type": "City", name: "Lahore" },
        { "@type": "Country", name: "Pakistan" },
      ],
      serviceType: "Bulk hygiene supplies and workplace restocking",
    },
  ];

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <div className={styles.shell}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Corporate supplies</span>
        </nav>
        <header className={styles.journalHeader}>
          <div>
            <p className={styles.eyebrow}>
              <span className={styles.dot} /> Your workplace supply partner
            </p>
            <h1>
              Corporate supplies.
              <br />
              <em>Handled with care.</em>
            </h1>
          </div>
          <div className={styles.headerIntro}>
            <p>
              Wholesale tissue, washroom and cleaning supplies for offices,
              hotels and institutions in Lahore.
            </p>
            <div>
              <span>Bulk carton orders</span>
              <span>Recurring supply options</span>
            </div>
            <a href="#supply-range">
              Explore our supply range{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </header>
        <section
          className={styles.featured}
          aria-labelledby="workplace-heading"
        >
          <div className={styles.featuredCopy}>
            <span className={styles.featuredLabel}>
              Built around your business
            </span>
            <h2 id="workplace-heading">
              One list. One contact.
              <br />
              Everyday essentials.
            </h2>
            <p>
              Share what your workplace uses. We will help you review the
              products, carton quantities and delivery requirements for your
              next order.
            </p>
            <div className={corporate.heroActions}>
              <Link href="/request-quote" className={styles.lightButton}>
                Request a quotation{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <a href={whatsappUrl} className={corporate.whatsapp}>
                <MessageCircle size={17} aria-hidden="true" /> WhatsApp sales
              </a>
            </div>
            <span className={styles.featuredFoot}>
              Based in Gulberg II, Lahore · Delivery details confirmed with your
              quote
            </span>
          </div>
          <div className={styles.featuredImage}>
            <Image
              src="/images/corporate-delivery-loading-v2.webp"
              alt="Pak Multilinks team loading Rose Petal cartons for delivery"
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
              preload
            />
            <div className={styles.imageNote}>
              <span>READY FOR THE WORKING DAY</span>
              <p>
                Keep your team
                <br />
                well supplied.
              </p>
            </div>
          </div>
        </section>
        <div className={styles.editorialStrip}>
          <span>
            <Check size={17} aria-hidden="true" /> Product and packing guidance
          </span>
          <span>
            <Check size={17} aria-hidden="true" /> Quotes for your quantities
          </span>
          <span>
            <Check size={17} aria-hidden="true" /> Delivery coordination
          </span>
        </div>
        <section
          id="supply-range"
          className={corporate.section}
          aria-labelledby="range-heading"
        >
          <div className={styles.archiveHeading}>
            <div>
              <p className={styles.eyebrow}>What we supply</p>
              <h2 id="range-heading">The essentials, all in one place.</h2>
            </div>
            <p className={corporate.sectionIntro}>
              Explore the range, then send your requirements for current
              availability and carton pricing.
            </p>
          </div>
          <div className={corporate.supplyGrid}>
            {categories.map((category, index) => (
              <Link
                key={category.href}
                href={category.href}
                className={corporate.supplyCard}
              >
                <span className={corporate.number}>0{index + 1}</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <span className={corporate.cardLink}>
                  Explore products <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section
          className={corporate.serviceSection}
          aria-labelledby="service-heading"
        >
          <div>
            <p className={styles.eyebrow}>A practical partnership</p>
            <h2 id="service-heading">
              Supply that fits
              <br />
              your operation.
            </h2>
            <p>
              Manage daily essentials with a clear product list, agreed
              quantities and a restocking plan that suits your team.
            </p>
          </div>
          <div className={corporate.services}>
            {[
              [
                PackageCheck,
                "Bulk purchasing",
                "Confirm packing and carton quantities for the products your team uses.",
              ],
              [
                CalendarDays,
                "Planned restocking",
                "Discuss a repeat supply schedule based on your expected usage.",
              ],
              [
                Truck,
                "Delivery coordination",
                "Confirm the receiving location, timing and charges with our sales team.",
              ],
            ].map(([Icon, heading, copy]) => {
              const ServiceIcon = Icon as typeof PackageCheck;
              return (
                <article key={heading as string}>
                  <ServiceIcon size={23} aria-hidden="true" />
                  <div>
                    <h3>{heading as string}</h3>
                    <p>{copy as string}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section
          className={corporate.section}
          aria-labelledby="industries-heading"
        >
          <div className={styles.archiveHeading}>
            <div>
              <p className={styles.eyebrow}>Who we supply</p>
              <h2 id="industries-heading">
                Different workplaces. Shared essentials.
              </h2>
            </div>
          </div>
          <div className={corporate.industries}>
            {industries.map(([Icon, label]) => (
              <div key={label}>
                <Icon size={22} aria-hidden="true" />
                <h3>{label}</h3>
              </div>
            ))}
          </div>
        </section>
        <section
          className={corporate.section}
          aria-labelledby="process-heading"
        >
          <div className={styles.archiveHeading}>
            <div>
              <p className={styles.eyebrow}>How it works</p>
              <h2 id="process-heading">From your list to a clear quotation.</h2>
            </div>
          </div>
          <div className={corporate.steps}>
            {[
              [
                ClipboardList,
                "Share your list",
                "Send product names, quantities and delivery city.",
              ],
              [
                MessageCircle,
                "Review the details",
                "We clarify specifications, availability and packing.",
              ],
              [
                PackageCheck,
                "Receive your quote",
                "Review prices and delivery terms before placing your order.",
              ],
            ].map(([Icon, heading, copy], index) => {
              const StepIcon = Icon as typeof ClipboardList;
              return (
                <article key={heading as string}>
                  <div>
                    <StepIcon size={23} aria-hidden="true" />
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{heading as string}</h3>
                  <p>{copy as string}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className={corporate.faqLayout}>
          <div>
            <p className={styles.eyebrow}>Before you order</p>
            <h2>
              Corporate supply,
              <br />
              clearly explained.
            </h2>
            <p>
              Questions about your specific facility?{" "}
              <Link href="/contact">Speak with our team.</Link>
            </p>
          </div>
          <div className={styles.articleFaq}>
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={styles.contactBanner}>
          <div>
            <p className={styles.eyebrow}>Let’s plan your next order</p>
            <h2>A well-stocked workplace starts here.</h2>
            <p>
              Send your product list and delivery location for a tailored
              quotation.
            </p>
          </div>
          <Link href="/request-quote" className={styles.darkButton}>
            Request a quotation <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>
        <div className={corporate.footerLinks}>
          <Link href="/blog/office-hotel-hygiene-checklist">
            Read the workplace restocking checklist{" "}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <a href={`tel:${company.phoneHref}`}>Call {company.phone}</a>
        </div>
      </div>
    </div>
  );
}
