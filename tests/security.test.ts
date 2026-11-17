import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mock } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getBytes, deleteObject } from 'firebase/storage';
import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '../src/lib/server/firebase-admin';
import { requireAdmin, rateLimit, jsonBody, HttpError } from '../src/lib/server/security';
import { sanitizeArticle, safeJson } from '../src/lib/sanitize';
import { publicPath, validateUpload, generatedPath } from '../src/lib/server/media';
import { GET as mediaGet, POST as mediaPost, DELETE as mediaDelete } from '../src/app/api/media/route';
import { POST as revalidate } from '../src/app/api/revalidate/route';
import { POST as submit, GET as comments } from '../src/app/api/submissions/route';
import { POST as session } from '../src/app/api/session/route';
import sharp from 'sharp';
const projectId = 'demo-abhyasmitra-security';
process.env.FIREBASE_ADMIN_PROJECT_ID = projectId;
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
let env: Awaited<ReturnType<typeof initializeTestEnvironment>>;
before(async () => {
 if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_STORAGE_EMULATOR_HOST) throw new Error('Emulators required');
 env = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync('firestore.rules','utf8') }, storage: { rules: readFileSync('storage.rules','utf8') } });
 await env.withSecurityRulesDisabled(async context => {
  const db = context.firestore();
  await setDoc(doc(db,'posts','public'),{ title:'Notes', content:'<p>Hello</p>', slug:'math/notes', status:'published', tags:[], views:0 });
  await setDoc(doc(db,'posts','draft'),{ status:'draft' });
  await setDoc(doc(db,'comments','other'),{ userId:'other', postId:'public', authorEmail:'private@example.com', content:'Hello', authorName:'Reader', createdAt:new Date() });
  await setDoc(doc(db,'contacts','private'),{ message:'private' });
  await uploadBytes(ref(context.storage(), 'posts/public.png'), new Uint8Array([1]), { contentType:'image/png' });
  await uploadBytes(ref(context.storage(), 'private/key.txt'), new Uint8Array([1]));
 });
});
after(async () => { mock.restoreAll(); await env?.cleanup(); });
const request = (path: string, token?: string, body?: unknown) => new NextRequest(`http://localhost:3000${path}`, { method: body === undefined ? 'GET' : 'POST', headers:{ Origin:'http://localhost:3000', ...(token ? { Authorization:`Bearer ${token}` } : {}), 'Content-Type':'application/json' }, ...(body === undefined ? {} : {body:JSON.stringify(body)}) });
test('Firestore: published public, draft/private/unknown denied', async () => {
 const db=env.unauthenticatedContext().firestore();
 await assertSucceeds(getDoc(doc(db,'posts','public')));
 for (const [c,id] of [['posts','draft'],['contacts','private'],['users','me'],['_securityRateLimits','x'],['unknown','x'],['comments','other']]) await assertFails(getDoc(doc(db,c,id)));
});
test('Firestore: ordinary user cannot write admin content, assign roles, impersonate comments or bypass submissions', async () => {
 const db=env.authenticatedContext('reader',{email:'vinaybhadane06@gmail.com',email_verified:true}).firestore();
 for (const c of ['posts','subjects','units','notifications','browseConfig','subjectNotes','users','contacts','comments']) await assertFails(setDoc(doc(db,c,'attack'),{ admin:true,isAdmin:true,userId:'other' }));
 await assertFails(updateDoc(doc(db,'posts','public'),{status:'draft'}));
 await assertFails(deleteDoc(doc(db,'comments','other')));
});
test('Firestore: admin valid CRUD; owner comment delete; malformed content denied', async () => {
 const db=env.authenticatedContext('admin',{admin:true}).firestore();
 const d=doc(db,'posts','crud'); const post={title:'Test',content:'<p>Text</p>',slug:'math/test',status:'draft',tags:[],views:0};
 await assertSucceeds(setDoc(d,post)); await assertSucceeds(updateDoc(d,{status:'published'})); await assertSucceeds(deleteDoc(d));
 await assertFails(setDoc(d,{...post,views:-1}));
 await assertSucceeds(deleteDoc(doc(env.authenticatedContext('other').firestore(),'comments','other')));
});
test('Storage: only intended paths public; all direct uploads blocked; owner/admin deletion scoped', async () => {
 const storage=env.unauthenticatedContext().storage();
 assert.equal((await assertSucceeds(getBytes(ref(storage,'posts/public.png')))).byteLength,1);
 await assertFails(getBytes(ref(storage,'private/key.txt')));
 for (const ctx of [env.unauthenticatedContext(),env.authenticatedContext('reader'),env.authenticatedContext('admin',{admin:true})]) {
  for (const [path,type,size] of [['posts/upload.png','image/png',1],['posts/active.svg','image/svg+xml',1],['unexpected/file','image/png',1],['posts/huge.png','image/png',11*1024*1024]] as const) await assertFails(uploadBytes(ref(ctx.storage(),path),new Uint8Array(size),{contentType:type}));
 }
 await assertFails(deleteObject(ref(env.authenticatedContext('reader').storage(),'posts/public.png')));
 await assertSucceeds(deleteObject(ref(env.authenticatedContext('admin',{admin:true}).storage(),'posts/public.png')));
});
test('Auth: missing, invalid, expired, revoked, non-admin denied; verified admin accepted', async () => {
 await assert.rejects(requireAdmin(request('/')), (e: HttpError)=>e.status===401);
 const stub=mock.method(adminAuth(),'verifyIdToken',async (token:string,revoked:boolean)=>{
  assert.equal(revoked,true);
  if (['invalid','expired','revoked'].includes(token)) throw new Error('Rejected');
  return {uid:'test',admin:token==='admin',exp:Math.floor(Date.now()/1000)+3600};
 });
 for(const token of ['invalid','expired','revoked']) await assert.rejects(requireAdmin(request('/',token)),(e:HttpError)=>e.status===401);
 await assert.rejects(requireAdmin(request('/','reader')),(e:HttpError)=>e.status===403);
 assert.equal((await requireAdmin(request('/','admin'))).uid,'test');
 stub.mock.restore();
});
test('Direct API access fails before Azure or cache operations', async () => {
 for (const handler of [mediaGet,mediaPost,mediaDelete,revalidate]) assert.equal((await handler(request('/api/media'))).status,401);
 const stub=mock.method(adminAuth(),'verifyIdToken',async()=>({uid:'reader',admin:false}));
 for (const handler of [mediaGet,mediaPost,mediaDelete,revalidate]) assert.equal((await handler(request('/api/media','reader'))).status,403);
 stub.mock.restore();
});
test('Cookie session rejects cross-origin requests', async () => {
 assert.equal((await session(new NextRequest('http://localhost:3000/api/session',{method:'POST',headers:{Origin:'https://attacker.test'}}))).status,403);
});
test('Persistent rate limit works concurrently and body parser bounds input', async () => {
 const key=`test:${Date.now()}`;
 const outcomes=await Promise.allSettled(Array.from({length:5},()=>rateLimit(key,2)));
 assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,2);
 assert.equal(outcomes.filter(r=>r.status==='rejected' && r.reason.status===429).length,3);
 await assert.rejects(jsonBody(new Request('http://localhost',{method:'POST',body:'x'.repeat(100)}),10),(e:HttpError)=>e.status===413);
});
test('Malicious HTML and JSON-LD cannot escape rendering context', () => {
 const safe=sanitizeArticle('<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">link</a><svg onload="alert(1)"></svg><p>Notes</p>');
 assert.ok(!/script|onerror|javascript|onload|<svg/.test(safe)); assert.ok(safe.includes('<p>Notes</p>'));
 const payload={title:'</script><script>alert(1)</script>'}; const serialized=safeJson(payload);
 assert.ok(!serialized.includes('<')); assert.deepEqual(JSON.parse(serialized),payload);
});
test('Upload byte validation, immutable paths, size limits and traversal', async () => {
 for(const path of ['private/key','posts/../key','posts//key','posts/a\\b','https://evil/x']) assert.equal(publicPath(path),false);
 assert.equal(publicPath('posts/inline/old-image.webp'),true);
 assert.equal(publicPath('pdfs/1783762954130_TE COMPUTER ENGINEERING 2024 PATTERN.pdf'),true);
 await assert.rejects(validateUpload(Buffer.from('<svg onload="alert(1)"/>')));
 await assert.rejects(validateUpload(Buffer.alloc(11*1024*1024)),(e:HttpError)=>e.status===413);
 const bytes=await sharp({create:{width:2,height:2,channels:3,background:'red'}}).png().toBuffer();
 const file=await validateUpload(bytes); assert.equal(file.type,'image/webp');
 assert.notEqual(generatedPath('posts/old.png',file.ext),'posts/old.png');
});
test('Submission rejects invalid payload, derives identity and hides legacy emails', async () => {
 const stub=mock.method(adminAuth(),'verifyIdToken',async()=>({uid:'reader',name:'Real Reader',email:'real@example.com'}));
 assert.equal((await submit(request('/api/submissions',undefined,{kind:'comment',postId:'public',content:'Hello'}))).status,401);
 assert.equal((await submit(request('/api/submissions','reader',{kind:'comment',postId:'../private',content:'Hello'}))).status,400);
 const response=await submit(request('/api/submissions','reader',{kind:'comment',postId:'public',content:'<script>alert(1)</script>',authorName:'Administrator',authorEmail:'fake@example.com'}));
 assert.equal(response.status,200); const {id}=await response.json();
 const saved=(await adminDb().collection('comments').doc(id).get()).data();
 assert.equal(saved?.authorName,'Real Reader'); assert.equal(saved?.authorEmail,'real@example.com');
 const listing=await comments(request('/api/submissions?postId=public'));
 assert.equal(listing.status,200); assert.ok(!(await listing.text()).includes('authorEmail'));
 stub.mock.restore();
});

