import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, PackageCheck, Search, UserRound } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { categoryArtwork, mobileCategories } from "@/lib/catalog-visuals";
import type { Category, Product } from "@/lib/types";

import styles from "./mobile-home-experience.module.css";

export function MobileHomeExperience({ products, categories }: { products: Product[]; categories: Category[] }) {
  const collections = mobileCategories(categories);
  const featured = [...products]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller)))
    .slice(0, 6);

  return (
    <div className={styles.home}>
      <div className={styles.welcome}>
        <Image src="/images/pak-multilinks-logo.png" alt="Pak Multilinks Hygiene" width={2039} height={771} sizes="150px" className={styles.logo} />
        <Link href="/account" className={`${styles.account} focus-ring`} aria-label="Your account"><UserRound size={21} strokeWidth={1.7} /></Link>
      </div>

      <form action="/shop" role="search" className={styles.search}>
        <Search size={20} aria-hidden="true" />
        <label htmlFor="mobile-home-search" className="sr-only">Search products</label>
        <input id="mobile-home-search" type="search" name="q" placeholder="Search your essentials" enterKeyHint="search" />
        <button type="submit" className="focus-ring" aria-label="Search catalog"><ArrowRight size={19} /></button>
      </form>

      <section className={styles.hero} aria-labelledby="mobile-home-title">
        <Image src="/images/hero-products-green.png" alt="" fill sizes="(max-width: 767px) 100vw, 1px" className={styles.heroImage} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Everyday, in good supply</p>
          <h1 id="mobile-home-title">Stock up.<br />Stress less.</h1>
          <p className={styles.heroDescription}>Hygiene essentials,<br />by the carton.</p>
          <Link href="/shop" className={`${styles.heroAction} focus-ring`}>Shop essentials <ArrowRight size={16} /></Link>
        </div>
      </section>

      {collections.length > 0 && <section className={styles.section} aria-labelledby="mobile-categories-title">
        <div className={styles.sectionHeading}>
          <h2 id="mobile-categories-title">Shop by category</h2>
          <Link href="/shop" className="focus-ring">See all <ChevronRight size={16} /></Link>
        </div>
        <div className={styles.categories}>
          {collections.map(category => (
            <Link href={`/shop/${category.slug}`} key={category.id} className={`${styles.category} focus-ring`}>
              <span className={styles.categoryImage}><Image src={categoryArtwork(category, products)} alt="" fill sizes="76px" className="object-contain p-2.5" /></span>
              <span>{category.name.replace(/ Wholesale$/, "")}</span>
            </Link>
          ))}
        </div>
      </section>}

      <section className={styles.section} aria-labelledby="mobile-products-title">
        <div className={styles.sectionHeading}>
          <h2 id="mobile-products-title">Everyday essentials</h2>
          <Link href="/shop" className="focus-ring">View all <ChevronRight size={16} /></Link>
        </div>
        {featured.length > 0 ? <div className={styles.products}>
          {featured.map(product => <ProductCard key={product.id} product={product} headingLevel="h3" />)}
        </div> : <div className={styles.empty}>
          <PackageCheck size={28} aria-hidden="true" />
          <p>Tell us what you need. We’ll help with your supply list.</p>
          <Link href="/request-quote" className="commerce-button commerce-button-primary">Request a quote</Link>
        </div>}
      </section>

      <Link href="/request-quote" className={`${styles.business} focus-ring`}>
        <span className={styles.businessIcon}><PackageCheck size={23} strokeWidth={1.6} /></span>
        <span><strong>Buying for your business?</strong><span>Send your list. Get a bulk quote.</span></span>
        <ArrowRight size={20} aria-hidden="true" />
      </Link>
    </div>
  );
}
