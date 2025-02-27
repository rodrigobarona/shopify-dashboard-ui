// Server Component (no "use client" directive)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionStorage } from "@/lib/session";
import { getSessionId } from "@/lib/shopify";
import DashboardClient from "./client";

export default async function DashboardPage() {
  const shop = (await cookies()).get("shopify_shop")?.value;

  if (!shop) {
    redirect("/login");
  }

  try {
    // Get session from our storage
    const sessionId = getSessionId(shop);
    const session = await sessionStorage.loadSession(sessionId);

    if (!session || !session.accessToken) {
      redirect(`/login?shop=${shop}`);
    }

    // Pass session data to client component
    return <DashboardClient session={session.toObject()} shop={shop} />;
  } catch (error) {
    console.error("Session error:", error);
    redirect(`/login?shop=${shop}`);
  }
}
