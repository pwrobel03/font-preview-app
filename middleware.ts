import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  // If accessing any /admin/* route while not authenticated → redirect to login
  if (!req.auth && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // If already logged in and hitting the login page → redirect to admin home
  if (req.auth && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/fonts", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Only run middleware on /admin/* routes
  matcher: ["/admin/:path*"],
};
