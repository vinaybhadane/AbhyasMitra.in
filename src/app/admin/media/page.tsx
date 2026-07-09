'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, Copy, Trash2, Link, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { uploadImage, deleteImage } from '@/lib/firestore';
import toast from 'react-hot-toast';

interface UploadedImage {
  name: string;
  url: string;
  path: string;
  size: string;
  type?: string;
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (res.ok) {
        setImages(data.files || []);
        setIsConfigured(true);
      } else {
        if (data.error && data.error.includes('connection string')) {
          setIsConfigured(false);
        } else {
          toast.error(data.error || 'Failed to load media library');
        }
      }
    } catch {
      toast.error('Error connecting to Azure storage API');
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploadedFiles: UploadedImage[] = [];
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      
      if (!isImage && !isPdf) {
        toast.error(`${file.name} is not supported. Use JPG, PNG, WebP or PDF.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }
      try {
        const folder = isPdf ? 'pdfs' : 'media';
        const path = `${folder}/${Date.now()}_${file.name}`;
        const url = await uploadImage(file, path);
        uploadedFiles.push({
          name: file.name,
          url,
          path,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          type: file.type || (isPdf ? 'application/pdf' : 'image/webp')
        });
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message || ''}`);
      }
    }

    setImages((prev) => [...uploadedFiles, ...prev]);
    if (uploadedFiles.length > 0) toast.success(`Uploaded ${uploadedFiles.length} file(s)`);
    setUploading(false);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const handleDelete = async (img: UploadedImage) => {
    if (!confirm(`Delete ${img.name}?`)) return;
    try {
      await deleteImage(img.url);
      setImages((prev) => prev.filter((i) => i.path !== img.path));
      toast.success('File deleted');
    } catch {
      toast.error('Failed to delete file');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Media Library</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload and manage images and PDFs for your website</p>
      </div>

      {/* Azure Storage Config Warning */}
      {!isConfigured && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Azure Storage Connection Required</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Please paste your connection string inside the `AZURE_STORAGE_CONNECTION_STRING` variable in your `abhyasmitra/.env.local` file to enable file uploads and database synchronization.
            </p>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {isConfigured && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleUpload(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${uploading ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <Upload className={`w-8 h-8 ${uploading ? 'animate-bounce text-indigo-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                {uploading ? 'Uploading...' : 'Drag & drop images or PDFs here'}
              </p>
              <p className="text-sm text-gray-400 mt-1">or</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-400">JPG, PNG, WebP, PDF — max 10MB each</p>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
        <Link className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">How to use uploaded assets</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            After uploading, copy the URL and paste it into the featured image field when creating a post. For PDFs, copy the URL to hyperlink them as download attachments inside the post content editor.
          </p>
        </div>
      </div>

      {/* Image / File Grid */}
      {loadingMedia ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Retrieving library files from Azure...</p>
        </div>
      ) : images.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Azure Storage Media ({images.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div key={i} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="relative aspect-square bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center">
                  {img.type === 'application/pdf' || img.path.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 mb-2">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-red-500">PDF Document</span>
                    </div>
                  ) : (
                    <Image
                      src={img.url}
                      alt={img.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium" title={img.name}>{img.name}</p>
                  <p className="text-xs text-gray-400">{img.size}</p>
                </div>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopyUrl(img.url)}
                    className="w-9 h-9 bg-white rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(img)}
                    className="w-9 h-9 bg-white rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No files uploaded to Azure Blob Storage yet.</p>
        </div>
      )}
    </div>
  );
}
