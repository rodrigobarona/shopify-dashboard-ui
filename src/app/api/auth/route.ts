import { type NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Validate shop
    const sanitizedShop = shopify.utils.sanitizeShop(shop);
    if (!sanitizedShop) {
      return NextResponse.json(
        { error: "Invalid shop domain" },
        { status: 400 }
      );
    }

    // Direct path without host (simpler approach)
    const callbackPath = "/api/auth/callback";

    // Use simpler parameters aligned with Shopify API expectations
    const authUrl = await shopify.auth.begin({
      shop: sanitizedShop,
      callbackPath,
      isOnline: true,
      rawRequest: request,
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Auth error details:", error);

    return NextResponse.json(
      {
        error: "Authentication process failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
