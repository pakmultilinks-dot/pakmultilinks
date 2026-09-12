import { company } from "@/lib/company";

const localOrigin = "http://localhost:3000";
const productionOrigin = "https://www.pakmultilinks.com";

function normalizeOrigin(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

export function getSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return normalizeOrigin(configured);

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    const normalized = normalizeOrigin(vercelProduction);
    // Vercel's VERCEL_PROJECT_PRODUCTION_URL uses the .vercel.app subdomain.
    // Prefer the production custom domain when running on Vercel.
    if (normalized.includes(".vercel.app")) return productionOrigin;
    return normalized;
  }

  return localOrigin;
}

export function isPublicSiteConfigured() {
  const origin = getSiteOrigin();
  return !origin.includes("localhost") && !origin.includes("127.0.0.1");
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${getSiteOrigin()}/`).toString();
}

export function cleanDescription(value: string, fallback: string) {
  const clean = value.replace(/\s+/g, " ").trim() || fallback;
  return clean.length > 160 ? `${clean.slice(0, 157).trimEnd()}…` : clean;
}

export function breadcrumbStructuredData(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function localBusinessStructuredData() {
  const origin = getSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${origin}/#business`,
    name: company.name,
    alternateName: `${company.name} Corporate Supplies`,
    description: "Wholesale tissue, washroom and hygiene supplies for businesses and institutions in Lahore.",
    url: origin,
    logo: absoluteUrl("/images/pak-multilinks-logo.png"),
    image: absoluteUrl("/images/hero-products-green.png"),
    email: company.email,
    telephone: company.phoneHref,
    priceRange: "PKR",
    currenciesAccepted: "PKR",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop No LG-9, Rehman Tower, Main Market, Gulberg II",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    areaServed: { "@type": "City", name: "Lahore" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: company.phoneHref,
      email: company.email,
      contactType: "sales",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`,
  };
}

export function websiteStructuredData() {
  const origin = getSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: origin,
    name: company.name,
    alternateName: "Pak Multilinks",
    inLanguage: "en-PK",
    publisher: { "@id": `${origin}/#business` },
  };
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
