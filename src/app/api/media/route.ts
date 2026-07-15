import { BlobServiceClient } from '@azure/storage-blob';
import { NextRequest, NextResponse } from 'next/server';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'media';

// Helper to get Container Client
function getContainerClient() {
  if (!connectionString || connectionString === 'your_azure_storage_connection_string') {
    throw new Error('Azure Storage connection string is not configured. Please set AZURE_STORAGE_CONNECTION_STRING in your environment variables.');
  }
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
}

// GET: Retrieve list of uploaded files from Azure Blob Storage
export async function GET() {
  try {
    const containerClient = getContainerClient();
    
    // Check if container exists
    const exists = await containerClient.exists();
    if (!exists) {
      return NextResponse.json({ files: [] });
    }

    const files = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
      
      // Determine file extension to classify type
      const isPdf = blob.name.toLowerCase().endsWith('.pdf');
      
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
      const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
      const fileUrl = `${baseUrl}/media/${blob.name}`;

      files.push({
        name: blob.name.split('/').pop() || blob.name,
        url: fileUrl,
        path: blob.name,
        size: blob.properties.contentLength
          ? `${(blob.properties.contentLength / 1024).toFixed(0)} KB`
          : '0 KB',
        type: isPdf ? 'application/pdf' : (blob.properties.contentType || 'image/webp'),
        createdAt: blob.properties.createdOn,
      });
    }

    // Sort files by creation date (newest first)
    files.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('[AZURE_MEDIA_GET_ERROR]', error);
    // If not configured, return a clear message but don't crash
    if (error.message && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: error.message, isConfigured: false },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to list media files from Azure.' },
      { status: 500 }
    );
  }
}

// POST: Upload a file directly to Azure Blob Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customPath = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data.' }, { status: 400 });
    }

    const containerClient = getContainerClient();
    
    // Create container if it doesn't exist, set access to blob so files are publicly readable
    await containerClient.createIfNotExists({ access: 'blob' });

    // Determine the blob path
    const cleanFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[.-]|[.-]$/g, '');
    
    const extension = cleanFileName.split('.').pop() || '';
    const nameWithoutExt = cleanFileName.replace(/\.[^.]+$/, '');
    
    // Use the customPath provided or construct a new path based on file type
    let blobPath = customPath;
    if (!blobPath) {
      const folder = extension === 'pdf' ? 'pdfs' : 'media';
      blobPath = `${folder}/${nameWithoutExt}-${Date.now()}.${extension}`;
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload with content type headers
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type || (extension === 'pdf' ? 'application/pdf' : 'image/webp'),
      },
    });

    // For PDFs, use the direct Azure Blob URL for reliable, fast downloads.
    // For images, use the proxied site URL for Next.js image optimization compatibility.
    const isPdf = extension === 'pdf';
    let fileUrl: string;

    if (isPdf) {
      // Direct Azure Blob URL — bypasses Next.js server entirely
      fileUrl = blockBlobClient.url;
    } else {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
      const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
      fileUrl = `${baseUrl}/media/${blobPath}`;
    }

    return NextResponse.json({
      url: fileUrl,
      name: file.name,
      path: blobPath,
      size: `${(file.size / 1024).toFixed(0)} KB`,
    });
  } catch (error: any) {
    console.error('[AZURE_MEDIA_POST_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file to Azure.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a blob from Azure Storage using its URL
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing required query parameter "url"' }, { status: 400 });
    }

    const containerClient = getContainerClient();
    
    // Parse blob name from public Azure Blob URL
    // e.g., https://myaccount.blob.core.windows.net/media/media/myimage-1234.webp -> media/myimage-1234.webp
    let blobName = '';
    const cleanedUrl = fileUrl.trim();
    
    if (cleanedUrl.includes('/media/')) {
      const parts = cleanedUrl.split('/media/');
      blobName = decodeURIComponent(parts[parts.length - 1]);
    } else {
      try {
        const urlObj = new URL(cleanedUrl);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        pathParts.shift();
        blobName = decodeURIComponent(pathParts.join('/'));
      } catch {
        blobName = cleanedUrl;
      }
    }

    if (!blobName) {
      return NextResponse.json({ error: 'Could not extract valid blob name from the URL.' }, { status: 400 });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const succeeded = await blockBlobClient.deleteIfExists();

    return NextResponse.json({
      success: succeeded,
      message: succeeded ? 'Blob deleted successfully.' : 'Blob did not exist or was already deleted.',
    });
  } catch (error: any) {
    console.error('[AZURE_MEDIA_DELETE_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete file from Azure.' },
      { status: 500 }
    );
  }
}
