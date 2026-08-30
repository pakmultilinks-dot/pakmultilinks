import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, hashPassword, passwordMeetsPolicy, requestFingerprint } from "@/lib/auth";
import { requireDatabase } from "@/lib/db";
import { resetPasswordSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson } from "@/app/api/_utils";

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`reset:${requestFingerprint(request)}`, 6, 30 * 60_000);
  if (!rate.allowed) return jsonError("Too many reset attempts. Please try again later.", 429, { retryAfter: rate.retryAfter });
  try {
    const parsed = resetPasswordSchema.safeParse(await readJson(request, 4_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    if (!passwordMeetsPolicy(parsed.data.password)) {
      return jsonError("Use at least 10 characters with uppercase, lowercase, and a number.", 400);
    }
    const db = requireDatabase();
    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
    const reset = await db.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) return jsonError("This reset link is invalid or has expired.", 400);
    await db.$transaction([
      db.user.update({ where: { id: reset.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
      db.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      db.session.deleteMany({ where: { userId: reset.userId } }),
    ]);
    return NextResponse.json({ message: "Password updated. You can now sign in." }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
