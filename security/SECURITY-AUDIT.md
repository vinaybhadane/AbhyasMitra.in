# AbhyasMitra security audit and remediation

Date: 17 November 2026. Scope: local repository source and Git history, installed dependencies, local Next production server, isolated Firebase Firestore/Storage emulators. No production writes, claims changes, Azure uploads/deletes or security rule deployments were performed.

## 1. Summary

12 grouped findings: **2 Critical, 3 High, 5 Medium, 2 Low**. Dependency vulnerabilities are grouped as S12 rather than counting every transitive package as a separate application finding. Initial inventory with affected code, attack preconditions and intended remediation was written before implementation in INITIAL-AUDIT.md. S04 is a confirmed email-based policy weakness with an exploit precondition dependent on enabled Auth providers; account takeover via an unverified email was not demonstrated. No successful production exploitation is claimed.

## 2. Findings, implementation and evidence

| ID | Vulnerability | Severity | Affected files / relevant operation | Impact / precondition | Fix applied locally | Verification |
|---|---|---|---|---|---|---|
| S01 | Anonymous Azure media administration | Critical | src/app/api/media/route.ts GET, POST, DELETE | Network caller could enumerate, write, replace or delete blobs using server credential | Trusted Admin SDK verifyIdToken(token,true) and admin===true independently on every method | Emulator-backed API guard tests; production HTTP 401 for every method; actual Azure CRUD awaits staging |
| S02 | Arbitrary upload and same-origin active content | High | api/media POST; media/[...path]/route.ts GET | Caller supplied arbitrary path/MIME; HTML/SVG could execute at site origin | Streaming 10 MB bound, actual raster decode/re-encode, PDF signature and forced attachment, approved prefixes, random immutable names, scoped delete URL parsing | Byte-validation, traversal, oversize and malicious-content tests pass; existing remote inventory not inspected |
| S03 | Storage catch-all overrides restrictions | High | storage.rules final recursive match | Any existing unknown/private object readable; admin catch-all bypassed type/size controls | Explicit public legacy prefixes; deny direct create/update, including admins; scoped owner/admin delete; unknown paths denied | Storage emulator: public/private reads, normal/admin writes, oversized/unsupported uploads and delete scenarios pass |
| S04 | Email-only administrator policy | Medium | lib/firebase.ts ADMIN_EMAILS, firestore.rules/storage.rules isAdmin | Not bound to privileged custom claim; unverified matching email may qualify depending on enabled providers | Remove email authorization; claims-only rules/server/UI; privileged local CLI validates existing UID and verified expected email | Old admin email alone denied by emulator; admin claim CRUD allowed. Production claim migration is manual and must precede release |
| S05 | Stored HTML and script-context injection | High | app/[subject]/[slug]/page.tsx raw post HTML / JSON-LD | Malicious stored administrator-authored content could execute scripts | Maintained sanitizer with tag/attribute/protocol allowlist; JSON-LD escapes <; safe GA configuration serialization | Malicious tags, event handlers, URLs and closing-script payload tests pass |
| S06 | Comment identity spoofing and email disclosure | Medium | firestore.rules comments; lib/firestore.ts addComment/getCommentsByPost | Public raw documents exposed email; authenticated author could supply another name/email/time/fields | Server derives identity/time from verified token, validates published post/reply relation; public projection omits email including old documents; raw collection admin-only | Spoofed name/email ignored; public projection excludes email; direct impersonating writes denied |
| S07 | Submission abuse and cost amplification | Medium | firestore.rules contacts/comments; new api/submissions and api/views | Unlimited direct writes and weak payload checks | Deny direct submissions; bounded streaming JSON, explicit field projection, transactional global/per-identity quotas; optional staged App Check | Concurrent rate-limit test admits exactly allowed operations; invalid contact and privileged fields tested; App Check missing token denied when enforcement enabled |
| S08 | Public cache invalidation GET | Medium | api/revalidate/route.ts; lib/firestore.ts triggerRevalidate | Any caller could repeatedly invalidate site cache | Admin-only POST; authenticated client; per-admin quota | HTTP GET=405, unauthenticated POST=401; non-admin API test=403 |
| S09 | Browser-only admin route gate | Medium | app/admin/layout.tsx | Direct route access lacked trusted server check; Firestore writes already had separate rules, so no general DB bypass claimed | Proxy verifies revocation/claim; server layout independently verifies cookie; APIs independently authorize; normal user gets 403 | Proxy tests cover redirect, non-admin 403, admin 200; local HTTP unauthenticated route=307 |
| S10 | SDK exception disclosure | Low | api/media, api/revalidate, media proxy catch blocks | Caller could learn backend details from error.message and verbose logs | Generic 503 responses; structured rejection/failure events without SDK objects, tokens or credentials | Guard and invalid payload response checks; source inspection |
| S11 | Missing browser hardening headers | Low | next.config.ts | Reduced browser defenses | CSP, HTTPS HSTS, existing nosniff/referrer/permissions/frame protections retained | Production HTTP confirms headers; production CSP has no unsafe-eval. Full OAuth/Ads browser compatibility remains staging work |
| S12 | Known vulnerable installed dependencies | Critical | package.json/package-lock.json | Vulnerable installed versions confirmed by registry advisories; exploitability varies by code path | Next 16.2.4?16.4.6; Tiptap 3.22.5?3.34.0; compatible transitive fixes; gRPC patched override; unused vulnerable react-quill-new removed | Production audit: 0 vulnerabilities; full audit: 13 moderate Firebase CLI dev-toolchain entries; build/TypeScript pass |

