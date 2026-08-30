import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";

export const AUTH_COOKIE = "pmh_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

export type AuthRole = "ADMIN" | "CUSTOMER";
export type AuthSession = {
  userId: string;
  email: string;
  name: string;
  role: AuthRole;
};

type AuthClaims = JWTPayload & {
  email: string;
  name: string;
  role: AuthRole;
};

function jwtSecret() {
  const configured = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (configured && configured.length >= 32) return new TextEncoder().encode(configured);
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to at least 32 characters in production.");
  }
  return new TextEncoder().encode("pmh-local-development-secret-change-me");
}

export async function createSessionToken(session: AuthSession) {
  return new SignJWT({
    email: session.email,
    name: session.name,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .setIssuer("pak-multilinks-hygiene")
    .setAudience("pak-multilinks-web")
    .sign(jwtSecret());
}

export async function verifySessionToken(token?: string | null): Promise<AuthSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecret(), {
      issuer: "pak-multilinks-hygiene",
      audience: "pak-multilinks-web",
      algorithms: ["HS256"],
    });
    const claims = payload as AuthClaims;
    if (!claims.sub || !claims.email || !claims.name) return null;
    if (claims.role !== "ADMIN" && claims.role !== "CUSTOMER") return null;
    return {
      userId: claims.sub,
      email: claims.email,
      name: claims.name,
      role: claims.role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(AUTH_COOKIE)?.value);
}

export async function getRequestSession(request: NextRequest) {
  return verifySessionToken(request.cookies.get(AUTH_COOKIE)?.value);
}

export async function requireAdminSession() {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
}

export const sessionCookie = {
  name: AUTH_COOKIE,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  },
};

export async function authenticateCredentials(email: string, password: string): Promise<AuthSession | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (adminEmail && normalizedEmail === adminEmail) {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    let matches = false;
    if (passwordHash) matches = await bcrypt.compare(password, passwordHash);
    else if (process.env.NODE_ENV !== "production" && process.env.ADMIN_PASSWORD) {
      // Development convenience only. Production never accepts a plain-text secret.
      matches = password === process.env.ADMIN_PASSWORD;
    }
    if (matches) {
      return { userId: "environment-admin", email: normalizedEmail, name: "Administrator", role: "ADMIN" };
    }
  }

  if (!isDatabaseConfigured) return null;
  const user = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (!user?.isActive || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return { userId: user.id, email: user.email, name: user.name, role: user.role };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function passwordMeetsPolicy(password: string) {
  return (
    password.length >= 10 &&
    password.length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

type LimitEntry = { count: number; resetAt: number };
const limiterStore = new Map<string, LimitEntry>();

/**
 * Process-local fixed-window limiter. Suitable as a second line of defence and
 * local development. Production should additionally apply a distributed limit
 * (for example at the reverse proxy or Redis/Upstash) across all instances.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (limiterStore.size >= 5_000) {
    for (const [entryKey, entry] of limiterStore) {
      if (entry.resetAt <= now) limiterStore.delete(entryKey);
    }
    if (limiterStore.size >= 5_000) {
      const oldestKey = limiterStore.keys().next().value as string | undefined;
      if (oldestKey) limiterStore.delete(oldestKey);
    }
  }
  const current = limiterStore.get(key);
  if (!current || current.resetAt <= now) {
    limiterStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }
  current.count += 1;
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function requestFingerprint(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
