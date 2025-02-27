import { registerWebhookHandler } from "../webhooks";

// Register product-related webhook handlers
registerWebhookHandler("products/create", async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`New product created: ${data.title}`);
  // Add your product creation logic here
});

registerWebhookHandler("products/update", async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`Product updated: ${data.title}`);
  // Add your product update logic here
});
