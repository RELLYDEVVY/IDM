interface RateLimitData {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitData>();

interface RateLimitArgs {
  key: string;
  limit: number;
  windowMs: number;
}

export function rateLimit({ key, limit, windowMs }: RateLimitArgs) {
  const now = Date.now();
  const record = store.get(key);

  if (!record || record.resetTime < now) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  store.set(key, record);
  
  return { success: true, remaining: limit - record.count, resetIn: record.resetTime - now };
}

export const RATE_LIMIT_CONFIGS = {
  LOGIN_LIMIT: { limit: 5, windowMs: 15 * 60 * 1000 },
  API_LIMIT: { limit: 100, windowMs: 60 * 1000 },
  RESET_LIMIT: { limit: 3, windowMs: 60 * 60 * 1000 },
};

export async function checkRateLimit(ip: string, action: string, limit: number, windowSeconds: number): Promise<boolean> {
  const result = rateLimit({ key: `${action}:${ip}`, limit, windowMs: windowSeconds * 1000 });
  return result.success;
}
