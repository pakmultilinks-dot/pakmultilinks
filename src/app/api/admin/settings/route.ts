import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { settingsInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const settings = await requireDatabase().siteSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } });
    return NextResponse.json({ settings: serialize(settings) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = settingsInputSchema.safeParse(await readJson(request, 32_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const data = parsed.data;
    const settings = await requireDatabase().siteSettings.upsert({
      where: { id: "main" },
      update: {
        ...data,
        logoUrl: data.logoUrl || null,
        whatsapp: data.whatsapp || null,
        deliveryInformation: data.deliveryInformation || null,
        announcement: data.announcement || null,
        homepageBannerUrl: data.homepageBannerUrl || null,
        facebookUrl: data.facebookUrl || null,
        instagramUrl: data.instagramUrl || null,
        linkedinUrl: data.linkedinUrl || null,
      },
      create: {
        id: "main",
        ...data,
        logoUrl: data.logoUrl || null,
        whatsapp: data.whatsapp || null,
        deliveryInformation: data.deliveryInformation || null,
        announcement: data.announcement || null,
        homepageBannerUrl: data.homepageBannerUrl || null,
        facebookUrl: data.facebookUrl || null,
        instagramUrl: data.instagramUrl || null,
        linkedinUrl: data.linkedinUrl || null,
      },
    });
    return NextResponse.json({ settings: serialize(settings) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
