import type { NextRequest } from "next/server";
import { shopify } from "@/lib/shopify";
import { processWebhook } from "@/lib/webhooks";
// Import handlers to register them
import "@/lib/webhooks/products";
import "@/lib/webhooks/orders";

export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const rawBody = await request.text();

    // Process the webhook
    const { topic, shop, body } = await shopify.webhooks.process({
      rawBody,
      rawRequest: request,
      rawResponse: new Response(),
    });

    // Process the webhook with the appropriate handler
    const success = await processWebhook(topic, shop, body);

    return new Response(null, { status: success ? 200 : 422 });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new Response(null, { status: 500 });
  }
}

// Disable body parsing since we need the raw body for HMAC validation
export const config = {
  api: {
    bodyParser: false,
  },
};
