import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Vercel uses server-only secrets; local/Google hosts can keep using ADC.
export function adminApp() {
  const existing = getApps().find(app => app.name === 'security-server');
  if (existing) return existing;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (clientEmail || privateKey) {
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase server credential configuration is incomplete');
    }
    // Accept PEM with real newlines or the escaped newlines from service-account JSON.
    try {
      return initializeApp({ projectId, credential: cert({ projectId, clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }) }, 'security-server');
    } catch {
      // SDK errors can contain credential details; never propagate them to logs/responses.
      throw new Error('Firebase server credential configuration is invalid');
    }
  }
  return initializeApp({ credential: applicationDefault(), projectId }, 'security-server');
}
export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());
