import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export class FirebaseServerConfigurationError extends Error {
  readonly code = 'app/invalid-credential';
  constructor(message: string, readonly reason: 'credentials_incomplete' | 'credentials_malformed' | 'project_mismatch') {
    super(message);
  }
}

function normalizePrivateKey(value: string): string {
  let key = value.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
}

// Vercel uses server-only secrets; local/Google hosts can keep using ADC.
export function adminApp() {
  const existing = getApps().find(app => app.name === 'security-server');
  if (existing) return existing;

  const projectId = (process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();
  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (projectId && clientProjectId && projectId !== clientProjectId) {
    throw new FirebaseServerConfigurationError('Firebase server and client projects do not match', 'project_mismatch');
  }
  if (clientEmail || privateKey) {
    if (!projectId || !clientEmail || !privateKey) {
      throw new FirebaseServerConfigurationError('Firebase server credential configuration is incomplete', 'credentials_incomplete');
    }
    // Accept PEM with real newlines or the escaped newlines from service-account JSON.
    try {
      return initializeApp({ projectId, credential: cert({ projectId, clientEmail,
        privateKey: normalizePrivateKey(privateKey),
      }) }, 'security-server');
    } catch {
      // SDK errors can contain credential details; never propagate them to logs/responses.
      throw new FirebaseServerConfigurationError('Firebase server credential configuration is invalid', 'credentials_malformed');
    }
  }
  return initializeApp({ credential: applicationDefault(), projectId }, 'security-server');
}
export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());
