import type { Metadata } from "next";
import { Mail, MapPin, Navigation, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { company, contacts } from "@/lib/company";

export const metadata: Metadata = { title: "Contact Our Lahore Hygiene Supply Team", description: `Call, email or visit ${company.name} in Gulberg II, Lahore for wholesale hygiene products, orders and business quotations.`, alternates: { canonical: "/contact" }, openGraph: { title: `Contact ${company.name}`, description: "Wholesale hygiene product enquiries and quotations in Lahore.", url: "/contact", type: "website" } };

export default function ContactPage() {
  const mapQuery = encodeURIComponent(company.address);
  const mapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
  return <>
    <section className="py-12 sm:py-16">
      <div className="site-shell">
        <h1 className="sr-only">Contact {company.name}</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {contacts.map((contact) => {
            const cardImg = contact.name.includes("Zohair")
              ? "/images/contact/zohair-ahmed-card.png"
              : "/images/contact/bilal-shah-card.png";
            const primaryPhone = contact.phones[0]?.href || "";
            const whatsappNumber = "923171678829";

            return (
              <article
                key={contact.email}
                className="contact-card group relative overflow-hidden rounded-[2rem] border border-line bg-surface p-4 shadow-[0_10px_35px_rgba(21,65,42,.06)] transition-all duration-300 hover:border-action/40 hover:shadow-xl sm:p-5"
              >
                <div className="overflow-hidden rounded-[1.4rem] border border-line/60 bg-white shadow-sm transition-transform duration-300 group-hover:scale-[1.01]">
                  <Image
                    src={cardImg}
                    alt={`${contact.name} - Pak Multilinks Hygiene Visiting Card`}
                    width={600}
                    height={350}
                    unoptimized
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Pak Multilinks, I am inquiring about wholesale supplies")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/10 px-3 py-1.5 text-xs font-bold text-[#128C7E] transition hover:bg-[#25D366] hover:text-white"
                    >
                      WhatsApp
                    </a>
                    {primaryPhone && (
                      <a
                        href={`tel:${primaryPhone}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1.5 text-xs font-bold text-accent transition hover:bg-action hover:text-white"
                      >
                        <Phone className="size-3" /> Call
                      </a>
                    )}
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent hover:underline"
                  >
                    <Mail className="size-3" /> {contact.email}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <section className="contact-map mt-5 overflow-hidden rounded-[2rem] border border-line bg-surface shadow-[0_10px_35px_rgba(21,65,42,.06)]" aria-labelledby="office-location-title">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4 sm:items-center">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-soft text-accent"><MapPin className="size-5" /></span>
              <div><h2 id="office-location-title" className="text-xs font-extrabold uppercase tracking-[.13em] text-muted">Office location</h2><p className="mt-1 text-sm font-bold leading-6 text-accent">{company.address}</p></div>
            </div>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="commerce-button commerce-button-primary inline-flex shrink-0 items-center justify-center gap-2">
              <Navigation className="size-4" /> Get directions
            </a>
          </div>
          <iframe
            src={mapUrl}
            title={`${company.name} office location on Google Maps`}
            className="h-[22rem] w-full border-0 sm:h-[28rem]"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        <div className="contact-cta mt-10 rounded-[2rem] bg-action p-7 text-white sm:flex sm:items-center sm:justify-between sm:p-10"><div><h2 className="text-2xl font-black">Request a business quotation</h2><p className="mt-2 text-sm leading-6 text-[#c9dfd1]">Send us your product quantities and delivery city for review.</p></div><Link href="/request-quote" className="commerce-button mt-6 inline-flex items-center justify-center border border-white bg-surface text-accent sm:mt-0">Get a quote</Link></div>
      </div>
    </section>
  </>;
}
export const revalidate = 3600;
