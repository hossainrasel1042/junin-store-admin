import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;

  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * 1. /api/ (Your API has its own RBAC permission middleware)
     * 2. /_next/static (Next.js internal static files like CSS/JS)
     * 3. /_next/image (Next.js image optimization route)
     * 4. /favicon.ico, /robots.txt (Public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
