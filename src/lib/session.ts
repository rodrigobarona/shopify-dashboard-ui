import type { Session } from "@shopify/shopify-api";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export const sessionStorage = {
  storeSession: async (session: Session) => {
    try {
      console.log(`Storing session for shop: ${session.shop}`);
      await redis.set(session.id, JSON.stringify(session), { ex: 86400 * 30 });
      console.log(`Session stored successfully with ID: ${session.id}`);
      return true;
    } catch (error) {
      console.error("Session storage error:", error);
      return false;
    }
  },

  loadSession: async (id: string) => {
    try {
      console.log(`Loading session with ID: ${id}`);
      const sessionData = await redis.get(id);

      if (!sessionData) {
        console.log(`No session found with ID: ${id}`);
        return undefined;
      }

      console.log(`Session loaded successfully for ID: ${id}`);
      return JSON.parse(String(sessionData)) as Session;
    } catch (error) {
      console.error("Session loading error:", error);
      return undefined;
    }
  },

  deleteSession: async (id: string) => {
    try {
      await redis.del(id);
      console.log(`Session deleted: ${id}`);
      return true;
    } catch (error) {
      console.error("Session deletion error:", error);
      return false;
    }
  },
};
