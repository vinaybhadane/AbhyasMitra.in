import { getAllBrowseConfigs, getCustomSubjects, getNotifications, BrowseConfig, CustomSubjectDoc, Notification } from './firestore';

// ─── In-Memory Server-Side Cache ─────────────────────────────────────────────
// This cache lives in the Node.js server process. All ISR revalidations within
// the same process share this cached data, so instead of N pages × Q queries,
// we only hit Firestore once per collection per TTL window.

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/** Clear all cached Firestore data. Call this when admin writes happen. */
export function invalidateFirestoreCache(): void {
  cache.clear();
}

// ─── Cached Data Functions ────────────────────────────────────────────────────

export async function getCachedBrowseConfigs(): Promise<BrowseConfig[]> {
  const KEY = 'browseConfigs';
  const cached = getCached<BrowseConfig[]>(KEY);
  if (cached) return cached;

  const data = await getAllBrowseConfigs();
  setCache(KEY, data);
  return data;
}

export async function getCachedCustomSubjects(): Promise<CustomSubjectDoc[]> {
  const KEY = 'customSubjects';
  const cached = getCached<CustomSubjectDoc[]>(KEY);
  if (cached) return cached;

  const data = await getCustomSubjects();
  setCache(KEY, data);
  return data;
}

export async function getCachedNotifications(limitCount = 20): Promise<Notification[]> {
  const KEY = `notifications_${limitCount}`;
  const cached = getCached<Notification[]>(KEY);
  if (cached) return cached;

  const data = await getNotifications(limitCount);
  setCache(KEY, data);
  return data;
}
