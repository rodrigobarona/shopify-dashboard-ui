// Import the Node.js adapter directly as a side effect
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-01";

// Get host from environment or use a default for build time
const host = process.env.HOST || process.env.VERCEL_URL || "localhost:3000";

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY || "",
  scopes: (process.env.SCOPES || "").split(","),
  hostName: host.replace(/https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  restResources,
  logger: { level: 0 }, // Disable logging in production
  customShopifyDomains: [], // Add custom domains if needed
});

export function getSessionId(shop: string) {
  return `offline_${shop}`;
}
