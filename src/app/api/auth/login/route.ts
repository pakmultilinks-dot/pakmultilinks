import { NextResponse, type NextRequest } from "next/server";
import { authenticateCredentials, checkRateLimit, createSessionToken, requestFingerprint, sessionCookie } from "@/lib/auth";
import { loginSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson } from "@/app/api/_utils";

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`login:${requestFingerprint(request)}`, 8, 15 * 60_000);
  if (!rate.allowed) {
    return jsonError("Too many sign-in attempts. Please try again later.", 429, { retryAfter: rate.retryAfter });
  }
  try {
    const parsed = loginSchema.safeParse(await readJson(request, 4_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const session = await authenticateCredentials(parsed.data.email, parsed.data.password);
    if (!session) return jsonError("The email or password is incorrect.", 401);
    const token = await createSessionToken(session);
    const response = NextResponse.json({ user: session }, { headers: noStoreHeaders });
    response.cookies.set(sessionCookie.name, token, sessionCookie.options);
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
