import { type NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";

export async function GET(request: NextRequest) {
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

    return NextResponse.json(session.toObject());
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
