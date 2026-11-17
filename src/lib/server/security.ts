import { getAppCheck } from 'firebase-admin/app-check';
import { adminApp, FirebaseServerConfigurationError } from './firebase-admin';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from './firebase-admin';
import { createHash } from 'node:crypto';
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function verifyToken(token: string) {
  if (!token || token.length > 8192) throw new HttpError(401, 'Authentication required');
  let auth;
  try { auth = adminAuth(); }
  catch (error) {
    const reason = error instanceof FirebaseServerConfigurationError ? error.reason : 'sdk_initialization_failed';
    console.error(JSON.stringify({ event: 'auth_verification_failed', stage: 'initialization', code: 'app/invalid-credential', reason }));
    throw new HttpError(503, 'Server sign-in is unavailable. Please contact the site owner.');
  }
  try { return await auth.verifyIdToken(token, true); }
  catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    const invalidTokenCodes = ['auth/argument-error', 'auth/invalid-argument', 'auth/invalid-id-token', 'auth/id-token-expired', 'auth/id-token-revoked', 'auth/user-disabled', 'auth/user-not-found', 'auth/tenant-id-mismatch', 'auth/mismatching-tenant-id'];
    const serviceCodes = ['app/invalid-credential', 'auth/invalid-credential', 'auth/insufficient-permission', 'auth/internal-error', 'auth/project-not-found', 'auth/certificate-fetch-failed', 'app/network-error'];
    const invalidToken = typeof code === 'string' && invalidTokenCodes.includes(code);
    // Only fixed SDK codes are logged. SDK messages can contain credentials or token claims.
    const projectMismatch = code === 'auth/argument-error' && error instanceof Error
      && (error.message.includes('incorrect "aud"') || error.message.includes('incorrect "iss"'));
    const safeCode = projectMismatch ? 'auth/project-mismatch'
      : typeof code === 'string' && (invalidToken || serviceCodes.includes(code)) ? code : 'unknown';
    console.error(JSON.stringify({ event: 'auth_verification_failed', stage: 'id_token_verification', code: safeCode }));
    if (invalidToken) throw new HttpError(401, 'Invalid or expired authentication');
    throw new HttpError(503, 'Server sign-in is unavailable. Please contact the site owner.');
  }
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
