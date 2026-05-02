import {
  db,
  storage,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  QueryDocumentSnapshot,
  Timestamp,
} from './firebase';
import { Post, Comment, ContactMessage } from './types';
import { calculateReadingTime } from './seo';
import slugify from 'slugify';

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'readingTime' | 'slug'>): Promise<string> {
  const slug = slugify(data.title, { lower: true, strict: true });
  const readingTime = calculateReadingTime(data.content);
  const docRef = await addDoc(collection(db, 'posts'), {
    ...data,
    slug,
    readingTime,
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePost(id: string, data: Partial<Post>): Promise<void> {
  const postRef = doc(db, 'posts', id);
  const updates: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
  if (data.title) {
    updates.slug = slugify(data.title, { lower: true, strict: true });
  }
  if (data.content) {
    updates.readingTime = calculateReadingTime(data.content);
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
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Post;
}

export async function getPublishedPosts(limitCount = 10, lastDoc?: QueryDocumentSnapshot): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot | null }> {
  // To avoid composite index requirements, we fetch ordered by date and filter in JS
  let q = query(
    collection(db, 'posts'),
    orderBy('publishDate', 'desc'),
    limit(limitCount * 3) // Fetch extra to account for drafts
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snap = await getDocs(q);
  
  const allPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  const publishedPosts = allPosts.filter(p => p.status === 'published').slice(0, limitCount);
  
  const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { posts: publishedPosts, lastDoc: newLastDoc };
}

export async function getPostsBySubject(subject: string, limitCount = 10): Promise<Post[]> {
  // Avoid composite index: fetch by subject, filter/sort in memory
  const q = query(
    collection(db, 'posts'),
    where('subject', '==', subject)
  );
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  
  return posts
    .filter(p => p.status === 'published')
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
  // Fetch all and filter client-side to avoid full-text search / composite indexes
  const q = query(collection(db, 'posts'), orderBy('publishDate', 'desc'));
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  const term = searchTerm.toLowerCase();
  
  return all.filter(
    (p) =>
      p.status === 'published' &&
      (p.title.toLowerCase().includes(term) ||
      p.tags.some((t) => t.toLowerCase().includes(term)) ||
      p.subject.toLowerCase().includes(term) ||
      p.excerpt.toLowerCase().includes(term))
  );
}

export async function getRelatedPosts(subject: string, currentId: string, limitCount = 3): Promise<Post[]> {
  const q = query(
    collection(db, 'posts'),
    where('subject', '==', subject)
  );
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  
  return posts
    .filter(p => p.status === 'published' && p.id !== currentId)
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
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(url: string): Promise<void> {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}
