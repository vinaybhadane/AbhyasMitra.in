# Staged deployment and administrator migration

These changes are local only. Do not release this application with the old public-submission rules: those rules would permit bypassing the new API rate limits. Do not release claims-only rules before existing legitimate administrators have claims. No claims or production rules were changed by this audit.

## 1. Provision server identity in an isolated staging project

Use Node >=24.12 (current machine is 24.7, which produces Firebase transitive engine warnings), Java 21 for emulators, and a Next.js Node server host. `firebase.json` currently describes static `out` hosting; that configuration cannot execute these route handlers. Keep your existing Next-compatible host or configure Firebase App Hosting separately. Do not deploy this project as an SPA/static export.

Set server-only `FIREBASE_ADMIN_PROJECT_ID` to the same project as `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. Prefer workload identity/Application Default Credentials. For local/staging access set `GOOGLE_APPLICATION_CREDENTIALS` to an external service-account JSON path, outside this repository; never store the JSON in NEXT_PUBLIC variables. Give runtime identity Firestore data access and Firebase Authentication user-read permission (revocation verification calls getUser), not permission to assign claims. Claim assignment belongs only to a separate trusted operator. Confirm actual least-privilege IAM against your hosting identity.

Set `NEXT_PUBLIC_SITE_URL` to the exact browser origin for that environment (including port for local testing). Origin validation uses this value and deliberately rejects aliases not configured for this deployment. Keep Azure connection string and container name in the host secret store. Use a dedicated public educational-media container, with no private documents. New uploads do not create or change container public access. Existing Google auth client settings stay intact.

## 2. Migrate existing administrators BEFORE changing production rules or app

In Firebase Console > Authentication > Users, independently verify each existing administrator UID, email, verified-email status and enabled status. The old two email addresses are in the previous source revision; do not use email matching as runtime authorization. Do not create new accounts as part of this process.

Using a trusted operator identity with temporary Firebase Authentication Admin permissions, run for EACH verified existing administrator:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\secure\operator-service-account.json'
node scripts/admin-role.mjs YOUR_PROJECT_ID VERIFIED_EXISTING_UID VERIFIED_EXISTING_EMAIL check
node scripts/admin-role.mjs YOUR_PROJECT_ID VERIFIED_EXISTING_UID VERIFIED_EXISTING_EMAIL grant
node scripts/admin-role.mjs YOUR_PROJECT_ID VERIFIED_EXISTING_UID VERIFIED_EXISTING_EMAIL check
```

The script refuses a mismatched email, disabled account, or unverified email, preserves other custom claims, and has no HTTP endpoint. `check` must show admin true after granting. Remove elevated operator access afterward. Require administrators to sign out and sign in again to refresh tokens (or invoke Firebase User.getIdToken(true)). Validate a fresh token's admin claim in staging. Keep the old application and rules running until both legitimate administrators are confirmed migrated; claims are additive and compatible with the old rules.

To remove a role later use the same script with `revoke`; it removes only admin and revokes refresh tokens. Server APIs check revocation on every privileged request. Direct Firestore rule checks may still accept already-issued tokens until expiry (normally up to one hour). For immediate containment disable the account and operationally block sensitive operations; do not assume SDK signOut revokes an issued token.

## 3. Enforce administrator MFA operationally

Existing login is Google OAuth. Require both administrator Google accounts to enable Google Account > Security > 2-Step Verification; prefer a passkey or hardware security key, register recovery factors, and review active sessions. A trusted operator must verify this before granting or retaining admin claims and periodically recheck it. Personal Google OAuth ID tokens do not prove upstream Google 2-Step Verification to this app; no claim of application-level MFA enforcement is made. For centrally enforced MFA use managed Workspace policy, or configure Identity Platform MFA and a supported enrollment/sign-in flow as a separate staged change. Do not turn on an unsupported Firebase factor requirement and lock out existing Google sign-in users.

## 4. Stage and review compatibility

