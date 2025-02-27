// Server Component (no "use client" directive)
import { getSessionId } from "@/lib/shopify";
import { sessionStorage } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardClient from "./client";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  // Get shop from cookies instead of search params
  const cookieStore = await cookies();
  const shop = cookieStore.get("shopify_shop")?.value;

  if (!shop) {
    redirect("/login");
  }

  // Get session
  const sessionId = getSessionId(shop);
  const session = await sessionStorage.loadSession(sessionId);

  if (!session || !session.accessToken) {
    redirect(`/login?shop=${shop}`);
  }

  // Pass session data to client component
  return <DashboardClient session={session.toObject()} shop={shop} />;
}
