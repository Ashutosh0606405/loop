import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

    // If authenticated user visits login/landing page, redirect to dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const isAuthPage = req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
        // Public pages don't require token
        if (isAuthPage) {
          return true;
        }
        // Protected pages require valid session token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/feedback/:path*",
    "/ask-loop/:path*",
    "/reports/:path*",
  ],
};
