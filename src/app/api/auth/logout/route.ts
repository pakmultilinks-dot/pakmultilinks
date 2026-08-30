import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/auth";
import { noStoreHeaders } from "@/app/api/_utils";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  response.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
  return response;
}