```powershell
npm ci
npx tsc --noEmit
npm run lint
npm run test:rules
npm audit --omit=dev
npm run build
```

The emulator command uses a demo project and does not mutate production. Full lint has baseline failures documented in SECURITY-AUDIT.md; security-specific lint passes. Using staging accounts, verify ordinary Google login, non-admin /admin =403, admin /admin navigation, post draft/publish/edit/delete, notifications, subjects, browse banners, unit ordering, PDF downloads, raster uploads, comments/replies/owner deletion, and contact inbox read/delete. Test Google popup/iframe auth, browser back/forward, themes, image compression workers, Google Analytics and AdSense in a browser with CSP. Synthetic auth tests mock the SDK verifier; real OAuth/MFA and Azure CRUD were not executed here.

Inventory existing Firebase Storage and Azure paths BEFORE approving deployment. Public legacy directories are posts, avatars, images, browse, subjects, media and pdfs. Unlisted directories become inaccessible via Firebase rules/site proxy. Confirm no required educational assets live elsewhere; explicitly add reviewed public prefixes and emulator tests if necessary. Firebase download-token URLs and public Azure URLs bypass rule/proxy read restrictions: revoke existing download tokens and disable public access for any private object, move private objects to a separate private container, and rotate affected SAS URLs as necessary. Do not revoke public educational URLs blindly. Review existing Azure blobs for HTML/SVG, misleading MIME metadata and malicious replacements, because the previous API allowed unauthenticated writes. PDFs are signature checked and downloaded as attachments, not malware scanned; use a separate scanning/quarantine pipeline if untrusted PDF authors are introduced.

Subject notes lists are bounded in rules; nested entries and other trusted admin content do not have exhaustive schema constraints. Client-to-Firestore operations remain independently protected by claims-based rules. No user-profile collection is exposed or trusted for roles.

## 5. App Check and abuse monitoring

