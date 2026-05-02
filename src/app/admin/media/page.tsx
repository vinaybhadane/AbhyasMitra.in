'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, Copy, Trash2, Link } from 'lucide-react';
import { uploadImage, deleteImage } from '@/lib/firestore';
import toast from 'react-hot-toast';

interface UploadedImage {
  name: string;
  url: string;
  path: string;
  size: string;
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploadedFiles: UploadedImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }
      try {
        const path = `media/${Date.now()}_${file.name}`;
        const url = await uploadImage(file, path);
        uploadedFiles.push({
          name: file.name,
          url,
          path,
          size: `${(file.size / 1024).toFixed(0)} KB`,
        });
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setImages((prev) => [...uploadedFiles, ...prev]);
    if (uploadedFiles.length > 0) toast.success(`Uploaded ${uploadedFiles.length} image(s)`);
    setUploading(false);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const handleDelete = async (img: UploadedImage) => {
    if (!confirm(`Delete ${img.name}?`)) return;
    try {
      await deleteImage(img.path);
      setImages((prev) => prev.filter((i) => i.path !== img.path));
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Media Library</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload and manage images for your posts</p>
      </div>

      {/* Upload Zone */}
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
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${uploading ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <Upload className={`w-8 h-8 ${uploading ? 'animate-bounce text-indigo-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              {uploading ? 'Uploading...' : 'Drag & drop images here'}
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
          <p className="text-xs text-gray-400">JPG, PNG, WebP — max 5MB each</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
        <Link className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">How to use uploaded images</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            After uploading, copy the URL and paste it into the featured image field when creating or editing a post. You can also use it inside the rich editor with the image button.
          </p>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Recently Uploaded ({images.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div key={i} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">{img.name}</p>
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
      )}

      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No images uploaded yet. Upload images to use in your posts.</p>
        </div>
      )}
    </div>
  );
}
