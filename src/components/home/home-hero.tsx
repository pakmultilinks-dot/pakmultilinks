import {
  ArrowRight, Building2, Check, FileText, Headphones, House,
  Leaf, ShieldCheck, ShoppingCart, Sparkles, SprayCan, Store,
  Trash2, Truck, Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const destinations = [
  { icon: House, label: "For Home", href: "/shop" },
  { icon: Building2, label: "For Office", href: "/corporate-orders" },
  { icon: Store, label: "For Shop", href: "/shop" },
  { icon: Utensils, label: "For Restaurant", href: "/corporate-orders" },
];

const trustItems = [
  { icon: ShieldCheck, title: "Trusted", note: "Brands" },
  { icon: Sparkles, title: "High Quality", note: "Products" },
  { icon: Truck, title: "Fast & Reliable", note: "Delivery" },
  { icon: Headphones, title: "Dedicated", note: "Support", href: "/contact" },
];

const categories = [
  { icon: Leaf, title: "Hygiene Products", note: "Tissues, Dispensers & More", href: "/shop/tissue-paper-products" },
  { icon: SprayCan, title: "Cleaning Essentials", note: "For a Cleaner Environment", href: "/shop/cleaning-products" },
  { icon: Trash2, title: "Waste Management", note: "Bins, Bags & Solutions", href: "/shop/disposable-items" },
  { icon: Building2, title: "Facility Supplies", note: "For Offices, Schools & Restaurants", href: "/corporate-orders" },
];

export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-image" aria-hidden="true">
        <Image src="/images/hero-prototype-background.webp" alt="" fill preload sizes="100vw" />
      </div>
      <div className="home-hero-wash" aria-hidden="true" />

      <header className="home-hero-header">
        <nav className="home-hero-destinations" aria-label="Shop by workspace">
          {destinations.map(({ icon: Icon, label, href }) => (
            <Link key={label} href={href} className="home-hero-destination focus-ring">
              <span className="home-hero-destination-icon"><Icon aria-hidden="true" strokeWidth={2.6} /></span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </header>

      <div className="home-hero-copy" id="hero-content">
        <p className="home-hero-eyebrow">Cleaner Spaces <span aria-hidden="true">|</span> Healthier People</p>
        <h1 id="home-hero-title">Complete Hygiene<br />Solutions for<br /><span>Every Workspace</span></h1>
        <p className="home-hero-intro">From tissues to total facility care, we supply the<br className="home-hero-desktop-break" /> essentials that keep your spaces clean, safe,<br className="home-hero-desktop-break" /> and ready every day.</p>

        <ul className="home-hero-trust" aria-label="Why choose Pak Multilinks Hygiene">
          {trustItems.map(({ icon: Icon, title, note, href }) => {
            const content = <><span className="home-hero-trust-icon"><Icon aria-hidden="true" /></span><span><strong>{title}</strong><span>{note}</span></span></>;
            return <li key={title}>{href ? <Link href={href} className="home-hero-trust-item focus-ring">{content}</Link> : <div className="home-hero-trust-item">{content}</div>}</li>;
          })}
        </ul>

        <div className="home-hero-actions">
          <Link href="/shop" className="home-hero-button home-hero-button-primary focus-ring"><ShoppingCart aria-hidden="true" />Shop Now<ArrowRight aria-hidden="true" /></Link>
          <Link href="/request-quote" className="home-hero-button home-hero-button-secondary focus-ring"><FileText aria-hidden="true" />Get a Bulk Quote</Link>
        </div>
      </div>

      <p className="home-hero-motto">A Cleaner<span>Today</span>A Healthier<span>Tomorrow</span></p>
      <ul className="home-hero-benefits" aria-label="Our commitment">
        {["Quality Products", "Competitive Prices", "Bulk Supply", "Nationwide Delivery"].map((benefit) => (
          <li key={benefit}><span><Check aria-hidden="true" strokeWidth={3.5} /></span>{benefit}</li>
        ))}
      </ul>

      <nav className="home-hero-categories" aria-label="Product ranges">
        {categories.map(({ icon: Icon, title, note, href }) => (
          <Link key={title} href={href} className="home-hero-category focus-ring">
            <Icon aria-hidden="true" strokeWidth={1.8} />
            <span><strong>{title}</strong><span>{note}</span></span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
