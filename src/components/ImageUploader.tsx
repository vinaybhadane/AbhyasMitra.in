'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { uploadImage } from '@/lib/firestore';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  maxSizeMB?: number;
}

export default function ImageUploader({ 
  value, 
  onChange, 
  folder = 'images',
  label = 'Click to upload image',
  maxSizeMB = 1
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // SEO Friendly Image processing and compression
      const options = {
        maxSizeMB: maxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp' as const,
      };

      const compressed = await imageCompression(file, options);

      // Force explicit webp MIME type — browser-image-compression may return
      // a blob with the original type on some browsers
      const webpBlob = compressed.type === 'image/webp'
        ? compressed
        : new Blob([compressed], { type: 'image/webp' });
      const compressedFile = new File([webpBlob], compressed.name || 'image.webp', { type: 'image/webp' });

      // Ensure SEO friendly filename
      const cleanName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[.-]|[.-]$/g, '');

      const nameWithoutExt = cleanName.replace(/\.[^.]+$/, '');
      const fileName = `${nameWithoutExt}-${Date.now()}.webp`;

      const url = await uploadImage(compressedFile, `${folder}/${fileName}`);
      onChange(url);
      toast.success('Image optimized and uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to process/upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <img src={value} alt="Uploaded preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600 dark:hover:border-indigo-500'}`}>
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Optimizing & Uploading...</p>
                <p className="text-xs text-gray-500 mt-1">Converting to WebP ({maxSizeMB}MB max)</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-xs text-gray-500 mt-1">Auto-compressed to WebP under {maxSizeMB}MB for SEO</p>
              </div>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleUpload} 
            disabled={uploading} 
          />
        </label>
      )}
      
      {/* URL Fallback */}
      <div className="mt-3">
         <input
           type="url"
           placeholder="Or paste an image URL..."
           value={value}
           onChange={(e) => onChange(e.target.value)}
           className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
         />
      </div>
    </div>
  );
}
