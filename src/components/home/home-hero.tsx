import {
  ArrowRight, ArrowUpRight, Building2, Check, FileText, House,
  Leaf, SprayCan, Store, Trash2, Utensils,
} from "lucide-react";
import Link from "next/link";

import { HeroSlideshow } from "./hero-slideshow";
import styles from "./home-hero.module.css";

const destinations = [
  { icon: House, label: "Homes", href: "/shop" },
  { icon: Building2, label: "Offices", href: "/corporate-orders" },
  { icon: Store, label: "Shops", href: "/shop" },
  { icon: Utensils, label: "Restaurants", href: "/corporate-orders" },
];

const categories = [
  { icon: Leaf, title: "Hygiene products", note: "Tissues, paper & everyday care", href: "/shop/tissue-paper-products" },
  { icon: SprayCan, title: "Cleaning essentials", note: "A fresh start for every surface", href: "/shop/cleaning-products" },
  { icon: Trash2, title: "Waste management", note: "Bags & everyday disposables", href: "/shop/disposable-items" },
  { icon: Building2, title: "Facility supplies", note: "Bulk solutions for your business", href: "/corporate-orders" },
];

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className="site-shell">
        <div className={styles.main}>
          <div className={styles.copy} id="hero-content">
            <p className={styles.eyebrow}><span aria-hidden="true" />Your everyday hygiene partner</p>
            <h1 id="home-hero-title">Complete hygiene.<br /><span>For every workspace.</span></h1>
            <p className={styles.intro}>From tissues to total facility care, find the essentials that keep your spaces clean, comfortable, and ready for the day.</p>

            <div className={styles.actions}>
              <Link href="/shop" className={`${styles.button} ${styles.primary} focus-ring`}>Explore products<ArrowRight aria-hidden="true" /></Link>
              <Link href="/request-quote" className={`${styles.button} ${styles.secondary} focus-ring`}><FileText aria-hidden="true" />Get a bulk quote</Link>
            </div>

            <ul className={styles.trust} aria-label="Why choose Pak Multilinks Hygiene">
              {["Quality essentials", "Bulk order support", "Dedicated service"].map((benefit) => (
                <li key={benefit}><Check aria-hidden="true" />{benefit}</li>
              ))}
            </ul>

            <nav className={styles.workspaces} aria-label="Shop by workspace">
              <p>Made for your space</p>
              <div className={styles.destinations}>
                {destinations.map(({ icon: Icon, label, href }) => (
                  <Link key={label} href={href} className={`${styles.destination} focus-ring`}>
                    <Icon aria-hidden="true" /><span>{label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <HeroSlideshow />
        </div>

        <nav className={styles.categories} aria-label="Product ranges">
          {categories.map(({ icon: Icon, title, note, href }) => (
            <Link key={title} href={href} className={`${styles.category} focus-ring`}>
              <span className={styles.categoryIcon}><Icon aria-hidden="true" strokeWidth={1.7} /></span>
              <span className={styles.categoryCopy}><strong>{title}</strong><span>{note}</span></span>
              <ArrowUpRight className={styles.categoryArrow} aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
