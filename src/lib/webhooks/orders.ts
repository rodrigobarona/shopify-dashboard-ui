import { registerWebhookHandler } from "../webhooks";

// Register order-related webhook handlers
registerWebhookHandler("orders/create", async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`New order created: ${data.order_number || data.id}`);
  // Add your order creation logic here
});

registerWebhookHandler("orders/updated", async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`Order updated: ${data.order_number || data.id}`);
  // Add your order update logic here
});

registerWebhookHandler("orders/cancelled", async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`Order cancelled: ${data.order_number || data.id}`);
  // Add your order cancellation logic here
});

registerWebhookHandler("orders/fulfilled", async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`Order fulfilled: ${data.order_number || data.id}`);
  // Add your order fulfillment logic here
});
