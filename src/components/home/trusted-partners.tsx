import { ArrowUpRight, Handshake, Scissors } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const partners = [
  { name: "Lahore Garrison University", category: "Education", detail: "Lahore Garrison University", mark: "LGU", image: "/images/partners/lgu.png" },
  { name: "Ramay Clinic", category: "Healthcare", detail: "The Caring Specialists", mark: "Ramay Clinic", image: "/images/partners/ramay-clinic.jpg" },
  { name: "Aroma Hair Salon", category: "Hair & beauty", detail: "Hair Salon", mark: "Aroma", image: null },
];

export function TrustedPartners() {
  return (
    <section aria-labelledby="trusted-partners-title" className="border-y border-[#dce8df] bg-white py-14 sm:py-20">
      <div className="site-shell">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow"><Handshake className="size-4" aria-hidden="true" />Growing together</p>
            <h2 id="trusted-partners-title" className="mt-3 text-3xl font-black tracking-[-.04em] text-[#173c29] sm:text-4xl">Our Trusted Partners</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#66756c]">Everyday hygiene essentials for education, healthcare and hair care.</p>
          </div>
          <Link href="/corporate-orders" className="focus-ring inline-flex w-fit items-center gap-2 text-sm font-bold text-[#17643a]">Become a partner <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {partners.map((partner) => (
            <li key={partner.name} className="flex flex-col items-center rounded-2xl border border-[#e0e8e1] bg-[#fcfcf9] p-6 text-center sm:p-8">
              <div className="mb-5 grid size-28 place-items-center rounded-2xl bg-white p-2 sm:size-32">
                {partner.image ? <Image src={partner.image} alt={`${partner.name} logo`} width={128} height={128} sizes="128px" className="h-full w-full object-contain" /> : <Scissors aria-hidden="true" className="size-14 text-[#685081]" strokeWidth={1.25} />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#778479]">{partner.category}</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[#243e30]">{partner.mark}</h3>
                <p className="mt-1 text-xs leading-5 text-[#66756c]">{partner.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
