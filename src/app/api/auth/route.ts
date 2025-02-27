import { type NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import crypto from "node:crypto";

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

    // Build redirect URL directly instead of using auth.begin
    const reqHost = request.headers.get("host") || "localhost:3000";
    const protocol = reqHost.includes("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${reqHost}/api/auth/callback`;

    // Manually construct the authorization URL
    const nonce = crypto.randomBytes(16).toString("hex");
    const authUrl = `https://${sanitizedShop}/admin/oauth/authorize?client_id=${
      process.env.SHOPIFY_API_KEY
    }&scope=${process.env.SCOPES}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${nonce}`;

    // Store the nonce in session cookie for verification
    const response = NextResponse.redirect(authUrl);
    response.cookies.set("shopify_nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
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

// Specify Node.js runtime
export const runtime = "nodejs";
