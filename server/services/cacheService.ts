interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();

  // Get cached value or null if expired
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  // Set value with TTL in milliseconds (default 5 minutes)
  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  // Clear specific key or all
  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  // Request Deduplication (collapses multiple concurrent identical queries into 1)
  async deduplicate<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 300000): Promise<T> {
    // 1. Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 2. Check if a request for this key is already in flight
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    // 3. Execute fetcher and register in-flight promise
    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, ttlMs);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const globalCache = new CacheService();