## 3. Modified files and purpose

| Files | Improvement |
|---|---|
| AGENTS.md | Automatically refreshed by upgraded Next.js dev server; retains the requirement to read installed framework guides |
| .gitignore | Excludes local emulator logs and conventional privileged service-account filenames |
| firebase.json | Adds local demo-project emulator configuration; production hosting unchanged |
| firestore.rules | Custom claims, default deny, validation of admin content fields, direct submissions blocked, private raw comments/contacts |
| storage.rules | Approved public prefixes, no catch-all reads/writes, direct uploads disabled, scoped deletes |
| next.config.ts | Compatible CSP and production HSTS |
| package.json, package-lock.json | Security package updates, Admin SDK/sanitizer/raster validator, emulator test tools and test scripts |
| src/lib/server/firebase-admin.ts | Lazy isolated Admin SDK initialization through server-only environment credentials |
| src/lib/server/security.ts | Token/revocation/role verification, Origin checks, bounded JSON, transaction quotas, safe errors and optional App Check verification |
| src/lib/server/media.ts | Storage access helper, strict paths, byte validation, raster re-encoding, generated immutable object names |
| src/lib/auth-fetch.ts, src/lib/app-check.ts | Firebase bearer tokens and optional App Check headers on browser API calls |
| src/lib/sanitize.ts | HTML allowlist and safe JSON serialization |
| src/lib/firebase.ts | Removes hardcoded admin email authorization |
| src/lib/firestore.ts | Authenticated media/revalidation, server submission/projection functions, bounded server view counter |
| src/contexts/AuthContext.tsx | Token-change handling, verified server session, custom claim UI state, periodic token refresh and logout session cleanup |
| src/proxy.ts | Server admin route authorization and private no-store responses |
| src/app/admin/layout.tsx, AdminShell.tsx | Independent server layout check; original admin UI moved into client shell |
| src/app/admin/media/page.tsx | Media listing sends authentication |
| src/app/login/page.tsx | Google sign-in landing page for protected admin redirects |
| src/app/api/session/route.ts | Origin-protected HttpOnly, SameSite=Strict, production Secure cookie carrying the signed, expiring Firebase ID token |
| src/app/api/media/route.ts | Authenticated/rate-limited upload, listing and deletion with safe validation |
| src/app/api/revalidate/route.ts | Admin-only POST invalidation |
| src/app/api/submissions/route.ts | Validated/rate-limited contacts/comments, trusted identity, email-free public projection |
| src/app/api/views/route.ts | Bounded published-post-only view increment (previous direct writes were denied by existing rules) |
| src/app/media/[...path]/route.ts | Approved public objects, safe streaming types, attachment handling and sandbox headers |
| src/app/[subject]/[slug]/page.tsx | Sanitizes article before rendering and TOC generation, escapes JSON-LD |
| src/app/layout.tsx | Escapes environment-derived Analytics identifier in script context |
| scripts/admin-role.mjs | Explicit operator-only, verified identity claim grant/check/revoke CLI; no public promotion endpoint |
| tests/security.test.ts | 15 security test cases spanning auth, APIs, abuse controls, Firestore, Storage, rendering and uploads |
| security/* | Initial/final audit, deployment runbook, command outputs and dependency/secret scan evidence |

An existing deletion of FE 2024 Pattern Syllabus.pdf was present before this audit and was not changed/restored by this work.

## 4. Administrator status

Every privileged API verifies Firebase's signed ID token with checkRevoked=true, then requires strict boolean admin===true. Expired, malformed, invalid and revoked tokens return 401; ordinary verified users return 403. Browser route session checks also use token verification; the server layout repeats authorization. Bearer API authentication does not accept the browser cookie. Cookie session creation/deletion requires exact Origin and strict SameSite; the cookie is HttpOnly and Secure in production, expires with the ID token, and has no Domain attribute. Role assignment exists only in an operator CLI; document fields and frontend role values confer no privileges. Custom claims refresh on re-login or getIdToken(true); the client refreshes periodically. Direct rule checks do not perform Admin SDK revocation lookups, so existing rule tokens can remain valid until expiry.

MFA is not automatically enabled. An exact Google-account 2-Step Verification enrollment and operator enforcement process is in DEPLOYMENT.md; real enrollment/account verification was not possible here.

## 5. Firebase and upload status

Default-deny Firestore rules allow published posts and required educational configuration publicly. Trusted claims restrict content management; raw comment identity/email and contact messages are admin-only. Owners may delete their own comments. Unknown/profile/role collections and private rate counters are denied. All backend Admin SDK operations perform explicit role, input, published-state or resource relationship checks because that SDK bypasses rules. Contacts intentionally remain anonymous through the bounded server API.

Firebase Storage now reads only explicit existing public asset directories. The actual application uploads to Azure through server validation; direct Firebase uploads are disabled for all callers because Storage rules cannot inspect raster file bytes. This preserves all observed upload UI paths. New Azure raster uploads are re-encoded; PDFs are signature checked and downloaded as attachments. No private object access exists in the proxy. Existing tokenized Firebase download URLs and public Azure object URLs need separate inventory/revocation if they point to private files. Existing production files and direct URL permissions were not changed.

## 6. Actual validation results

| Command / check | Result |
|---|---|
| npx tsc --noEmit | Pass, no diagnostics |
| npm run build | Pass, optimized Next.js 16.4.6 production build and route generation |
| npm run test:rules | Pass: Firestore/Storage emulators, demo-abhyasmitra-security, 15 tests, 15 passed, 0 failed |
| npm run test:security | Executed by test:rules with emulator environment; never use it against production |
| npm audit --omit=dev --json | Pass: 0 production vulnerabilities (audit-production.json) |
| npm audit --json | Nonzero exit: 13 moderate development-toolchain entries, 0 high/critical (audit-after.json) |
| npm run lint | Nonzero exit: 53 errors and 24 warnings; no checks disabled |
| Baseline source lint using the same updated ESLint config | 64 errors and 25 warnings before changes; baseline captured in eslint-baseline.txt |
| npx eslint src/lib/server src/lib/auth-fetch.ts src/lib/app-check.ts src/lib/sanitize.ts src/proxy.ts src/app/api src/app/login src/contexts/AuthContext.tsx tests/security.test.ts | Pass, no diagnostics (eslint-security.txt) |
| npm run start -- --port 3100 + local HTTP requests | 10 checks pass: root/login=200, /admin=307, media GET/POST/DELETE=401, revalidate GET=405 / POST=401, private media path=404, cross-origin/missing-Origin session=403 |
| git diff --check | Pass |
| Historical secret pattern scan | 76 revisions scanned, 0 matches for private-key markers, Azure AccountKey, GitHub tokens and AWS key IDs; no secret values output |

Lint failures remain in existing UI code (explicit any, hook declaration/effect issues, JSX escaping). The original layout's effect warning remains in the moved AdminShell. They were not suppressed. No unrelated UI rewrite was attempted. New security code passes focused lint. Registry dependency updates eliminated all critical/high findings. Remaining dev findings are in Firebase CLI's glob/minimatch, uuid and OpenTelemetry dependency chains; npm recommends a major CLI downgrade. That downgrade was not forced. Node 24.7 also produces an engine warning from Firebase transitives requiring >=24.12; update the runtime as described in the runbook.

Auth rejection/status tests mock Admin SDK verification and assert checkRevoked=true; they do not claim real cryptographic token verification or OAuth sign-in was exercised. Rules tests use actual emulators. Valid admin content CRUD is tested in Firestore emulator. Azure persistence/deletion, real Google login, enrolled MFA, full dashboard browser navigation, actual remote educational inventory, Analytics/AdSense behavior and deployed CSP compatibility have not been tested. Public content is smoke-tested at the HTTP level; submission flows are tested through isolated route handlers and emulator data.

## 7. Required manual actions

Follow DEPLOYMENT.md in order: provision matching project server credentials; grant/check custom claims for both existing verified administrators BEFORE release; refresh tokens; verify Google 2-Step Verification; inventory legacy public/private object paths and direct URLs; stage real login/admin CRUD/uploads; configure App Check and monitor before enforcement; obtain owner approval for rules; release app and rules together; configure host-level abuse limits and monitoring. No automatic production deployment occurred.

No committed secrets matching the scanned patterns were found. .env.local is ignored, contains Azure server configuration, and was inspected by variable name only. Secret values were not logged. Full historical scanning is pattern based and cannot establish absence of every possible credential. Incident review of the formerly public Azure write API may still justify key rotation and blob integrity checks; exact actions are in the runbook.

## 8. Assessment and limitations

**Implemented and locally verified:** API authorization/rejection paths, claims-based rules, scoped Storage access, rendered-content sanitization, public email projection, server-derived submission identity, submission quotas, upload type/size validation, server route gate, dependency production audit and build. **Not yet deployed:** all app/rule changes; production vulnerabilities remain until coordinated approved release. **Manual prerequisites:** real admin migration, server identity/IAM, staging user/administrator browser workflows, MFA verification, existing object inventory, App Check rollout, production monitoring and rule deployment approval.

Known residual risks: CSP permits unsafe-inline for Next ISR hydration and next-themes; nonce enforcement would require dynamic rendering and a larger caching change, so it was not silently introduced. Production unsafe-eval is absent; development permits it for framework tooling. img-src allows HTTPS because the existing editor and image URL importer allow external images. Rich HTML sanitization is therefore the primary XSS control, not a fully strict script CSP. App Check is deliberately unenforced until configured. Global rate buckets can be exhausted and do not replace edge protection or protect billing from all read floods. Public comments/media responses have documented upper bounds pending pagination for larger inventories. PDF malware scanning is not implemented. Trusted admin content schemas are bounded for key fields but nested note structures are not exhaustively validated. These limits and the passing automated tests do not establish that the entire application is secure.

## References

[Firebase custom claims](https://firebase.google.com/docs/auth/admin/custom-claims), [Firebase token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [Firebase revocation/session guidance](https://firebase.google.com/docs/auth/admin/manage-sessions), [Next.js security advisories](https://github.com/vercel/next.js/security/advisories). Relevant installed Next.js guides for Proxy, cookies, route handlers and CSP were read before implementation.

The development server was restarted with Next.js 16.4.6 at http://localhost:3000 after validation; the temporary production smoke-test server on port 3100 was stopped.
