import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "pmh_session";

function secret() {
  const configured = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (configured && configured.length >= 32) return new TextEncoder().encode(configured);
  if (process.env.NODE_ENV === "production") return null;
  return new TextEncoder().encode("pmh-local-development-secret-change-me");
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/admin/login") return NextResponse.next();
  const jwtSecret = secret();
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (jwtSecret && token) {
    try {
      const { payload } = await jwtVerify(token, jwtSecret, {
        issuer: "pak-multilinks-hygiene",
        audience: "pak-multilinks-web",
        algorithms: ["HS256"],
      });
      if (payload.role === "ADMIN") return NextResponse.next();
    } catch {
      // Redirect below without disclosing token verification details.
    }
  }
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", path);
  const response = NextResponse.redirect(login);
  response.cookies.delete(AUTH_COOKIE);
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
