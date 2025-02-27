import { Session } from '@shopify/shopify-api';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const sessionStorage = {
  storeSession: async (session: Session) => {
    await redis.set(session.id, JSON.stringify(session));
    return true;
  },
  
  loadSession: async (id: string) => {
    const sessionData = await redis.get<string>(id);
    if (!sessionData) {
      return undefined;
    }
    
    const session = new Session(JSON.parse(sessionData));
    return session;
  },
  
  deleteSession: async (id: string) => {
    await redis.del(id);
    return true;
  },
}; 