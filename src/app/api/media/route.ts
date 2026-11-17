import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, rateLimit, failure, HttpError } from '@/lib/server/security';
import { container, publicPath, validateUpload, generatedPath, MAX_UPLOAD } from '@/lib/server/media';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
 try {
  const user = await requireAdmin(request); await rateLimit(`media-list:${user.uid}`, 30);
  const files = [];
  for await (const blob of container().listBlobsFlat()) {
   if (!publicPath(blob.name)) continue;
   files.push({ name: blob.name.split('/').pop(), path: blob.name, url: `/media/${blob.name}`,
    size: `${Math.round((blob.properties.contentLength || 0)/1024)} KB`, type: blob.properties.contentType, createdAt: blob.properties.createdOn });
   if (files.length >= 2000) break;
  }
  files.sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  return NextResponse.json({ files }, { headers: { 'Cache-Control': 'no-store' } });
 } catch (error) { return failure(error); }
}
export async function POST(request: NextRequest) {
 try {
  const user = await requireAdmin(request); await rateLimit(`upload:${user.uid}`, 20);
  // Enforce a streaming body bound before parsing multipart data, even without Content-Length.
  const reader = request.body?.getReader(); if (!reader) throw new HttpError(400, 'Missing file');
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) {
   const { done, value } = await reader.read(); if (done) break;
   total += value.length;
   if (total > MAX_UPLOAD + 65536) { await reader.cancel(); throw new HttpError(413, 'Upload too large'); }
   chunks.push(value);
  }
  const form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData().catch(() => { throw new HttpError(400, 'Invalid form data'); });
  const file = form.get('file'); if (!(file instanceof File)) throw new HttpError(400, 'Missing file');
  const validated = await validateUpload(Buffer.from(await file.arrayBuffer()));
  const path = generatedPath(form.get('path') || `media/upload`, validated.ext);
  await container().getBlockBlobClient(path).uploadData(validated.buffer, {
   conditions: { ifNoneMatch: '*' }, blobHTTPHeaders: { blobContentType: validated.type,
    blobContentDisposition: validated.ext === 'pdf' ? 'attachment' : 'inline' },
  });
  return NextResponse.json({ url: `/media/${path}`, path, name: file.name, size: `${Math.round(validated.buffer.length/1024)} KB` });
 } catch (error) { return failure(error); }
}
export async function DELETE(request: NextRequest) {
 try {
  const user = await requireAdmin(request); await rateLimit(`media-delete:${user.uid}`, 30);
  const value = request.nextUrl.searchParams.get('url') || '';
  const storage = container(); let path = '';
  if (value.startsWith('/media/')) path = decodeURIComponent(value.slice(7));
  else {
    let url: URL; try { url = new URL(value); } catch { throw new HttpError(400, 'Invalid media URL'); }
    const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url);
    const azure = new URL(storage.url);
    if (url.origin === site.origin && url.pathname.startsWith('/media/')) path = decodeURIComponent(url.pathname.slice(7));
    else if (url.origin === azure.origin && url.pathname.startsWith(`${azure.pathname}/`)) path = decodeURIComponent(url.pathname.slice(azure.pathname.length + 1));
  }
  if (!publicPath(path)) throw new HttpError(400, 'Invalid media path');
  const result = await storage.getBlockBlobClient(path).deleteIfExists();
  return NextResponse.json({ success: result.succeeded });
 } catch (error) { return failure(error); }
}
