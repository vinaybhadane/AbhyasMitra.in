import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { container, publicPath } from '@/lib/server/media';
import { failure } from '@/lib/server/security';
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
 try {
  const path = (await context.params).path.join('/');
  if (!publicPath(path)) return new NextResponse('Not found', { status: 404 });
  const blob = container().getBlockBlobClient(path);
  if (!(await blob.exists())) return new NextResponse('Not found', { status: 404 });
  const result = await blob.download();
  const type = result.contentType || 'application/octet-stream';
  const image = ['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(type);
  if (!result.readableStreamBody) throw new Error();
  return new NextResponse(Readable.toWeb(result.readableStreamBody as Readable) as ReadableStream, { headers: {
   'Content-Type': image ? type : 'application/octet-stream',
   'Content-Disposition': image ? 'inline' : 'attachment',
   'X-Content-Type-Options': 'nosniff',
   'Content-Security-Policy': "default-src 'none'; sandbox",
   'Cache-Control': 'public, max-age=3600',
  } });
 } catch (error) { return failure(error); }
}
