# Production admin startup failure

The supplied Vercel logs confirm that firebase-admin/app-check crashed during module loading: jwks-rsa called require('jose') while native require(esm) was unavailable. Admin, session, media and PDF handlers failed before authentication ran.

The previous production build reproduced the same error and a 500 when started with Node's --no-experimental-require-module flag. The updated build passes eight HTTP checks under that same flag.

Fixes: pin Node 24.x in package metadata and bundle firebase-admin, jwks-rsa and jose through Next transpilePackages. No packages were downgraded and token verification/revocation checks remain enabled.

The live site redirects to https://www.abhyasmitra.in. Origin validation now explicitly accepts the operator-owned apex/www pair while rejecting other hosts, HTTP downgrades and alternate ports. Existing PDF filenames with spaces are accepted without opening private paths or traversal.

Validation: production build, TypeScript and focused ESLint passed; 3 credential tests and 16 emulator-backed security tests passed. Eight production-build HTTP checks passed with native require(esm) disabled. See login-fix-smoke.json and the build/test outputs.

Set NEXT_PUBLIC_SITE_URL=https://www.abhyasmitra.in in Vercel Production, and redeploy after editing environment variables. Valid server credentials and admin custom claims remain required. The previously disclosed private key must be rotated; it was not saved or used for this investigation. No Firebase rules were deployed or production data written. Real Google/admin login still requires the account owner's verification.
