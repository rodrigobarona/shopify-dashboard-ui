import { type NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";
import { Session } from "@shopify/shopify-api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!shop || !code) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify the state matches what we stored in cookie
    const storedNonce = request.cookies.get("shopify_nonce")?.value;
    if (!storedNonce || storedNonce !== state) {
      return NextResponse.json(
        { error: "State verification failed" },
        { status: 403 }
      );
    }

    // Manually exchange the code for an access token
    const accessTokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET_KEY,
          code,
        }),
      }
    );

    const { access_token, scope } = await accessTokenResponse.json();

    if (!access_token) {
      throw new Error("Failed to get access token");
    }

    // Create a session using the Shopify API constructor
    const sessionId = `shop_${shop.replace(/[.]/g, "_")}`;
    const session = new Session({
      id: sessionId,
      shop,
      state,
      isOnline: false,
    });

    // Set access token and scope
    session.accessToken = access_token;
    session.scope = scope || process.env.SCOPES;

    console.log(`Created session with ID: ${sessionId}`);

    // Store session
    await sessionStorage.storeSession(session as Session);
    console.log(`Session stored with ID: ${session.id}, Shop: ${shop}`);

    // Create response with cookie
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("shopify_shop", shop, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    console.log(`Set shopify_shop cookie to: ${shop}`);

    // Register webhooks
    try {
      await shopify.webhooks.register({
        session,
      });

      console.log("Webhook registrations completed");
    } catch (error) {
      console.error(`Failed to register webhooks: ${error}`);
    }

    return response;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
