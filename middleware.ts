import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  //   console.log("🔍 Middleware Debug:", {
  //     pathname,
  //     hasToken: !!token,
  //     tokenValue: token ? token.substring(0, 20) + "..." : "none",
  //   });

  // Handle root path
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/contract", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect authenticated routes
  if (pathname.startsWith("/contract") || pathname.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect logged-in users away from login
  if (pathname === "/login" && token) {
    // console.log("🔐 Admin route accessed:", pathname);
    return NextResponse.redirect(new URL("/contract", request.url));
  }

  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      //   console.log("❌ No token found, redirecting to login");
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url)
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);

      // ✅ Check if user has admin role
      if (payload.role !== "admin" && payload.role !== "super_admin") {
        // console.log("❌ Insufficient permissions. User role:", payload.role);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      //   console.log("✅ Admin access granted");
      return NextResponse.next();
    } catch (error) {
      //   console.log("❌ Token verification failed:", error);
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/contract/:path*",
    "/profile/:path*",
    "/login",
    "/admin/:path*",
  ],
};
