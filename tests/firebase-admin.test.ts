import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { deleteApp } from 'firebase-admin/app';
import { adminApp } from '../src/lib/server/firebase-admin';

const names = ['FIREBASE_ADMIN_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'FIREBASE_ADMIN_CLIENT_EMAIL', 'FIREBASE_ADMIN_PRIVATE_KEY'] as const;
async function withEnvironment(values: Record<string, string>, run: () => Promise<void>) {
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
  for (const name of names) delete process.env[name];
  Object.assign(process.env, values);
  try { await run(); }
  finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
}
test('Partial server secrets fail closed instead of falling back to ADC', async () => {
  const cases: Record<string, string>[] = [
    { FIREBASE_ADMIN_CLIENT_EMAIL: 'test@example.invalid' },
    { FIREBASE_ADMIN_PROJECT_ID: 'demo-credentials', FIREBASE_ADMIN_PRIVATE_KEY: 'invalid-test-value' },
  ];
  for (const values of cases) {
    await withEnvironment(values, async () => {
      assert.throws(() => adminApp(), /^Error: Firebase server credential configuration is incomplete$/);
    });
  }
});
test('Malformed PEM produces a generic credential error', async () => {
  await withEnvironment({ FIREBASE_ADMIN_PROJECT_ID: 'demo-credentials', FIREBASE_ADMIN_CLIENT_EMAIL: 'test@example.invalid', FIREBASE_ADMIN_PRIVATE_KEY: 'invalid-test-value' }, async () => {
    assert.throws(() => adminApp(), /^Error: Firebase server credential configuration is invalid$/);
  });
});
test('Vercel credentials support literal and escaped PEM newlines and reuse the app', async () => {
  // Ephemeral test key generated in memory; no real credentials or network requests.
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
  for (const pem of [privateKey, privateKey.replace(/\n/g, '\\n')]) {
    await withEnvironment({ FIREBASE_ADMIN_PROJECT_ID: 'demo-credentials', FIREBASE_ADMIN_CLIENT_EMAIL: 'test@example.invalid', FIREBASE_ADMIN_PRIVATE_KEY: pem }, async () => {
      const app = adminApp();
      try { assert.equal(app.options.projectId, 'demo-credentials'); assert.equal(adminApp(), app); }
      finally { await deleteApp(app); }
    });
  }
});
