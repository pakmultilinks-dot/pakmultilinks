import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, createSessionToken, hashPassword, passwordMeetsPolicy, requestFingerprint, sessionCookie } from "@/lib/auth";
import { requireDatabase } from "@/lib/db";
import { registerSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson } from "@/app/api/_utils";

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`register:${requestFingerprint(request)}`, 5, 60 * 60_000);
  if (!rate.allowed) return jsonError("Too many registration attempts. Please try again later.", 429, { retryAfter: rate.retryAfter });
  try {
    const parsed = registerSchema.safeParse(await readJson(request, 6_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    if (!passwordMeetsPolicy(parsed.data.password)) {
      return jsonError("Use at least 10 characters with uppercase, lowercase, and a number.", 400);
    }
    const db = requireDatabase();
    let user;
    try {
      user = await db.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          passwordHash: await hashPassword(parsed.data.password),
        },
        select: { id: true, name: true, email: true, role: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return jsonError("An account with this email already exists. Please sign in or reset your password.", 409);
      }
      throw error;
    }
    const session = { userId: user.id, name: user.name, email: user.email, role: user.role };
    const response = NextResponse.json({ user: session }, { status: 201, headers: noStoreHeaders });
    response.cookies.set(sessionCookie.name, await createSessionToken(session), sessionCookie.options);
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
