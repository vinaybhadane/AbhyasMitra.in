import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryDocumentSnapshot,
  Timestamp,
} from './firebase';
import { Post, Comment, ContactMessage, SubjectUnit } from './types';
import { calculateReadingTime } from './seo';
import slugify from 'slugify';

/** Strip HTML tags and count words */
export function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').filter(Boolean).length : 0;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

/**
 * Creates a post. Pass `customSlugSuffix` (just the post part, not subject/) to override auto-slug.
 * Slug format is always: subject-slug/post-slug
 */
export async function createPost(
  data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'readingTime' | 'slug' | 'wordCount'>,
  customSlugSuffix?: string
): Promise<string> {
  const subjectSlug = slugify(data.subject, { lower: true, strict: true });
  const postPart = customSlugSuffix
    ? slugify(customSlugSuffix, { lower: true, strict: true })
    : slugify(data.title, { lower: true, strict: true });
  const slug = `${subjectSlug}/${postPart}`;
  const readingTime = calculateReadingTime(data.content);
  const wordCount = countWords(data.content);
  const docRef = await addDoc(collection(db, 'posts'), {
    ...data,
    slug,
    readingTime,
    wordCount,
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Updates a post. Pass `customSlugSuffix` (post part only) to override the slug post-part.
 * If title or subject changes and no custom suffix, slug is auto-regenerated.
 */
export async function updatePost(
  id: string,
  data: Partial<Post>,
  customSlugSuffix?: string
): Promise<void> {
  const postRef = doc(db, 'posts', id);
  const updates: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };

  if (data.title || data.subject || customSlugSuffix !== undefined) {
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const currentData = snap.data() as Post;
      const finalSubject = data.subject || currentData.subject;
      const finalTitle = data.title || currentData.title;
      const subjectSlug = slugify(finalSubject, { lower: true, strict: true });
      const postPart = customSlugSuffix !== undefined && customSlugSuffix !== ''
        ? slugify(customSlugSuffix, { lower: true, strict: true })
        : slugify(finalTitle, { lower: true, strict: true });
      updates.slug = `${subjectSlug}/${postPart}`;
    }
  }

  if (data.content) {
    updates.readingTime = calculateReadingTime(data.content);
    updates.wordCount = countWords(data.content);
  }
  await updateDoc(postRef, updates);
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', id));
}

export async function getPost(id: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, 'posts', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Post;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(collection(db, 'posts'), where('slug', '==', slug), where('status', '==', 'published'), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
     // Fallback for old slugs which didn't include the subject
     const slugParts = slug.split('/');
     const titleSlug = slugParts.length > 1 ? slugParts[slugParts.length - 1] : slug;
     const oldQ = query(collection(db, 'posts'), where('slug', '==', titleSlug), where('status', '==', 'published'), limit(1));
     const oldSnap = await getDocs(oldQ);
     if (oldSnap.empty) return null;
     const docSnap = oldSnap.docs[0];
     return { id: docSnap.id, ...docSnap.data() } as Post;
  }
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Post;
}

export async function getPublishedPosts(limitCount = 10, lastDoc?: QueryDocumentSnapshot): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    collection(db, 'posts'),
    where('status', '==', 'published'),
    orderBy('publishDate', 'desc'),
    limit(limitCount)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snap = await getDocs(q);
  
  const publishedPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { posts: publishedPosts, lastDoc: newLastDoc };
}

export async function getPostsBySubject(subject: string, limitCount = 10): Promise<Post[]> {
  const q = query(
    collection(db, 'posts'),
    where('subject', '==', subject),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  
  return posts
    .sort((a, b) => {
      const aTime = a.publishDate instanceof Timestamp ? a.publishDate.toMillis() : (a.publishDate as Date).getTime();
      const bTime = b.publishDate instanceof Timestamp ? b.publishDate.toMillis() : (b.publishDate as Date).getTime();
      return bTime - aTime;
    })
    .slice(0, limitCount);
}

export async function getAllPosts(): Promise<Post[]> {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'published'),
    orderBy('publishDate', 'desc')
  );
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  const term = searchTerm.toLowerCase();
  
  return all.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.tags.some((t) => t.toLowerCase().includes(term)) ||
      p.subject.toLowerCase().includes(term) ||
      p.excerpt.toLowerCase().includes(term)
  );
}

export async function getRelatedPosts(subject: string, currentId: string, limitCount = 3): Promise<Post[]> {
  const q = query(
    collection(db, 'posts'),
    where('subject', '==', subject),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  
  return posts
    .filter(p => p.id !== currentId)
    .sort((a, b) => {
      const aTime = a.publishDate instanceof Timestamp ? a.publishDate.toMillis() : (a.publishDate as Date).getTime();
      const bTime = b.publishDate instanceof Timestamp ? b.publishDate.toMillis() : (b.publishDate as Date).getTime();
      return bTime - aTime;
    })
    .slice(0, limitCount);
}

export async function incrementPostViews(id: string): Promise<void> {
  const postRef = doc(db, 'posts', id);
  const snap = await getDoc(postRef);
  if (snap.exists()) {
    await updateDoc(postRef, { views: (snap.data().views || 0) + 1 });
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function addComment(data: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'comments'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  // Avoid composite index by sorting in memory
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId)
  );
  const snap = await getDocs(q);
  const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
  
  return comments.sort((a, b) => {
    const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : (a.createdAt as any).getTime?.() || new Date(a.createdAt as any).getTime();
    const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : (b.createdAt as any).getTime?.() || new Date(b.createdAt as any).getTime();
    return aTime - bTime;
  });
}

export async function deleteComment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'comments', id));
}

