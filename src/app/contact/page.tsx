import type { Metadata } from "next";
import { BadgeCheck, Mail, MapPin, Navigation, Phone, UserRound } from "lucide-react";
import Link from "next/link";

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
        <div className="grid gap-5 lg:grid-cols-2">
          {contacts.map((contact) => (
            <article key={contact.email} className={`relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-[0_10px_35px_rgba(21,65,42,.06)] sm:p-8 ${contact.primary ? "border-[#73ac84] ring-4 ring-[#e7f3ea]" : "border-[#dce8df]"}`}>
              {contact.primary ? <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-[#17643a] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white"><BadgeCheck className="size-3.5" /> Primary contact</span> : null}
              <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf6ed] text-[#17643a]"><UserRound className="size-5" /></span>
              <h2 className="mt-5 text-2xl font-black text-[#173c29]">{contact.name}</h2>
              <p className="mt-1 text-sm font-bold text-[#648071]">{contact.designation}</p>
              <div className="mt-6 space-y-3 border-t border-[#e3ece6] pt-5">
                {contact.phones.map((phone) => <a key={phone.href} href={`tel:${phone.href}`} className="flex items-center gap-3 text-sm font-extrabold text-[#17643a] hover:underline"><Phone className="size-4 shrink-0" />{phone.label}</a>)}
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 break-all text-sm font-semibold text-[#405a4b] hover:text-[#17643a] hover:underline"><Mail className="size-4 shrink-0" />{contact.email}</a>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-5 overflow-hidden rounded-[2rem] border border-[#dce8df] bg-white shadow-[0_10px_35px_rgba(21,65,42,.06)]" aria-labelledby="office-location-title">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4 sm:items-center">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf6ed] text-[#17643a]"><MapPin className="size-5" /></span>
              <div><h2 id="office-location-title" className="text-xs font-extrabold uppercase tracking-[.13em] text-[#73877a]">Office location</h2><p className="mt-1 text-sm font-bold leading-6 text-[#173c29]">{company.address}</p></div>
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

        <div className="mt-10 rounded-[2rem] bg-[#123f2a] p-7 text-white sm:flex sm:items-center sm:justify-between sm:p-10"><div><h2 className="text-2xl font-black">Request a business quotation</h2><p className="mt-2 text-sm leading-6 text-[#c9dfd1]">Send us your product quantities and delivery city for review.</p></div><Link href="/request-quote" className="commerce-button mt-6 inline-flex items-center justify-center border border-white bg-white text-[#15472f] sm:mt-0">Get a quote</Link></div>
      </div>
    </section>
  </>;
}
