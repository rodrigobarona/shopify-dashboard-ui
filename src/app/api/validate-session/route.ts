import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Use Next.js cookies() helper instead of parsing from headers
    const cookieStore = await cookies();
    const shopCookie = cookieStore.get("shopify_shop")?.value;

    if (!shopCookie) {
      console.log("No shop cookie found");
      return NextResponse.json(
        { valid: false, error: "No shop cookie" },
        { status: 401 }
      );
    }

    const sessionId = getSessionId(shopCookie);
    console.log(`Validating session with ID: ${sessionId}`);

    const session = await sessionStorage.loadSession(sessionId);

    // Log the entire session for debugging
    console.log("Session data:", JSON.stringify(session || "No session found"));

    if (!session) {
      console.log(`No session found for ID: ${sessionId}`);
      return NextResponse.json(
        { valid: false, error: "No session found" },
        { status: 401 }
      );
    }

    if (!session.accessToken) {
      console.log(`Session found but no access token for ID: ${sessionId}`);
      return NextResponse.json(
        { valid: false, error: "No access token" },
        { status: 401 }
      );
    }

    console.log(`Session valid for shop: ${shopCookie}`);
    return NextResponse.json({ valid: true, shop: shopCookie });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { valid: false, error: String(error) },
      { status: 500 }
    );
  }
}
