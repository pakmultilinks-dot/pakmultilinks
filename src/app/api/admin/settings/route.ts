import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { settingsInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";
import { deleteBlobs } from "@/lib/blob";

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
    const database = requireDatabase();
    const existing = await database.siteSettings.findUnique({
      where: { id: "main" },
      select: { logoUrl: true, homepageBannerUrl: true },
    });
    const settings = await database.siteSettings.upsert({
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
    // Clean up old Vercel Blob images that were replaced
    const urlsToClean: string[] = [];
    if (existing?.logoUrl && existing.logoUrl !== settings.logoUrl) urlsToClean.push(existing.logoUrl);
    if (existing?.homepageBannerUrl && existing.homepageBannerUrl !== settings.homepageBannerUrl) urlsToClean.push(existing.homepageBannerUrl);
    if (urlsToClean.length > 0) await deleteBlobs(urlsToClean);
    revalidatePath("/");
    return NextResponse.json({ settings: serialize(settings) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
