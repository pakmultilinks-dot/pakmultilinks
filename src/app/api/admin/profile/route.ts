import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  apiFailure,
  jsonError,
  noStoreHeaders,
  readJson,
  requireAdminRequest,
} from "@/app/api/_utils";
import { createSessionToken, hashPassword, sessionCookie } from "@/lib/auth";
import { requireDatabase, withDatabaseRetry } from "@/lib/db";

const profileInput = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter at least 2 characters.")
      .max(80, "Use 80 characters or fewer.")
      .refine(
        (value) => !/[\u0000-\u001f\u007f]/.test(value),
        "Name contains invalid characters.",
      ),
  })
  .strict();
const profileFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
} as const;

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminRequest(request);
    if (!session) return jsonError("Administrator access required.", 401);
    const profile = await withDatabaseRetry(() =>
      requireDatabase().user.findUnique({
        where:
          session.userId === "environment-admin"
            ? { email: session.email }
            : { id: session.userId },
        select: profileFields,
      }),
    );
    if (profile && (!profile.isActive || profile.role !== "ADMIN"))
      return jsonError("Administrator account is unavailable.", 403);
    return NextResponse.json(
      {
        profile: {
          name: profile?.name ?? session.name,
          email: profile?.email ?? session.email,
        },
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdminRequest(request);
    if (!session) return jsonError("Administrator access required.", 401);
    const parsed = profileInput.safeParse(await readJson(request, 2000));
    if (!parsed.success)
      return jsonError(
        parsed.error.issues[0]?.message || "Invalid profile.",
        400,
      );
    const database = requireDatabase();
    const existing = await withDatabaseRetry(() =>
      database.user.findUnique({
        where:
          session.userId === "environment-admin"
            ? { email: session.email }
            : { id: session.userId },
        select: profileFields,
      }),
    );
    if (existing && (!existing.isActive || existing.role !== "ADMIN"))
      return jsonError("Administrator account is unavailable.", 403);
    if (
      !existing &&
      (session.userId !== "environment-admin" ||
        session.email !== process.env.ADMIN_EMAIL?.trim().toLowerCase())
    )
      return jsonError("Administrator account not found.", 404);
    const profile = existing
      ? await withDatabaseRetry(() =>
          database.user.update({
            where: { id: existing.id },
            data: { name: parsed.data.name },
            select: profileFields,
          }),
        )
      : await database.user.create({
          data: {
            name: parsed.data.name,
            email: session.email,
            role: "ADMIN",
            passwordHash: await hashPassword(randomBytes(48).toString("hex")),
          },
          select: profileFields,
        });
    const token = await createSessionToken({
      userId: profile.id,
      name: profile.name,
      email: profile.email,
      role: "ADMIN",
    });
    const response = NextResponse.json(
      { profile: { name: profile.name, email: profile.email } },
      { headers: noStoreHeaders },
    );
    response.cookies.set(sessionCookie.name, token, sessionCookie.options);
    revalidatePath("/admin", "layout");
    return response;
  } catch (error) {
    return apiFailure(error);
  }
}