export async function getAllComments(): Promise<Comment[]> {
  const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
}

// ─── Contact Messages ─────────────────────────────────────────────────────────

export async function submitContactMessage(data: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'contacts'), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage));
}

export async function markMessageRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'contacts', id), { read: true });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contacts', id));
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function uploadImage(file: File, path: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  const response = await fetch('/api/media', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload to Azure');
  }

  const data = await response.json();
  return data.url;
}

export async function deleteImage(url: string): Promise<void> {
  const response = await fetch(`/api/media?url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete from Azure');
  }
}

// ─── Subject Units ────────────────────────────────────────────────────────────

export async function getUnitsBySubject(subjectSlug: string): Promise<SubjectUnit[]> {
  const q = query(collection(db, 'units'), where('subjectSlug', '==', subjectSlug));
  const snap = await getDocs(q);
  const units = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubjectUnit));
  return units.sort((a, b) => a.order - b.order);
}

export async function createUnit(data: Omit<SubjectUnit, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'units'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateUnit(id: string, data: Partial<SubjectUnit>): Promise<void> {
  await updateDoc(doc(db, 'units', id), data);
}

export async function deleteUnit(id: string): Promise<void> {
  await deleteDoc(doc(db, 'units', id));
}

// ─── Browse Config (bgImageUrl per branch / year / subject) ───────────────────

export interface BrowseConfig {
  id: string;       // e.g. 'computer', 'computer/2nd', 'computer/2nd/database-management-system'
  bgImageUrl?: string;
}

export async function getBrowseConfig(id: string): Promise<BrowseConfig | null> {
  const snap = await getDoc(doc(db, 'browseConfig', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as BrowseConfig;
}

export async function getAllBrowseConfigs(): Promise<BrowseConfig[]> {
  const snap = await getDocs(collection(db, 'browseConfig'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as BrowseConfig));
}

export async function setBrowseConfig(id: string, data: Partial<BrowseConfig>): Promise<void> {
  await updateDoc(doc(db, 'browseConfig', id), data).catch(async () => {
    // If doc doesn't exist yet, create it
    await addDoc(collection(db, 'browseConfig'), { id, ...data });
  });
}

export async function upsertBrowseConfig(id: string, bgImageUrl: string): Promise<void> {
  const docRef = doc(db, 'browseConfig', id);
  await setDoc(docRef, { bgImageUrl }, { merge: true });
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  content: string;
  link?: string;
  createdAt: Date | Timestamp;
}

export async function getNotifications(limitCount = 20): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'units'),
      where('type', '==', 'notification')
    );
    const snap = await getDocs(q);
    const notifs = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
      } as Notification;
    });

    // Sort client-side by createdAt descending
    return notifs
      .sort((a, b) => {
        const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as any).getTime();
        const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as any).getTime();
        return bTime - aTime;
      })
      .slice(0, limitCount);
  } catch (e) {
    console.error('Failed to get notifications', e);
    return [];
  }
}

export async function createNotification(title: string, content: string, link?: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'units'), {
    title,
    content,
    link: link || '',
    type: 'notification',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, 'units', id));
}

// ─── Custom Subjects ─────────────────────────────────────────────────────────

export interface CustomSubjectDoc {
  id: string;
  name: string;
  slug: string;
  year: '1st' | '2nd' | '3rd' | '4th';
  branch: string;       // e.g. "computer", "it"
  semester: string;     // e.g. "sem3", "sem4" (matches the semId)
  semesterLabel: string; // e.g. "SE Comp Sem 4"
  description: string;
  iconName: string;     // e.g. "BookOpen", "Cpu"
  color: string;        // e.g. "from-blue-600 to-cyan-600"
  iconColor: string;    // e.g. "#2563eb"
  bannerUrl?: string;
  createdAt: Date | Timestamp;
}

export async function getCustomSubjects(): Promise<CustomSubjectDoc[]> {
  try {
    const q = query(collection(db, 'subjects'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
      } as CustomSubjectDoc;
    });
  } catch (e) {
    console.error('Failed to fetch custom subjects', e);
    return [];
  }
}

export async function createCustomSubject(data: Omit<CustomSubjectDoc, 'id' | 'createdAt'>): Promise<string> {
  // 1. Add subject document to subjects collection
  const docRef = await addDoc(collection(db, 'subjects'), {
    ...data,
    createdAt: serverTimestamp(),
  });

  // 2. If a banner URL is provided, automatically register it in the configs collection
  // so the homepage / subject listings render the banner image automatically
  if (data.bannerUrl) {
    // Config ID format: [branch]/[semester]/[subjectSlug]
    const configId = `${data.branch}/${data.semester}/${data.slug}`;
    await setDoc(doc(db, 'configs', configId), {
      id: configId,
      bgImageUrl: data.bannerUrl,
      updatedAt: serverTimestamp(),
    });
  }

  return docRef.id;
}

export async function deleteCustomSubject(id: string, branch: string, semester: string, slug: string): Promise<void> {
  // 1. Delete subject document
  await deleteDoc(doc(db, 'subjects', id));

  // 2. Delete corresponding browse config banner if it exists
  const configId = `${branch}/${semester}/${slug}`;
  try {
    await deleteDoc(doc(db, 'configs', configId));
  } catch {}
}

