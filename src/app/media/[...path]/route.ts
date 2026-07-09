import { BlobServiceClient } from '@azure/storage-blob';
import { NextRequest, NextResponse } from 'next/server';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'media';

function getContainerClient() {
  if (!connectionString || connectionString === 'your_azure_storage_connection_string') {
    throw new Error('Azure Storage connection string is not configured.');
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
}

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const pathArray = params.path as string[] | undefined;

    if (!pathArray || pathArray.length === 0) {
      return new NextResponse('Resource Not Found', { status: 404 });
    }

    const blobName = pathArray.map(segment => decodeURIComponent(segment)).join('/');
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return new NextResponse(`File "${blobName}" not found in storage.`, { status: 404 });
    }

    const properties = await blockBlobClient.getProperties();
    const contentType = properties.contentType || 'application/octet-stream';

    const downloadResponse = await blockBlobClient.download();
    const nodeReadableStream = downloadResponse.readableStreamBody;

    if (!nodeReadableStream) {
      return new NextResponse('Failed to read file stream from storage.', { status: 500 });
    }

    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });

    if (properties.contentLength !== undefined) {
      responseHeaders.set('Content-Length', properties.contentLength.toString());
    }

    return new NextResponse(nodeReadableStream as any, {
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[MEDIA_PROXY_ERROR]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
