import { NextResponse } from "next/server";
import { company } from "@/lib/company";
import { db, isDatabaseConfigured } from "@/lib/db";
import { serialize } from "@/app/api/_utils";

export async function GET() {
  const fallback = {
    businessName: company.name,
    subtitle: company.subtitle,
    tagline: company.tagline,
    logoUrl: null,
    phone: company.phone,
    email: company.email,
    address: company.address,
    whatsapp: company.whatsapp || null,
    currency: company.currency,
    deliveryInformation: "Delivery timing and charges are confirmed after order review.",
    announcement: null,
    homepageBannerUrl: null,
    bankTransferEnabled: process.env.ENABLE_BANK_TRANSFER === "true",
  };
  if (!isDatabaseConfigured) return NextResponse.json({ settings: fallback, demoMode: true }, { headers: { "Cache-Control": "public, max-age=60" } });
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "main" },
      select: { businessName: true, subtitle: true, tagline: true, logoUrl: true, phone: true, email: true, address: true, whatsapp: true, currency: true, deliveryInformation: true, announcement: true, homepageBannerUrl: true, bankTransferEnabled: true },
    });
    return NextResponse.json({ settings: serialize(settings || fallback), demoMode: false }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ settings: fallback, demoMode: true }, { headers: { "Cache-Control": "public, max-age=30" } });
  }
}
