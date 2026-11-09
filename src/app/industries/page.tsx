import type { Metadata } from "next";
import Link from "next/link";

import { company } from "@/lib/company";
import { breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

const industriesDescription =
  "Pak Multilinks Hygiene supplies tissue, washroom and hygiene products by the carton to offices, hotels, restaurants, hospitals, schools, factories and salons in Lahore and across Pakistan, with scheduled corporate restocking.";

export const metadata: Metadata = {
  title: "Industries We Serve: Corporate Hygiene Supplies in Pakistan",
  description: industriesDescription,
  alternates: { canonical: "/industries" },
  openGraph: {
    title: "Industries We Serve: Corporate Hygiene Supplies in Pakistan",
    description: industriesDescription,
    url: "/industries",
    type: "website",
  },
};

export const revalidate = 3600;

const SECTORS: Array<{ name: string; copy: string; links: Array<{ label: string; href: string }> }> = [
  {
    name: "Offices & corporate facilities",
    copy: "Facial tissues for desks and meeting rooms, toilet rolls and hand towels for washrooms, liquid hand wash refills and floor care for daily housekeeping. Offices order a mixed monthly carton list and reorder on WhatsApp when stock runs low.",
    links: [
      { label: "Facial tissues", href: "/shop/facial-tissues" },
      { label: "Hand wash & hygiene", href: "/shop/hand-wash" },
    ],
  },
  {
    name: "Hotels & guest houses",
    copy: "Guest rooms and housekeeping run on toilet rolls, facial tissues, napkins and air fresheners, while kitchens and laundry areas use towels, detergents and surface cleaners. Carton supply keeps per-room costs at wholesale rates through peak season.",
    links: [
      { label: "Tissue rolls", href: "/shop/tissue-rolls" },
      { label: "Paper napkins", href: "/shop/paper-napkins" },
    ],
  },
  {
    name: "Restaurants, cafes & caterers",
    copy: "Table napkins, kitchen towel rolls, hand wash, dishwash and disposable items are the daily consumables of food businesses. We supply them by the carton, and custom logo printing is available on facial tissue boxes for branded dining rooms.",
    links: [
      { label: "Cleaning products", href: "/shop/cleaning-products" },
    ],
  },
  {
    name: "Hospitals & clinics",
    copy: "Wards and washrooms need disinfectant phenyl, hand wash, hand towels, toilet rolls and garbage liners in steady volume. Germi Cure institutional disinfectants and bulk 5 litre refills are stocked for healthcare facilities.",
    links: [
      { label: "Germi Cure brand", href: "/brand/germi-cure" },
      { label: "Washroom supplies", href: "/shop/washroom-supplies" },
    ],
  },
  {
    name: "Schools & educational campuses",
    copy: "Campuses consume tissues, hand wash, floor cleaners and disposables across classrooms, washrooms and canteens every day. A scheduled monthly supply keeps the campus stocked without repeated small orders.",
    links: [
      { label: "Soft pack tissues", href: "/shop/soft-pack-tissues" },
      { label: "Floor & surface care", href: "/shop/floor-surface-care" },
    ],
  },
  {
    name: "Factories & industrial plants",
    copy: "Industrial sites order heavy-duty garbage bags, mops and wipers, bulk hand wash for worker washrooms and cleaning chemicals for large floor areas, all in carton and drum packing at wholesale rates.",
    links: [
      { label: "Cleaning products", href: "/shop/cleaning-products" },
    ],
  },
  {
    name: "Salons & retail shops",
    copy: "Salons use facial tissues, soft packs, towels and surface cleaners daily, and retail shops resell pocket tissues and party packs. Both order by the carton at the same wholesale rate list.",
    links: [
      { label: "Facial tissues", href: "/shop/facial-tissues" },
      { label: "Rate list", href: "/rate-list" },
    ],
  },
  {
    name: "Banquet halls & event venues",
    copy: "Events spike demand for napkins, tissue boxes, toilet rolls, hand towels and disposables on fixed dates. Venues reserve cartons in advance on WhatsApp so event-day stock is confirmed before the function.",
    links: [
      { label: "Paper napkins", href: "/shop/paper-napkins" },
      { label: "Tissue products", href: "/shop/tissue-paper-products" },
    ],
  },
];

export default function IndustriesPage() {
  const breadcrumbs = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Industries We Serve", path: "/industries" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />

      <section className="bg-surface py-12 sm:py-16">
        <div className="site-shell max-w-4xl">
          <p className="eyebrow">Industries we serve</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-.035em] text-content sm:text-4xl">
            Corporate hygiene supplies for every kind of facility
          </h1>
          <div className="mt-6 space-y-5 text-base leading-8 text-secondary">
            <p>
              {company.name} supplies tissue, washroom and hygiene products by the carton to businesses and institutions
              from {company.address}. The minimum order is PKR 5,000 or one wholesale carton, delivery is same-day or
              next-day across Lahore and by cargo nationwide, and contract clients can set up scheduled restocking
              through our corporate orders desk.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/corporate-orders" className="commerce-button commerce-button-primary inline-flex items-center">
              Corporate orders
            </Link>
            <Link href="/rate-list" className="commerce-button commerce-button-secondary inline-flex items-center">
              See the rate list
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-soft/40 py-10 sm:py-12">
        <div className="site-shell grid gap-5 sm:grid-cols-2">
          {SECTORS.map((sector) => (
            <article key={sector.name} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h2 className="text-lg font-bold text-content">{sector.name}</h2>
              <p className="mt-2 text-sm leading-7 text-secondary">{sector.copy}</p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {sector.links.map((link) => (
                  <Link key={link.href} href={link.href} className="font-semibold text-accent hover:underline">
                    {link.label}
                  </Link>
                ))}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface py-10 sm:py-12">
        <div className="site-shell max-w-4xl">
          <h2 className="font-serif text-2xl text-content sm:text-3xl">Set up a standing supply</h2>
          <p className="mt-3 text-sm leading-7 text-secondary">
            Send your monthly product list on WhatsApp at {company.phone} or through the{" "}
            <Link href="/request-quote" className="font-semibold text-accent hover:underline">
              quote request form
            </Link>{" "}
            and the team will prepare a carton quotation. Common questions about ordering, delivery and payment are
            answered in the{" "}
            <Link href="/faq" className="font-semibold text-accent hover:underline">
              FAQs
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
