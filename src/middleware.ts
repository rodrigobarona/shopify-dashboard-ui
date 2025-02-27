import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip unnecessary paths
  if (
    pathname.startsWith("/api") ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get shop from cookie
  const shop = request.cookies.get("shopify_shop")?.value;

  if (!shop) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Simple check if we have a shop cookie
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Let the dashboard handle session validation
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
