import { Scissors } from "lucide-react";
import Image from "next/image";

import styles from "./trusted-partners.module.css";

const partners = [
  { name: "Lahore Garrison University", image: "/images/partners/lgu.png" },
  { name: "Ramay Clinic", image: "/images/partners/ramay-clinic.jpg" },
  { name: "Aroma Hair Salon", image: null },
];

export function TrustedPartners() {
  return (
    <section aria-labelledby="trusted-partners-title" className={styles.section}>
      <div className="site-shell">
        <div className={styles.heading}>
          <h2 id="trusted-partners-title">Our Trusted Partners</h2>
        </div>
        <div className={styles.viewport}>
          <div className={styles.track}>
            {[0, 1].map((copy) => (
              <ul key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined}>
                {partners.map((partner) => (
                  <li key={partner.name} className={styles.partner}>
                    <div className={styles.logo}>
                      {partner.image ? (
                        <Image src={partner.image} alt="" width={112} height={112} sizes="(max-width: 640px) 80px, 112px" className={styles.image} />
                      ) : (
                        <Scissors aria-hidden="true" className={styles.salonIcon} strokeWidth={1.25} />
                      )}
                    </div>
                    <p>{partner.name}</p>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
