import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
const [projectId, uid, expectedEmail, action] = process.argv.slice(2);
if (!projectId || !uid || !expectedEmail || !['grant','revoke','check'].includes(action)) {
 throw new Error('Usage: node scripts/admin-role.mjs PROJECT_ID UID EXPECTED_EMAIL grant|revoke|check');
}
const auth = getAuth(initializeApp({ credential: applicationDefault(), projectId }));
const user = await auth.getUser(uid);
if (user.email !== expectedEmail || !user.emailVerified || user.disabled) throw new Error('Account identity / verified email / enabled status mismatch');
if (action !== 'check') {
 const claims = { ...user.customClaims };
 if (action === 'grant') claims.admin = true; else delete claims.admin;
 await auth.setCustomUserClaims(uid, claims);
 if (action === 'revoke') await auth.revokeRefreshTokens(uid);
}
const verified = await auth.getUser(uid);
console.log(JSON.stringify({ uid, admin: verified.customClaims?.admin === true, action }));
