// Import the Node.js adapter directly as a side effect
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-01";

// Make sure to load env variables
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecretKey = process.env.SHOPIFY_API_SECRET_KEY;
const scopes = process.env.SCOPES?.split(",") || ["read_products"];
const hostName = process.env.HOST?.replace(/https?:\/\//, "");

if (!apiKey || !apiSecretKey) {
  throw new Error("Missing Shopify API credentials");
}

// Initialize with required parameters
export const shopify = shopifyApi({
  apiKey,
  apiSecretKey,
  scopes,
  hostName: hostName || "localhost:3000",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  restResources,
  future: {
    // Enable new billing API with multiple line items per plan
    lineItemBilling: true,
    // Fix for CustomerAddress classes to use 'is_default' property
    customerAddressDefaultFix: true,
    // Support managed pricing without needing billing config
    unstable_managedPricingSupport: true,
  },
});

// Helper function to get session ID
export function getSessionId(shop: string) {
  return `offline_${shop}`;
}
