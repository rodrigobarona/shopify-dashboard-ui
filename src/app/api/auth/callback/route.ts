import { type NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";

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

    // Complete OAuth process
    const callback = await shopify.auth.callback({
      rawRequest: request,
      rawResponse: new Response(),
    });

    const { session } = callback;

    // Store session
    await sessionStorage.storeSession(session);

    // Create response with cookie
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("shopify_shop", shop, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Register webhooks using bulk registration
    try {
      const webhookRegistrations = await shopify.webhooks.register({
        session,
      });

      // Log results for each webhook registration
      for (const [topic, results] of Object.entries(webhookRegistrations)) {
        if (Array.isArray(results) && results.length > 0) {
          // Handle array of results
          for (const result of results) {
            console.log(`Webhook registration for ${topic}:`, result);
          }
        } else {
          console.log(`No registration results for ${topic}`);
        }
      }

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
