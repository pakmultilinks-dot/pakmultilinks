import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, requestFingerprint } from "@/lib/auth";
import { db, isDatabaseConfigured } from "@/lib/db";
import { forgotPasswordSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson } from "@/app/api/_utils";

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`forgot:${requestFingerprint(request)}`, 4, 60 * 60_000);
  if (!rate.allowed) return jsonError("Too many reset requests. Please try again later.", 429, { retryAfter: rate.retryAfter });
  try {
    const parsed = forgotPasswordSchema.safeParse(await readJson(request, 2_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const deliveryWebhook = process.env.PASSWORD_RESET_WEBHOOK_URL;
    if (process.env.NODE_ENV === "production" && !deliveryWebhook) {
      return jsonError("Password reset email delivery is not configured. Please contact support.", 503, { code: "RESET_DELIVERY_UNAVAILABLE" });
    }
    let developmentResetToken: string | undefined;
    let deliveryPayload: { email: string; token: string; expiresInMinutes: number } | undefined;
    if (isDatabaseConfigured) {
      const user = await db.user.findUnique({ where: { email: parsed.data.email } });
      if (user) {
        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");
        await db.$transaction([
          db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
          db.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60_000) } }),
        ]);
        // A real deployment sends this token via its configured transactional email provider.
        if (process.env.NODE_ENV !== "production") developmentResetToken = token;
        if (deliveryWebhook) deliveryPayload = { email: parsed.data.email, token, expiresInMinutes: 30 };
      }
    }
    if (deliveryPayload && deliveryWebhook) {
      const deliveryResponse = await fetch(deliveryWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.PASSWORD_RESET_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.PASSWORD_RESET_WEBHOOK_SECRET}` } : {}),
        },
        body: JSON.stringify(deliveryPayload),
        signal: AbortSignal.timeout(8_000),
      });
      if (!deliveryResponse.ok) return jsonError("Password reset delivery is temporarily unavailable. Please try again later.", 502, { code: "RESET_DELIVERY_FAILED" });
    }
    return NextResponse.json(
      {
        message: "If an active account exists, password reset instructions will be sent.",
        ...(developmentResetToken ? { developmentResetToken } : {}),
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return apiFailure(error);
  }
}
