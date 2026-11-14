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
      </div>
    </section>
  );
}
