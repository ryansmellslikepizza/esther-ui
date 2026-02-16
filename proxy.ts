
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Public pages (no auth required)
const PUBLIC = new Set([
  "/register",
  "/login",
]);

// Admin-only areas (customize these)
const ADMIN_ONLY_PREFIXES = [
  "/jobs",
  "/prompts", // example: gate prompts to admins
];

function isPublicPath(pathname: string) {
  if (PUBLIC.has(pathname)) return true;
  if (pathname.startsWith("/outputs")) return true;
  if (pathname.startsWith("/uploads")) return true;
  return false;
}

function isAdminOnlyPath(pathname: string) {
  return ADMIN_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let Next internals pass
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Read cookie token
  const token = req.cookies.get("token")?.value;

  // If no token, go to login with ?next=
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Verify JWT signature + expiration and read payload
  try {
    const secret = process.env.JWT_SECRET || "super-secret";
    const key = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, key);
    
    // ✅ Admin gate: if route is admin-only and user isn't admin, redirect to /not-admin
    const roles = Array.isArray(payload?.roles) ? payload.roles : [];
    const isPrivileged = roles.includes("admin") || roles.includes("super");
    
    if (isAdminOnlyPath(pathname) && !isPrivileged) {
      const url = req.nextUrl.clone();
      url.pathname = "/not-admin";
      url.searchParams.set("next", pathname);
      // return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // Invalid/expired token → clear cookie + redirect to login
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);

    const res = NextResponse.redirect(url);
    res.cookies.set("token", "", { path: "/", maxAge: 0 });
    return res;
  }
}

// Run middleware on everything except next internals/static
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
