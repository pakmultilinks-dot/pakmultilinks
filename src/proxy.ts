import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "pmh_session";

// Maintenance mode: set to true to take the whole site down and show the
// maintenance page on every route. Set to false to bring the site back.
// Nothing is deleted by this flag; it only changes what visitors see.
const MAINTENANCE_MODE = false;

const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Temporarily down for maintenance | Pak Multilinks</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 24px; }
  .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); max-width: 520px; width: 100%; padding: 48px 40px; text-align: center; }
  .mark { width: 72px; height: 72px; border-radius: 50%; background: #15803d; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; letter-spacing: 0.5px; margin: 0 auto 24px; }
  .brand { font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #15803d; margin: 0 0 12px; }
  h1 { font-size: 28px; line-height: 1.25; margin: 0 0 12px; font-weight: 800; }
  p { font-size: 16px; line-height: 1.6; color: #64748b; margin: 0; }
  .note { margin-top: 24px; font-size: 13px; color: #94a3b8; }
</style>
</head>
<body>
  <main class="card">
    <div class="mark">PM</div>
    <p class="brand">Pak Multilinks</p>
    <h1>We&rsquo;ll be back soon</h1>
    <p>This website is temporarily down for maintenance. Please check back soon.</p>
    <p class="note">Thank you for your patience.</p>
  </main>
</body>
</html>`;

function secret() {
  const configured = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (configured && configured.length >= 32) return new TextEncoder().encode(configured);
  if (process.env.NODE_ENV === "production") {
    console.error("AUTH_SECRET must be set to at least 32 characters in production.");
    return null;
  }
  return new TextEncoder().encode("pmh-local-development-secret-change-me");
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Maintenance mode: every visitor sees the maintenance page, with a 503
  // status so search engines treat the outage as temporary.
  if (MAINTENANCE_MODE) {
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "3600",
        "Cache-Control": "no-store",
      },
    });
  }

  // Admin area guard: only /admin routes are protected.
  if (!path.startsWith("/admin")) return NextResponse.next();
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

export const config = {
  matcher: [
    // All routes except Next.js static assets, image optimization, and
    // metadata files. API routes are covered, so the whole site is down.
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
