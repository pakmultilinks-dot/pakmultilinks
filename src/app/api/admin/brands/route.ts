import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { brandInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const brands = await requireDatabase().brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
    return NextResponse.json({ brands: serialize(brands) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = brandInputSchema.safeParse(await readJson(request, 8_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const data = parsed.data;
    const brand = await requireDatabase().brand.create({ data: { ...data, logoUrl: data.logoUrl || null } });
    revalidatePath("/");
    revalidatePath("/shop");
    return NextResponse.json({ brand: serialize(brand) }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
