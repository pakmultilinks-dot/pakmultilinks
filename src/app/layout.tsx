import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { RouteShell } from "@/components/layout/route-shell";
import { company } from "@/lib/company";
import { getSiteOrigin, isPublicSiteConfigured, localBusinessStructuredData, safeJsonLd, websiteStructuredData } from "@/lib/seo";

import "./globals.css";

const origin = getSiteOrigin();
const publicSite = isPublicSiteConfigured();
const defaultDescription = "Wholesale tissue, washroom and hygiene supplies by carton for offices, institutions and commercial customers in Lahore.";

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: { default: `Wholesale Hygiene Supplies Lahore | ${company.name}`, template: `%s | ${company.name}` },
  description: defaultDescription,
  applicationName: company.name,
  authors: [{ name: company.name, url: origin }],
  creator: company.name,
  publisher: company.name,
  category: "Business supplies",
  referrer: "origin-when-cross-origin",
  formatDetection: { address: false, email: false, telephone: false },
  openGraph: { title: company.name, description: defaultDescription, type: "website", locale: "en_PK", siteName: company.name, url: origin },
  twitter: { card: "summary_large_image", title: company.name, description: defaultDescription },
  robots: publicSite
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
    : { index: false, follow: false, noarchive: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      ...(process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : {}),
      ...(process.env.FACEBOOK_DOMAIN_VERIFICATION ? { "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION } : {}),
    },
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#114b2f" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = [localBusinessStructuredData(), websiteStructuredData()];
  return <html lang="en-PK" data-scroll-behavior="smooth"><body><RouteShell>{children}</RouteShell><Script id="site-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} /><GoogleAnalytics /></body></html>;
}
