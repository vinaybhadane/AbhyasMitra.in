import { requireAppCheck } from '@/lib/server/security';
import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/server/firebase-admin';
import { failure, HttpError, jsonBody, rateLimit, sameOrigin } from '@/lib/server/security';
export async function POST(request: NextRequest) {
 try {
  sameOrigin(request);
  await requireAppCheck(request);
  const body = await jsonBody(request, 512);
  const id = body?.id;
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new HttpError(400, 'Invalid post');
  await rateLimit('views:global', 300); await rateLimit(`views:${id}`, 60);
  const db = adminDb(); const ref = db.collection('posts').doc(id);
  await db.runTransaction(async tx => {
   const post = await tx.get(ref);
   if (!post.exists || post.data()?.status !== 'published') throw new HttpError(404, 'Post not found');
   tx.update(ref, { views: FieldValue.increment(1) });
  });
  return NextResponse.json({ success: true });
 } catch (error) { return failure(error); }
}
