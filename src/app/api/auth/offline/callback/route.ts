import { type NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    // Complete offline OAuth process
    const callback = await shopify.auth.callback({
      rawRequest: request,
      rawResponse: new Response(),
    });

    const { session } = callback;

    // Store offline session
    await sessionStorage.storeSession(session);

    // Register webhooks with offline token
    try {
      await shopify.webhooks.register({ session });
      console.log("Webhooks registered with offline token");
    } catch (error) {
      console.error(`Failed to register webhooks: ${error}`);
    }

    const shop = new URL(session.shop).host;
    return NextResponse.redirect(
      new URL(`/api/auth?shop=${shop}`, request.url)
    );
  } catch (error) {
    console.error("Offline auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