Register each browser origin in Firebase Console > App Check with reCAPTCHA v3. Configure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` in the host and first deploy with `FIREBASE_APPCHECK_ENFORCE` unset. Check token success and CSP in staging. After all clients are updated set server-only `FIREBASE_APPCHECK_ENFORCE=true`; submissions and view endpoints will then reject missing/invalid App Check tokens. Enable native Firestore/Storage App Check enforcement only after metrics confirm legitimate clients work. App Check does not replace auth or quotas. There is no App Check debug-token bypass in source.

Counters use Firestore transactions in private `_securityRateLimits` documents, preserving all existing content collections. Contact limits: 20/min global and 3/hour per normalized email. Comments: 5/min per UID and 100/min global. Uploads: 20/min per admin; list/delete 30/min per admin; revalidation 30/min per admin. Views: 300/min global and 60/min per post. These global caps avoid trusting spoofable forwarding headers, but attackers can exhaust a shared bucket and every rejected request can still cost a read. Add host/CDN request/body limits, trusted-edge IP limits and bot protection; tune thresholds using actual traffic. Public comments return at most 500 per post; media library lists at most 2000 files. Add pagination if existing production inventory exceeds those bounds.

Configure monitoring for request_rejected/server_operation_failed events, Firestore write/read costs, Auth failures, Azure operations and quota spikes; configure billing alerts. Log messages deliberately exclude tokens and SDK error objects. Counter docs are reused per key; periodically remove inactive arbitrary-email counter keys using a trusted scheduled cleanup if growth becomes material (no public delete endpoint).

## 6. Approval and coordinated production release

After staging verification, obtain owner approval for production rules. Then coordinate app and rules in a maintenance/restricted-write window, after all administrator claims are verified:

```powershell
npx firebase deploy --project YOUR_PROJECT_ID --only firestore:rules,storage
```

This command is documentation only and was NOT executed. Deploy the production Next.js build through your existing host, clear old CDN responses, and verify both admin accounts and normal/public features again. Avoid a window where old submission permissions remain active with the new APIs. Existing legacy public comment emails remain exposed until the new Firestore rules are deployed; public API projection alone cannot close that path.

Review current secret-scan evidence without printing any secrets. If incident review finds exposed Azure account keys, regenerate one key in Azure Portal > Storage account > Access keys, update the host secret, validate staging, then regenerate the retired key. For a leaked Firebase service account disable/delete the affected key in Google Cloud IAM, replace with workload identity, and review audit logs. Only rewrite Git history after coordination with repository collaborators if a real committed secret is found.


## Vercel setup (added after hosting was confirmed)

Do this BEFORE merging the security branch into the Vercel production branch. An application push does not deploy Firebase rules.

1. In Firebase Console > Project settings > Service accounts, identify a dedicated runtime service account. Prefer Vercel OIDC/workload identity federation if already configured. For the environment-secret option implemented here, obtain its JSON key and store the file securely outside Git. Give the runtime account only Firestore data and Firebase Auth user-read permissions; do not reuse the privileged claim-migration operator account as the permanent runtime identity.
2. In Vercel > your project > Settings > Environment Variables, add these for Production (and separately for an isolated Preview environment):

| Variable | Value / source | Type |
|---|---|---|
| FIREBASE_ADMIN_PROJECT_ID | project_id from the Firebase service-account JSON | Config |
| FIREBASE_ADMIN_CLIENT_EMAIL | client_email from that JSON | Secret |
| FIREBASE_ADMIN_PRIVATE_KEY | private_key from that JSON, without outer JSON quotes; real or escaped newlines work | Secret |
| NEXT_PUBLIC_SITE_URL | https://www.abhyasmitra.in in Production; exact preview origin for Preview | Config |
| AZURE_STORAGE_CONNECTION_STRING | Existing Azure runtime credential | Secret |
| AZURE_STORAGE_CONTAINER_NAME | Existing media container name | Config |

Never prefix Admin credentials with NEXT_PUBLIC_. Do not commit the JSON file or put a Windows GOOGLE_APPLICATION_CREDENTIALS file path in Vercel. Vercel environment changes apply to new deployments; redeploy the preview to validate configuration. For a separate preview Firebase project, update all NEXT_PUBLIC_FIREBASE_* variables to that project as well. Keep FIREBASE_APPCHECK_ENFORCE unset until the App Check rollout is verified.

3. Use a separate trusted operator credential locally with scripts/admin-role.mjs to grant and verify claims for existing administrators as described above. Do not send credentials in chat. Verify Google 2-Step Verification, then re-login to refresh tokens.
4. Use a Vercel Preview deployment to verify real login, admin navigation, uploads and submissions. Add its origin to the isolated Firebase project's authorized domains. Ensure NEXT_PUBLIC_SITE_URL exactly matches the preview origin. Avoid exercising write flows against production Firebase from a preview.
5. After these prerequisites and production-rule approval, coordinate the main merge/Vercel production deployment with Firebase rule deployment in a maintenance window. Validate both administrator accounts immediately afterward. Preserve old rule/app snapshots for incident response; do not reopen public write rules just to bypass an access failure.

Current server initialization supports the three FIREBASE_ADMIN_* variables above and retains ADC fallback. Partial or malformed credentials fail closed with generic errors. Credential setup tests use only an ephemeral in-memory key and make no network requests.


## Production startup fix

The ERR_REQUIRE_ESM incident was reproduced locally with native require(esm) disabled. package.json now pins Vercel to Node 24.x; next.config.ts bundles firebase-admin/jwks-rsa/jose together so startup does not depend on native require(esm). No JWT verification or revocation checks were removed. NEXT_PUBLIC_SITE_URL must use the live canonical origin https://www.abhyasmitra.in (Vercel redirects the apex to www). Origin checks also explicitly accept the owned apex/www pair while rejecting unrelated domains, HTTP downgrades and alternate ports. Legacy media paths permit spaces and parentheses so existing PDF URLs remain valid; private prefixes and traversal remain blocked.
