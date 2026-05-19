'use client';

import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 ml-auto text-indigo-600 dark:text-indigo-400 hover:underline"
    >
      <Share2 className="w-4 h-4" /> Share
    </button>
  );
}
