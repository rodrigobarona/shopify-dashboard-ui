import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const shopCookie = cookieStore.get("shopify_shop")?.value;

    if (!shopCookie) {
      return NextResponse.json(
        { error: "No shop cookie found" },
        { status: 401 }
      );
    }

    const sessionId = getSessionId(shopCookie);
    const session = await sessionStorage.loadSession(sessionId);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Return the session data securely
    return NextResponse.json({
      shop: shopCookie,
      session: session.toObject(),
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}
