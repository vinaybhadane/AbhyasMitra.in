# Initial source audit (before remediation)

Architecture: Next.js 16 App Router / React 19; Firebase Google popup Auth, direct Firestore lite/full SDK CRUD, Azure Blob uploads through Node route handlers, legacy Firebase Storage rules. Admin pages are client components. No server actions found. Public published posts, subjects, units, browse configuration and subject notes are intentional. Contacts are private. All admin pages use lib/firestore.ts. Existing PDF deletion in working tree predates this audit and will be preserved.

| ID | Severity | Evidence / affected code | Preconditions and impact | Planned fix |
|---|---|---|---|---|
| S01 | Critical | src/app/api/media/route.ts GET/POST/DELETE have no authentication | Network access permits Azure listing, arbitrary uploads, replacement and deletion with server credential | Admin SDK token verification and claim on every method |
| S02 | High | same POST trusts file.type/customPath; media/[...path]/route.ts serves any blob content inline at site origin | Anonymous attacker can upload HTML/SVG and serve stored active content at trusted origin | Size, decoded raster validation, PDF signature, path allowlist, generated names, safe serving |
| S03 | High | storage.rules final wildcard permits all reads and admin writes | Any known private path readable; wildcard overrides size/type/ownership constraints for admins | Explicit directories; default deny; separate deletes |
| S04 | Medium | firestore.rules isAdmin checks email without email_verified; firebase.ts hardcodes email | Account with matching unverified email where allowed by enabled providers can gain rights; provider configuration not available | Trusted custom claims, staged migration, no promotion endpoint |
| S05 | High | article page renders raw post.content and JSON.stringify(post fields) into HTML/script | Malicious stored content or compromised author executes browser script | Strict HTML sanitizer and escape less-than in JSON-LD |
| S06 | Medium | comments public read returns authorEmail; creation only binds userId, not authorName/email/time/post | Anyone can harvest emails; authenticated user can impersonate display identity and submit arbitrary fields | Public read API strips emails, trusted identity on write, rules deny direct creation |
| S07 | Medium | contacts public create, comments authenticated create lack rate limits | Spam, cost amplification and admin inbox flooding | Bounded server submissions, persistent transaction rate limits, deny direct writes |
| S08 | Medium | api/revalidate GET changes site-wide cache without auth | Anyone can repeatedly invalidate caches causing backend load | Admin-only POST and rate limit |
| S09 | Medium | admin/layout.tsx only client gate | Admin shell accepts direct navigation; Firestore already enforces content writes but Azure does not | Verified server session route gate, independent API checks |
| S10 | Low | API errors return error.message and log entire SDK exceptions | Backend internals disclosed on failures | Generic errors and bounded structured event logs |
| S11 | Low | next.config.ts lacks CSP/HSTS | Missing browser defense in depth | Compatible policy with explicit documented inline limitation; HTTPS HSTS |

Dependencies: audit pending registry availability. Secret review: .env.local is ignored and contains Azure server configuration; no env/key files tracked in current tree. Values were not printed. Full historical credential scan and credential revocation require further verification. Client Firebase API keys are public configuration, not automatically secrets.

Trust boundaries: browser input to authenticated APIs; Firebase token to Admin SDK (which bypasses rules); browser direct Firestore writes to deployed rules; server Azure account credential to media container; stored rich HTML to public browser; cookie to server admin route. No production probing or rule deployment authorized/performed.

## Dependency inventory after registry audit
S12 ? Critical (aggregate dependency finding): package.json/package-lock.json contained known vulnerable Next.js and websocket-driver versions plus high severity Tiptap, gRPC, image and parsing dependencies. `security/audit-before.json` records the actual package ranges and advisory URLs (57 affected dependency entries: 2 critical, 13 high, 39 moderate, 3 low). This confirms vulnerable installed versions, not successful exploitation or that every advisory is reachable in this application. Update Next within major 16, align Tiptap within major 3, remove unused Quill, update compatible transitives, then re-audit/build.
