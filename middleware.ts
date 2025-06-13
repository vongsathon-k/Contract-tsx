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

  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/contract", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/contract") || pathname.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);

      // ✅ Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId?.toString() || "");
      requestHeaders.set(
        "x-user-division",
        payload.divisionId?.toString() || ""
      );
      requestHeaders.set("x-user-role", payload.role?.toString() || "user");
      requestHeaders.set("x-username", payload.username?.toString() || "");
      requestHeaders.set("x-fullname", payload.fullname?.toString() || "");
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.log("❌ Token verification failed:", error);
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url)
      );
    }
  }

  if (pathname === "/login" && token) {
    // console.log("🔐 Admin route accessed:", pathname);
    return NextResponse.redirect(new URL("/contract", request.url));
  }

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

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId?.toString() || "");
      requestHeaders.set(
        "x-user-division",
        payload.divisionId?.toString() || ""
      );
      requestHeaders.set("x-user-role", payload.role?.toString() || "admin");
      requestHeaders.set("x-username", payload.username?.toString() || "");
      requestHeaders.set("x-fullname", payload.fullname?.toString() || "");
      //   console.log("✅ Admin access granted");
      return NextResponse.next();
    } catch (error) {
      //   console.log("❌ Token verification failed:", error);
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url)
      );
    }
  }

  if (
    pathname.startsWith("/api/contracts") ||
    pathname.startsWith("/api/admin")
  ) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);

      // ✅ Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId?.toString() || "");
      requestHeaders.set(
        "x-user-division",
        payload.divisionId?.toString() || ""
      );
      requestHeaders.set("x-user-role", payload.role?.toString() || "user");
      requestHeaders.set("x-username", payload.username?.toString() || "");
      requestHeaders.set("x-fullname", payload.fullname?.toString() || "");
      // ✅ Check admin permissions for admin API routes
      if (pathname.startsWith("/api/admin")) {
        if (payload.role !== "admin" && payload.role !== "super_admin") {
          return NextResponse.json(
            { success: false, error: "Insufficient permissions" },
            { status: 403 }
          );
        }
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
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
    "/api/contracts/:path*",
    "/api/admin/:path*",
  ],
};
