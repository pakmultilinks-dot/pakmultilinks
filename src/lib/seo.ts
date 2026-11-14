import { company } from "@/lib/company";

const localOrigin = "http://localhost:3000";
const productionOrigin = "https://www.pakmultilinks.com";

function normalizeOrigin(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

export function getSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const normalized = normalizeOrigin(configured);
    // If configured URL points to a Vercel preview subdomain, use the production custom domain.
    if (normalized.includes(".vercel.app")) return productionOrigin;
    return normalized;
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    const normalized = normalizeOrigin(vercelProduction);
    // Vercel's VERCEL_PROJECT_PRODUCTION_URL uses the .vercel.app subdomain.
    // Prefer the production custom domain when running on Vercel.
    if (normalized.includes(".vercel.app")) return productionOrigin;
    return normalized;
  }

  // Production fallback: if running in a non-localhost environment (e.g. Vercel),
  // use the production domain even when env vars are missing.
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV === "production") return productionOrigin;

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
    "@type": ["Organization", "LocalBusiness", "WholesaleStore"],
    "@id": `${origin}/#business`,
    name: company.name,
    legalName: "Pak Multilinks Hygiene",
    alternateName: [
      "Pak Multilinks",
      "Pak Multilinks Corporate Supplies",
      "Pak Multilinks Hygiene Lahore",
    ],
    description: "Wholesale tissue, washroom and hygiene supplies for businesses, offices, and institutions in Lahore.",
    url: origin,
    logo: absoluteUrl("/images/pak-multilinks-logo.png"),
    image: absoluteUrl("/images/hero-products-green.png"),
    email: company.email,
    telephone: company.phoneHref,
    priceRange: "PKR",
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash on Delivery, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop No LG-9, Rehman Tower, Main Market, Gulberg II",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      postalCode: "54000",
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.5204,
      longitude: 74.3587,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Lahore" },
      { "@type": "Country", name: "Pakistan" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: company.phoneHref,
      email: company.email,
      contactType: "wholesale sales & corporate supply",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    sameAs: [
      "https://www.linkedin.com/company/pakmultilinks",
      "https://www.facebook.com/pakmultilinks",
      "https://www.instagram.com/pakmultilinks",
      "https://wa.me/923258166829",
    ],
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function rootGraphStructuredData() {
  const business = localBusinessStructuredData();
  const website = websiteStructuredData();

  // Strip separate contexts when nesting inside @graph
  const businessBody = { ...business } as Record<string, unknown>;
  delete businessBody["@context"];

  const websiteBody = { ...website } as Record<string, unknown>;
  delete websiteBody["@context"];

  return {
    "@context": "https://schema.org",
    "@graph": [businessBody, websiteBody],
  };
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