test('Server route gate returns redirect, 403, or admin response; session cookie flags and expiry', async () => {
 const { proxy } = await import('../src/proxy');
 assert.equal((await proxy(request('/admin'))).status,307);
 const stub=mock.method(adminAuth(),'verifyIdToken',async(token:string)=>({uid:'test',admin:token==='admin',exp:Math.floor(Date.now()/1000)+3600}));
 const normal=new NextRequest('http://localhost:3000/admin',{headers:{Cookie:'admin-token=reader'}});
 assert.equal((await proxy(normal)).status,403);
 const admin=new NextRequest('http://localhost:3000/admin',{headers:{Cookie:'admin-token=admin'}});
 assert.equal((await proxy(admin)).status,200);
 const response=await session(new NextRequest('http://localhost:3000/api/session',{method:'POST',headers:{Origin:'http://localhost:3000',Authorization:'Bearer admin'}}));
 assert.equal(response.status,200);
 const cookie=response.headers.get('set-cookie') || '';
 assert.match(cookie,/HttpOnly/i); assert.match(cookie,/SameSite=strict/i); assert.match(cookie,/Max-Age=/i);
 stub.mock.restore();
});
test('Contact input rejects malformed data and stores only validated fields', async () => {
 assert.equal((await submit(request('/api/submissions',undefined,{kind:'contact',name:'ok',email:'bad',message:'long enough message'}))).status,400);
 const response=await submit(request('/api/submissions',undefined,{kind:'contact',name:'Reader',email:'reader@example.com',message:'A legitimate question',read:true,admin:true}));
 assert.equal(response.status,200); const {id}=await response.json();
 const saved=(await adminDb().collection('contacts').doc(id).get()).data();
 assert.equal(saved?.read,false); assert.ok(!('admin' in saved!));
});
test('Admin upload rejects bad input before touching Azure; App Check fails closed when enforced', async () => {
 const stub=mock.method(adminAuth(),'verifyIdToken',async()=>({uid:'test-admin',admin:true}));
 assert.equal((await mediaPost(new NextRequest('http://localhost:3000/api/media',{method:'POST',headers:{Authorization:'Bearer admin'}}))).status,400);
 const { requireAppCheck }=await import('../src/lib/server/security');
 process.env.FIREBASE_APPCHECK_ENFORCE='true';
 try { await assert.rejects(requireAppCheck(request('/')),(e:HttpError)=>e.status===403); }
 finally { delete process.env.FIREBASE_APPCHECK_ENFORCE; stub.mock.restore(); }
});

