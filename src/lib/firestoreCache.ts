import { unstable_cache } from 'next/cache';
import { Timestamp } from './firebase';
import { getAllBrowseConfigs, getCustomSubjects, getNotifications, BrowseConfig, CustomSubjectDoc, Notification } from './firestore';

/** Clear all cached Firestore data. (Keep for backward compatibility) */
export function invalidateFirestoreCache(): void {
  // next/cache uses revalidateTag/revalidatePath on mutation.
}

// ─── Browse Configs ──────────────────────────────────────────────────────────

const getCachedBrowseConfigsSerialized = unstable_cache(
  async () => {
    return getAllBrowseConfigs();
  },
  ['browseConfigs'],
  {
    revalidate: 3600,
    tags: ['browseConfigs']
  }
);

export async function getCachedBrowseConfigs(): Promise<BrowseConfig[]> {
  try {
    return await getCachedBrowseConfigsSerialized();
  } catch (e) {
    console.error('Failed to get cached browse configs', e);
    return [];
  }
}

// ─── Custom Subjects ──────────────────────────────────────────────────────────

const getCachedCustomSubjectsSerialized = unstable_cache(
  async () => {
    const raw = await getCustomSubjects();
    return raw.map(s => ({
      ...s,
      createdAt: s.createdAt instanceof Timestamp 
        ? s.createdAt.toMillis() 
        : s.createdAt instanceof Date 
          ? s.createdAt.getTime() 
          : new Date(s.createdAt as any).getTime()
    }));
  },
  ['customSubjects'],
  {
    revalidate: 3600,
    tags: ['customSubjects']
  }
);

export async function getCachedCustomSubjects(): Promise<CustomSubjectDoc[]> {
  try {
    const serialized = await getCachedCustomSubjectsSerialized();
    return serialized.map(s => ({
      ...s,
      createdAt: new Date(s.createdAt)
    }));
  } catch (e) {
    console.error('Failed to get cached custom subjects', e);
    return [];
  }
}

// ─── Notifications ───────────────────────────────────────────────────────────

const getCachedNotificationsSerialized = (limitCount: number) => unstable_cache(
  async () => {
    const raw = await getNotifications(limitCount);
    return raw.map(n => ({
      ...n,
      createdAt: n.createdAt instanceof Timestamp 
        ? n.createdAt.toMillis() 
        : n.createdAt instanceof Date 
          ? n.createdAt.getTime() 
          : new Date(n.createdAt as any).getTime()
    }));
  },
  ['notifications', limitCount.toString()],
  {
    revalidate: 3600,
    tags: ['notifications']
  }
)();

export async function getCachedNotifications(limitCount = 20): Promise<Notification[]> {
  try {
    const serialized = await getCachedNotificationsSerialized(limitCount);
    return serialized.map(n => ({
      ...n,
      createdAt: new Date(n.createdAt)
    }));
  } catch (e) {
    console.error('Failed to get cached notifications', e);
    return [];
  }
}
