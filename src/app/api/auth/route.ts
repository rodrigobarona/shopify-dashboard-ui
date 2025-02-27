import { type NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json(
        { error: "Missing shop parameter" },
        { status: 400 }
      );
    }

    // Validate the shop domain
    const sanitizedShop = shopify.utils.sanitizeShop(shop);
    if (!sanitizedShop) {
      return NextResponse.json(
        { error: "Invalid shop domain" },
        { status: 400 }
      );
    }

    // Build auth URL - use path only, not full URL
    const authPath = "/api/auth/callback";

    // Begin OAuth process with proper parameters
    const authUrl = await shopify.auth.begin({
      shop: sanitizedShop,
      callbackPath: authPath,
      isOnline: false,
      rawRequest: request,
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication process failed" },
      { status: 500 }
    );
  }
}
