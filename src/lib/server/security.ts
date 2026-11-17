import { getAppCheck } from 'firebase-admin/app-check';
import { adminApp } from './firebase-admin';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from './firebase-admin';
import { createHash } from 'node:crypto';
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function verifyToken(token: string) {
  if (!token || token.length > 8192) throw new HttpError(401, 'Authentication required');
  try { return await adminAuth().verifyIdToken(token, true); }
  catch { throw new HttpError(401, 'Invalid or expired authentication'); }
}
export async function requireUser(request: Request) {
  const match = /^Bearer ([^\s]+)$/.exec(request.headers.get('authorization') || '');
  return verifyToken(match?.[1] || '');
}
export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  if (user.admin !== true) throw new HttpError(403, 'Administrator access required');
  return user;
}
export function sameOrigin(request: Request) {
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
  const allowed = new Set([expected]);
  const site = new URL(expected);
  // Both are operator-owned origins; Vercel redirects the apex to www.
  if (site.hostname === 'abhyasmitra.in' || site.hostname === 'www.abhyasmitra.in') {
    const alias = new URL(site);
    alias.hostname = site.hostname === 'abhyasmitra.in' ? 'www.abhyasmitra.in' : 'abhyasmitra.in';
    allowed.add(alias.origin);
  }
  if (!allowed.has(request.headers.get('origin') || '')) throw new HttpError(403, 'Invalid request origin');
}
export function failure(error: unknown) {
  if (error instanceof HttpError) {
    console.warn(JSON.stringify({ event: 'request_rejected', status: error.status }));
    return NextResponse.json({ error: error.message }, { status: error.status, headers: { 'Cache-Control': 'no-store' } });
  }
  console.error(JSON.stringify({ event: 'server_operation_failed' }));
  return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
}
export async function jsonBody(request: Request, max = 8192) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Missing body');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length;
    if (size > max) { await reader.cancel(); throw new HttpError(413, 'Request too large'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'Invalid JSON'); }
}
// Shared transaction counter survives restarts and works across instances; rules deny client access.
export async function rateLimit(key: string, maximum: number, period = 60000) {
  const ref = adminDb().collection('_securityRateLimits').doc(createHash('sha256').update(key).digest('hex'));
  const now = Date.now();
  await adminDb().runTransaction(async tx => {
    const data = (await tx.get(ref)).data();
    const active = data && data.resetAt > now;
    if (active && data.count >= maximum) throw new HttpError(429, 'Too many requests');
    tx.set(ref, { count: active ? data.count + 1 : 1, resetAt: active ? data.resetAt : now + period });
  });
}

export async function requireAppCheck(request: Request) {
 const token = request.headers.get('X-Firebase-AppCheck');
 if (!token && process.env.FIREBASE_APPCHECK_ENFORCE !== 'true') return;
 if (!token || token.length > 8192) throw new HttpError(403, 'App verification required');
 try { await getAppCheck(adminApp()).verifyToken(token); }
 catch { throw new HttpError(403, 'Invalid app verification'); }
}
