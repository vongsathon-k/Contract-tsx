import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Handle root path
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/contacts", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect authenticated routes
  if (
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/contract") ||
    pathname.startsWith("/profile")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect logged-in users away from login
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/contacts", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/contacts/:path*",
    "/contract/:path*",
    "/profile/:path*",
    "/login",
  ],
};
