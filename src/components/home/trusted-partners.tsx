import { Scissors } from "lucide-react";
import Image from "next/image";

import styles from "./trusted-partners.module.css";

const partners = [
  { name: "Lahore Garrison University", image: "/images/partners/lgu.png" },
  { name: "IK Shinwari Restaurant", image: "/images/partners/ik-shinwari.jpg" },
  { name: "Ramay Clinic", image: "/images/partners/ramay-clinic.jpg" },
  { name: "Moon Banquet Hall", image: "/images/partners/moon-banquet-hall.png" },
  { name: "Aroma Hair Salon", image: null },
];

const retailPartners = [
  "Al Makkah Cash & Carry", "Chaudhary Super Store", "Elegant Store", "Mashallah Store",
  "Green Mart Super Store", "Drug Mart Pharmacy", "Home Pharmacy", "Sheikh Chaudhary General Store",
];

export function TrustedPartners() {
  return (
    <section aria-labelledby="trusted-partners-title" className={`${styles.section} animate-page-enter`}>
      <div className="site-shell">
        <header className={styles.heading}>
          <span>Businesses that choose Pak Multilinks</span>
          <h2 id="trusted-partners-title">Our Trusted Partners</h2>
          <p>Serving institutions, restaurants, healthcare teams and neighborhood retailers across Lahore.</p>
        </header>

        <ul className={styles.partnerGrid}>
          {partners.map((partner) => (
            <li key={partner.name} className={styles.partner}>
              <div className={styles.logo}>
                {partner.image ? (
                  <Image src={partner.image} alt={`${partner.name} logo`} width={112} height={112} unoptimized sizes="(max-width: 640px) 72px, 104px" className={styles.image} />
                ) : (
                  <Scissors aria-hidden="true" className={styles.salonIcon} strokeWidth={1.25} />
                )}
              </div>
              <p>{partner.name}</p>
            </li>
          ))}
        </ul>

        <div className={styles.retailPanel}>
          <div className={styles.retailCopy}>
            <span>Retail &amp; community network</span>
            <h3>Supplying trusted stores near you</h3>
            <p>Our wholesale hygiene and household products reach established supermarkets, general stores and pharmacies.</p>
          </div>
          <div className={styles.retailViewport} tabIndex={0} aria-label="Neighborhood retail partners">
            <div className={styles.retailImage}>
              <Image src="/images/partners/neighborhood-storefronts.webp" alt={`Storefronts of ${retailPartners.join(", ")}`} fill sizes="(max-width: 800px) 760px, 1200px" className={styles.storefronts} />
            </div>
          </div>
          <ul className="sr-only">
            {retailPartners.map((partner) => <li key={partner}>{partner}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
