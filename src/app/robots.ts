import type { MetadataRoute } from "next";
import { getSiteOrigin, isPublicSiteConfigured } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  if (!isPublicSiteConfigured()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/api", "/checkout", "/order-confirmation", "/login", "/register", "/forgot-password"] }], sitemap: `${origin}/sitemap.xml`, host: origin };
}
