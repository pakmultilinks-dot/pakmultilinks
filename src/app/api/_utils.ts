import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getRequestSession } from "@/lib/auth";
import { DatabaseUnavailableError } from "@/lib/db";

export const noStoreHeaders = { "Cache-Control": "no-store" };

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status, headers: noStoreHeaders });
}

export function databaseUnavailable() {
  return jsonError("Persistent database storage is not configured for this deployment.", 503, {
    code: "DATABASE_UNAVAILABLE",
    demoMode: true,
  });
}

export async function requireAdminRequest(request: NextRequest) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite === "cross-site") return null;
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) return null;
  }
  const session = await getRequestSession(request);
  return session?.role === "ADMIN" ? session : null;
}

export async function readJson(request: NextRequest, maxBytes = 32_000): Promise<unknown> {
  const length = Number(request.headers.get("content-length") || "0");
  if (length > maxBytes) throw new PayloadTooLargeError();
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new PayloadTooLargeError();
  try {
    return JSON.parse(raw);
  } catch {
    throw new InvalidJsonError();
  }
}

export class PayloadTooLargeError extends Error {}
export class InvalidJsonError extends Error {}

export function apiFailure(error: unknown) {
  if (error instanceof PayloadTooLargeError) return jsonError("Request is too large.", 413);
  if (error instanceof InvalidJsonError) return jsonError("Request body must be valid JSON.", 400);
  if (error instanceof DatabaseUnavailableError) return databaseUnavailable();
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return jsonError("A record with that email, SKU, or slug already exists.", 409);
  }
  console.error("API request failed", error);
  return jsonError("The request could not be completed.", 500);
}

export function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, item) => {
      if (item instanceof Prisma.Decimal) return item.toString();
      return item;
    }),
  ) as T;
}

export function pagination(request: NextRequest, maximum = 100) {
  const page = Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10) || 1);
  const take = Math.min(maximum, Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("limit") || "25", 10) || 25));
  return { page, take, skip: (page - 1) * take };
}
