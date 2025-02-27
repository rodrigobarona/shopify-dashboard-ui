"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductsClient from "./client";
import type { SessionParams } from "@/types";

export default function ProductsPage() {
  const [session, setSession] = useState<SessionParams | null>(null);
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function validateAndLoad() {
      try {
        // First validate the session
        const validationResponse = await fetch("/api/validate-session");
        const validationData = await validationResponse.json();

        if (!validationData.valid) {
          console.error("Session validation failed:", validationData.error);
          router.replace("/login");
          return;
        }

        // Then get the session data
        const sessionResponse = await fetch("/api/session");
        const sessionData = await sessionResponse.json();

        if (sessionData.session) {
          setSession(sessionData.session);
          setShop(sessionData.shop);
          setLoading(false);
        } else {
          console.error("Could not load session data");
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error loading products:", error);
        router.replace("/login");
      }
    }

    validateAndLoad();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading products...</h2>
          <p>Preparing your Shopify product data...</p>
        </div>
      </div>
    );
  }

  // Render the products client with the session data
  return session ? (
    <ProductsClient session={session} shop={shop} />
  ) : (
    <div>Session data unavailable</div>
  );
}
