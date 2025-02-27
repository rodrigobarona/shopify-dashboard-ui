import { type NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

export async function POST(request: NextRequest) {
  try {
    const shop = request.cookies.get("shopify_shop")?.value;

    if (!shop) {
      return NextResponse.json(
        { error: "No shop found in cookies" },
        { status: 401 }
      );
    }

    const sessionId = getSessionId(shop);
    const session = await sessionStorage.loadSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const body = await request.json();

    // Forward the request to Shopify GraphQL API
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (session.accessToken) {
      headers.set("X-Shopify-Access-Token", session.accessToken);
    }

    const response = await fetch(
      `https://${shop}/admin/api/${LATEST_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GraphQL proxy error:", error);
    return NextResponse.json(
      { error: "GraphQL request failed" },
      { status: 500 }
    );
  }
}
