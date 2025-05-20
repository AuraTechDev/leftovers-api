// Simple in-memory cache for frequently accessed images
export interface CacheEntry {
  data: unknown;
  timestamp: number;
}
