import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { jsonError, noStoreHeaders } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) return jsonError("Authentication required.", 401);
  return NextResponse.json({ user: session }, { headers: noStoreHeaders });
}