test('Public view counter only updates published posts through bounded API', async () => {
 const { POST } = await import('../src/app/api/views/route');
 assert.equal((await POST(request('/api/views',undefined,{id:'public'}))).status,200);
 assert.equal((await POST(request('/api/views',undefined,{id:'draft'}))).status,404);
 assert.equal((await POST(request('/api/views',undefined,{id:'../private'}))).status,400);
 const data=(await adminDb().collection('posts').doc('public').get()).data();
 assert.equal(data?.views,1);
});

test('Origin validation accepts only configured origin and the owned www/apex pair', async () => {
 const { sameOrigin } = await import('../src/lib/server/security');
 const saved = process.env.NEXT_PUBLIC_SITE_URL;
 process.env.NEXT_PUBLIC_SITE_URL = 'https://abhyasmitra.in';
 try {
  for (const origin of ['https://abhyasmitra.in','https://www.abhyasmitra.in']) assert.doesNotThrow(() => sameOrigin(new Request('https://www.abhyasmitra.in/api/session',{headers:{Origin:origin}})));
  for (const origin of ['https://attacker.test','https://www.abhyasmitra.in.attacker.test','http://www.abhyasmitra.in','https://www.abhyasmitra.in:8443','null']) assert.throws(() => sameOrigin(new Request('https://www.abhyasmitra.in/api/session',{headers:{Origin:origin}})),(error:HttpError)=>error.status===403);
 } finally { process.env.NEXT_PUBLIC_SITE_URL=saved; }
});
