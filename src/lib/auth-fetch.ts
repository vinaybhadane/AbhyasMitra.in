import { appCheckHeaders } from './app-check';
import { auth } from './firebase';
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in required');
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(await appCheckHeaders())) headers.set(key, value);
  headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  return fetch(input, { ...init, headers });
}
