'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, MessageSquare, Reply } from 'lucide-react';
import { getAllComments, deleteComment } from '@/lib/firestore';
import { Comment } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getAllComments();
      setComments(data);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Comments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{comments.length} total comments</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No comments yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {comments.map((comment) => {
            const date = comment.createdAt instanceof Date ? comment.createdAt : (comment.createdAt as any)?.toDate?.();
            return (
              <div key={comment.id} className="flex gap-4 p-5">
                {comment.authorPhotoURL ? (
                  <Image src={comment.authorPhotoURL} alt={comment.authorName} width={40} height={40} className="rounded-full shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                    {comment.authorName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{comment.authorName}</span>
                      <span className="text-xs text-gray-400">{comment.authorEmail}</span>
                      {date && <span className="text-xs text-gray-400">{formatDate(date)}</span>}
                      {comment.parentId && (
                        <span className="flex items-center gap-1 text-xs text-indigo-500"><Reply className="w-3 h-3" /> Reply</span>
                      )}
                    </div>
                    <button onClick={() => handleDelete(comment.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                  <p className="text-xs text-gray-400 mt-1">Post ID: {comment.postId}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
