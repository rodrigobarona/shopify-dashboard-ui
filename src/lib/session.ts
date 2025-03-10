import { Session } from "@shopify/shopify-api";
import { Redis } from "@upstash/redis";
import type { SessionParams } from "@/types";
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export const sessionStorage = {
  storeSession: async (session: Session) => {
    try {
      console.log(`Storing session for shop: ${session.shop}`);
      const sessionData = JSON.stringify(session.toObject());
      await redis.set(session.id, sessionData, { ex: 86400 * 30 });
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

      // Handle different potential response formats
      let sessionObj: SessionParams;
      if (typeof sessionData === "string") {
        sessionObj = JSON.parse(sessionData) as SessionParams;
      } else if (typeof sessionData === "object") {
        sessionObj = sessionData as SessionParams;
      } else {
        throw new Error(`Unexpected session data type: ${typeof sessionData}`);
      }

      return new Session(sessionObj);
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
