"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductDetailClient from "./client";
import type { SessionParams } from "@/types";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [session, setSession] = useState<SessionParams | null>(null);
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");

  useEffect(() => {
    // Safely decode the product ID
    if (params?.id) {
      setProductId(
        typeof params.id === "string"
          ? decodeURIComponent(params.id)
          : Array.isArray(params.id)
          ? decodeURIComponent(params.id[0])
          : ""
      );
    }

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
        console.error("Error loading product details:", error);
        router.replace("/login");
      }
    }

    validateAndLoad();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading product...</h2>
          <p>Preparing product details...</p>
        </div>
      </div>
    );
  }

  // Render the product detail client with the session data and product ID
  return session && productId ? (
    <ProductDetailClient session={session} shop={shop} productId={productId} />
  ) : (
    <div>Session data or product ID unavailable</div>
  );
}
