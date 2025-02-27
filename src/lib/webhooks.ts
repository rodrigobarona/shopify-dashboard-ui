// Type for webhook handlers
type WebhookHandler = (
  topic: string,
  shop: string,
  body: string
) => Promise<void>;

// Registry of webhook handlers
const webhookHandlers: Record<string, WebhookHandler> = {};

// Register a handler for a specific topic
export function registerWebhookHandler(topic: string, handler: WebhookHandler) {
  webhookHandlers[topic] = handler;
}

// Process a webhook with the appropriate handler
export async function processWebhook(
  topic: string,
  shop: string,
  body: string
) {
  console.log(`Processing webhook: ${topic} for shop ${shop}`);

  const handler = webhookHandlers[topic];
  if (handler) {
    try {
      await handler(topic, shop, body);
      return true;
    } catch (error) {
      console.error(`Error processing ${topic} webhook:`, error);
      return false;
    }
  } else {
    console.log(`No handler registered for webhook topic: ${topic}`);
    return false;
  }
}
