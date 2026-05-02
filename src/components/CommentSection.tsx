'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Send, MessageSquare, Reply, Trash2, LogIn, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCommentsByPost, addComment, deleteComment } from '@/lib/firestore';
import { Comment } from '@/lib/types';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, isAdminUser, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getCommentsByPost(postId);
      setComments(data);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!content.trim() || content.trim().length < 3) {
      toast.error('Comment must be at least 3 characters');
      return;
    }
    if (content.trim().length > 1000) {
      toast.error('Comment is too long (max 1000 characters)');
      return;
    }
    setSubmitting(true);
    try {
      await addComment({
        postId,
        parentId: replyTo?.id || null,
        content: content.trim(),
        authorName: user.displayName || 'Anonymous',
        authorEmail: user.email || '',
        authorPhotoURL: user.photoURL || '',
        userId: user.uid,
      });
      setContent('');
      setReplyTo(null);
      await fetchComments();
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  // Build nested comment tree
  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <section className="mt-12" aria-label="Comments">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-indigo-600" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {user ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          {replyTo && (
            <div className="flex items-center justify-between mb-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Replying to <strong>{replyTo.authorName}</strong>
              </p>
              <button onClick={() => setReplyTo(null)} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
            </div>
          )}
          <div className="flex gap-3">
            {user.photoURL ? (
              <Image src={user.photoURL} alt="Your avatar" width={40} height={40} className="rounded-full shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex-1 space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{content.length}/1000</span>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mb-8 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">Sign in to join the discussion</p>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            <LogIn className="w-4 h-4" /> Sign in with Google
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              user={user}
              isAdminUser={isAdminUser}
              onReply={setReplyTo}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  replies,
  user,
  isAdminUser,
  onReply,
  onDelete,
}: {
  comment: Comment;
  replies: Comment[];
  user: ReturnType<typeof useAuth>['user'];
  isAdminUser: boolean;
  onReply: (c: Comment) => void;
  onDelete: (id: string) => void;
}) {
  const date = comment.createdAt instanceof Date
    ? comment.createdAt
    : (comment.createdAt as any)?.toDate?.();
  const canDelete = isAdminUser || user?.uid === comment.userId;

  return (
    <div className="flex gap-3">
      {comment.authorPhotoURL ? (
        <Image src={comment.authorPhotoURL} alt={comment.authorName} width={40} height={40} className="rounded-full shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {comment.authorName[0]?.toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{comment.authorName}</span>
              {date && <span className="text-xs text-gray-400 ml-2">{formatDate(date)}</span>}
            </div>
            {canDelete && (
              <button onClick={() => onDelete(comment.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete comment">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
        </div>
        {user && (
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 mt-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors px-2"
          >
            <Reply className="w-3.5 h-3.5" /> Reply
          </button>
        )}
        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]}
                user={user}
                isAdminUser={isAdminUser}
                onReply={onReply}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
