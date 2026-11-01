import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
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
        url: "/images/warehouse-team.webp",
        alt: "Pak Multilinks Hygiene corporate supply team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/warehouse-team.webp"],
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
    title: "Disposable items",
    description:
      "Cups, napkins, bags and other consumables for pantries, events and service areas.",
    href: "/shop/disposable-items",
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
    <div className="bg-canvas text-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="bg-[#103c2d] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="mb-8 text-sm text-emerald-100/80"
            >
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span aria-hidden="true" className="mx-2">
                /
              </span>
              Corporate orders
            </nav>
            <p className="mb-4 text-sm font-bold uppercase tracking-[.18em] text-emerald-200">
              Business supply solutions · Lahore
            </p>
            <h1 className="max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Corporate hygiene supplies, handled with care.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-emerald-50/85 sm:text-lg">
              Keep your workplace stocked with wholesale tissue, washroom,
              cleaning and disposable products. Tell us what your team uses and
              get a quotation built around your quantities and delivery needs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/request-quote"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-[#103c2d] transition hover:bg-emerald-100"
              >
                Request a quotation{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                href={whatsappUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-white/50 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle aria-hidden="true" className="size-4" /> WhatsApp
                sales
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-emerald-50/85">
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-300" /> Bulk carton orders
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-300" /> Recurring supply
                options
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-emerald-300" /> Lahore delivery
              </span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#286048] shadow-2xl ring-1 ring-white/15">
            <Image
              src="/images/warehouse-team.webp"
              alt="Warehouse staff packing tissue and hygiene supply cartons"
              width={900}
              height={720}
              sizes="(min-width: 1024px) 45vw, 100vw"
              preload
              className="aspect-[5/4] w-full object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 text-[#103c2d] shadow-lg sm:inset-x-6 sm:bottom-6 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">
                Your supply partner
              </p>
              <p className="mt-1 font-serif text-xl">
                One point of contact for everyday essentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="products-heading"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">
            What we supply
          </p>
          <h2
            id="products-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl"
          >
            Everyday essentials for busy facilities
          </h2>
          <p className="mt-4 leading-7 text-secondary">
            Browse product ranges, then send us your required items and
            quantities for current availability and carton pricing.
          </p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-2xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-accent hover:shadow-lg"
            >
              <span className="text-sm font-bold text-accent">
                0{index + 1}
              </span>
              <h3 className="mt-5 text-xl font-bold">{category.title}</h3>
              <p className="mt-3 min-h-16 text-sm leading-6 text-secondary">
                {category.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
                Explore products{" "}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#eaf2ec] py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">
              Built for business
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Supply that fits your operation
            </h2>
            <p className="mt-4 leading-7 text-secondary">
              Whether you manage one office or several facilities, our sales
              team can help you plan carton quantities, coordinate delivery and
              discuss a repeat order schedule.
            </p>
            <Link
              href="/request-quote"
              className="mt-7 inline-flex items-center gap-2 font-bold text-accent hover:underline"
            >
              Discuss your requirements{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <PackageCheck className="size-8 text-accent" />
              <h3 className="mt-5 font-bold">Bulk purchasing</h3>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Request carton quantities for your regular essentials.
              </p>
            </article>
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <CalendarDays className="size-8 text-accent" />
              <h3 className="mt-5 font-bold">Planned restocking</h3>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Discuss a schedule that matches your usage.
              </p>
            </article>
            <article className="rounded-2xl bg-white p-6 shadow-sm">
              <Truck className="size-8 text-accent" />
              <h3 className="mt-5 font-bold">Delivery coordination</h3>
              <p className="mt-2 text-sm leading-6 text-secondary">
                Confirm timing and location with our sales team.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">
              Who we work with
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Hygiene supplies across industries
            </h2>
            <p className="mt-4 leading-7 text-secondary">
              From visitor facing areas to staff washrooms and back of house
              operations, we support the products facilities use every day.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {industries.map(([Icon, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <Icon aria-hidden="true" className="size-6 text-accent" />
                <span className="mt-4 block text-sm font-semibold">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">
            Simple process
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
            From requirement to quotation
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-line bg-canvas p-6">
              <ClipboardList className="size-7 text-accent" />
              <h3 className="mt-7 text-xl font-bold">1. Share your list</h3>
              <p className="mt-3 text-sm leading-6 text-secondary">
                Send the products, quantities and delivery city you need.
              </p>
            </article>
            <article className="rounded-2xl border border-line bg-canvas p-6">
              <MessageCircle className="size-7 text-accent" />
              <h3 className="mt-7 text-xl font-bold">
                2. Review with our team
              </h3>
              <p className="mt-3 text-sm leading-6 text-secondary">
                We check your requirements and clarify any product details.
              </p>
            </article>
            <article className="rounded-2xl border border-line bg-canvas p-6">
              <PackageCheck className="size-7 text-accent" />
              <h3 className="mt-7 text-xl font-bold">3. Receive your quote</h3>
              <p className="mt-3 text-sm leading-6 text-secondary">
                Get pricing and delivery details before you place an order.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">
            Common questions
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
            Corporate ordering FAQs
          </h2>
          <p className="mt-4 leading-7 text-secondary">
            Need specifics for your site? Our team can help with your product
            list and delivery location.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-2xl border border-line bg-surface p-5"
            >
              <summary className="cursor-pointer list-none font-bold marker:hidden">
                {question}
                <span
                  aria-hidden="true"
                  className="float-right ml-3 text-accent group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-secondary">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-[#103c2d] px-4 py-14 text-center text-white sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl sm:text-4xl">
            Ready to plan your next supply order?
          </h2>
          <p className="mt-4 leading-7 text-emerald-50/85">
            Share your requirements and our team will help you find the right
            products and quantities.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/request-quote"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-[#103c2d] hover:bg-emerald-100"
            >
              Request a quote{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <a
              href={`tel:${company.phoneHref}`}
              className="rounded-xl border border-white/50 px-6 py-3.5 font-semibold hover:bg-white/10"
            >
              Call {company.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
