import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nexcreator-production-jwt-secret-key-2026"
);

// Protected routes list
const PROTECTED_ROUTES = ["/dashboard", "/live", "/content", "/audience", "/settings", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const token = request.cookies.get("auth_session")?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch (e) {
      session = null;
    }
  }

  // 1. Check Admin Routes
  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = session.role === "admin" || session.isAdmin === true || session.email === "admin@nexcreator.com";
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  // 2. Unauthenticated users trying to access protected routes -> redirect to /login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated users trying to access auth pages (/login, /signup) -> redirect based on onboarding
  if ((pathname === "/login" || pathname === "/signup") && session) {
    if (session.onboardingCompleted === false) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/live/:path*",
    "/content/:path*",
    "/audience/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
