import { type NextRequest, NextResponse } from "next/server";
import { getSessionId } from "./lib/shopify";
import { sessionStorage } from "./lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and login page
  if (
    pathname.startsWith("/api") ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get shop from query or cookies
  const searchParams = request.nextUrl.searchParams;
  const shop =
    searchParams.get("shop") || request.cookies.get("shopify_shop")?.value;

  if (!shop) {
    // Redirect to login if no shop
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if session exists
  const sessionId = getSessionId(shop);
  const session = await sessionStorage.loadSession(sessionId);

  if (!session) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL(`/login?shop=${shop}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
