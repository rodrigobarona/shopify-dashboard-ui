import { type NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Begin offline auth flow (false = offline token)
  const authUrl = await shopify.auth.begin({
    shop,
    callbackPath: "/api/auth/offline/callback",
    isOnline: false,
    rawRequest: request,
  });

  return NextResponse.redirect(authUrl);
}
