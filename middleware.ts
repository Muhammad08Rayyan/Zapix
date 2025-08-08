import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect authenticated users from login pages to their dashboard
    if (pathname === "/login" && token) {
      if (token.role === "doctor") {
        return NextResponse.redirect(new URL("/doctor", req.url));
      }
    }

    if (pathname === "/admin/login" && token) {
      if (token.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // Admin routes protection - redirect to admin login if not authenticated
    if (pathname === "/admin" || (pathname.startsWith("/admin") && pathname !== "/admin/login")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // Doctor routes protection
    if (pathname.startsWith("/doctor") && token?.role !== "doctor") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public pages and login pages
        if (!pathname.startsWith("/admin") && !pathname.startsWith("/doctor")) {
          return true;
        }

        // Allow access to admin login page
        if (pathname === "/admin/login") {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*", "/login"],
};