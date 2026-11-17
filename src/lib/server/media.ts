import { BlobServiceClient } from '@azure/storage-blob';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { HttpError } from './security';
export const MAX_UPLOAD = 10 * 1024 * 1024;
export const publicPath = (path: string) => /^(posts|avatars|images|browse|subjects|media|pdfs)\/[a-zA-Z0-9_ .()/-]+$/.test(path)
  && path.split('/').every(part => part && part !== '.' && part !== '..') && !path.includes('\\');
export function container() {
 const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
 if (!connection) throw new Error('Storage unavailable');
 return BlobServiceClient.fromConnectionString(connection).getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME || 'media');
}
export async function validateUpload(buffer: Buffer) {
 if (!buffer.length || buffer.length > MAX_UPLOAD) throw new HttpError(413, 'File must be between 1 byte and 10 MB');
 if (buffer.subarray(0,5).toString() === '%PDF-') {
   // PDFs may contain active features: always serve as attachments from the proxy.
   return { buffer, type: 'application/pdf', ext: 'pdf' };
 }
 try {
  const image = sharp(buffer, { limitInputPixels: 40_000_000, animated: false });
  const metadata = await image.metadata();
  if (!['jpeg','png','webp','gif','avif'].includes(metadata.format || '')) throw new Error();
  // Decode and re-encode raster bytes; strips metadata and trailing active content.
  return { buffer: await image.webp().toBuffer(), type: 'image/webp', ext: 'webp' };
 } catch { throw new HttpError(415, 'Only raster images and PDF documents are supported'); }
}
export function generatedPath(requested: unknown, ext: string) {
 if (typeof requested !== 'string' || !publicPath(requested)) throw new HttpError(400, 'Invalid media path');
 const folder = ext === 'pdf' ? 'pdfs' : requested.split('/')[0];
 return `${folder}/${randomUUID()}.${ext}`;
}
