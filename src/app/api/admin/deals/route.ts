import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";
import { requireDatabase } from "@/lib/db";
import { dealBannerInputSchema, validationError } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const deals = await requireDatabase().dealBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    return NextResponse.json({ deals: serialize(deals) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = dealBannerInputSchema.safeParse(await readJson(request, 12_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const data = parsed.data;
    const deal = await requireDatabase().dealBanner.create({
      data: { ...data, alt: data.alt || null, linkUrl: data.linkUrl || "/shop" },
    });
    revalidatePath("/");
    return NextResponse.json({ deal: serialize(deal) }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
