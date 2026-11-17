import { requireAppCheck } from '@/lib/server/security';
import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/server/firebase-admin';
import { requireUser, rateLimit, jsonBody, failure, HttpError, sameOrigin } from '@/lib/server/security';
function text(value: unknown, min: number, max: number): string {
 if (typeof value !== 'string' || value.trim().length < min || value.length > max) throw new HttpError(400, 'Invalid submission');
 return value.trim();
}
export async function POST(request: NextRequest) {
 try {
  sameOrigin(request);
  await requireAppCheck(request);
  const body = await jsonBody(request);
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Invalid submission');
  const db = adminDb();
  if (body.kind === 'contact') {
   // Global cap prevents forged proxy headers from bypassing the cost bound. Tune with monitoring.
   await rateLimit('contacts:global', 20);
   const name = text(body.name, 2, 100), email = text(body.email, 3, 254), message = text(body.message, 10, 2000);
   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Invalid email');
   await rateLimit(`contact:${email.toLowerCase()}`, 3, 3600000);
   const doc = await db.collection('contacts').add({ name, email, message, read: false, createdAt: FieldValue.serverTimestamp() });
   return NextResponse.json({ id: doc.id });
  }
  if (body.kind !== 'comment') throw new HttpError(400, 'Invalid submission');
  const user = await requireUser(request);
  await rateLimit(`comments:${user.uid}`, 5); await rateLimit('comments:global', 100);
  const postId = text(body.postId, 1, 128), content = text(body.content, 3, 1000);
  if (postId.includes('/')) throw new HttpError(400, 'Invalid post');
  const post = await db.collection('posts').doc(postId).get();
  if (!post.exists || post.data()?.status !== 'published') throw new HttpError(404, 'Post not found');
  const parentId = body.parentId == null ? null : text(body.parentId,1,128);
  if (parentId) {
   if (parentId.includes('/')) throw new HttpError(400, 'Invalid parent');
   const parent = await db.collection('comments').doc(parentId).get();
   if (!parent.exists || parent.data()?.postId !== postId) throw new HttpError(400, 'Invalid parent');
  }
  const doc = await db.collection('comments').add({ postId, content, parentId, userId: user.uid,
   authorName: typeof user.name === 'string' ? user.name.slice(0,100) : 'Anonymous', authorEmail: user.email || '',
   authorPhotoURL: typeof user.picture === 'string' && user.picture.startsWith('https://') ? user.picture : '', createdAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ id: doc.id });
 } catch (error) { return failure(error); }
}
export async function GET(request: NextRequest) {
 try {
  const postId = request.nextUrl.searchParams.get('postId') || '';
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(postId)) throw new HttpError(400, 'Invalid post');
  const db = adminDb();
  const post = await db.collection('posts').doc(postId).get();
  if (!post.exists || post.data()?.status !== 'published') throw new HttpError(404, 'Post not found');
  const snapshot = await db.collection('comments').where('postId', '==', postId).limit(500).get();
  // Explicit response shape also protects legacy documents containing email addresses.
  const comments = snapshot.docs.map(doc => {
   const d = doc.data(); return { id: doc.id, postId, content: d.content, parentId: d.parentId || null,
    authorName: d.authorName, authorPhotoURL: d.authorPhotoURL, userId: d.userId, createdAt: d.createdAt?.toDate().toISOString() };
  });
  return NextResponse.json({ comments }, { headers: { 'Cache-Control': 'public, max-age=15' } });
 } catch (error) { return failure(error); }
}
