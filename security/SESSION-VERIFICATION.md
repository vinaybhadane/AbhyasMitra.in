# Session verification diagnostics

The intended administrator was checked through the trusted Admin SDK: the exact verified/enabled account has admin=true. The production client bundle uses project abhyasmitra-in and auth domain abhyasmitra-in.firebaseapp.com. The user reports a 401 on authenticated session creation; its exact SDK cause has not yet been observed.

Previously verifyToken converted every SDK error, including server credential errors, into 401. It now returns 401 only for recognized rejected-token/account conditions, and 503 for unavailable server credentials, permissions or verification services. Revocation checking remains enabled. Authorization and cookie controls are unchanged.

Operator-only logs contain the fixed event auth_verification_failed, a stage and an allowlisted code/reason. They exclude SDK error messages, tokens and credentials. No diagnostic or promotion endpoint was introduced.

Configuration now rejects mismatched server/client Firebase projects and normalizes quoted PEM, real newlines and escaped LF/CRLF. It does not replace or rotate any key.

After this deployment, reproduce sign-in and inspect the new Vercel log:

| Log code/reason | Action |
|---|---|
| initialization / credentials_incomplete | Set all FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in Vercel Production, then redeploy |
| initialization / credentials_malformed | Copy the complete private_key value from the correct service-account JSON into the private-key Secret, then redeploy |
| initialization / project_mismatch or auth/project-mismatch | Match Firebase Admin project, public project and public API-key configuration to abhyasmitra-in |
| auth/insufficient-permission | Correct the runtime service account's Firebase Authentication read permissions |
| app/invalid-credential during id_token_verification | Verify the deployed key is valid and matches its service-account email; review Google credential/OAuth configuration without logging the key |
| auth/id-token-expired or auth/id-token-revoked | Sign out and sign in again |
| auth/certificate-fetch-failed or app/network-error | Review server connectivity and retry |

Validation: 4 credential tests, 17 emulator-backed security tests, TypeScript, focused ESLint and production build passed. Tests verify that backend failures return generic 503 responses, rejected tokens remain 401, normal users remain forbidden, and logs omit sensitive SDK messages/unrecognized codes. A real authenticated login still requires the owner to retry after deployment. Changes are diagnostic/format handling, not proof that Vercel's unknown credential configuration has been repaired.
