'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, Mail, Eye, TrendingUp, PlusCircle, BarChart3 } from 'lucide-react';
import { getAllPosts, getAllComments, getContactMessages } from '@/lib/firestore';
import { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ totalViews: 0, comments: 0, messages: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, commentsData, messagesData] = await Promise.all([
          getAllPosts(),
          getAllComments(),
          getContactMessages(),
        ]);
        setPosts(postsData);
        setStats({
          totalViews: postsData.reduce((sum, p) => sum + (p.views || 0), 0),
          comments: commentsData.length,
          messages: messagesData.length,
          unreadMessages: messagesData.filter((m) => !m.read).length,
        });
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status === 'draft');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back! Here&apos;s an overview.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Posts', value: posts.length, sub: `${publishedPosts.length} published, ${draftPosts.length} drafts`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Eye, label: 'Total Views', value: stats.totalViews.toLocaleString(), sub: 'Across all posts', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: MessageSquare, label: 'Comments', value: stats.comments, sub: 'From readers', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Mail, label: 'Messages', value: stats.messages, sub: `${stats.unreadMessages} unread`, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Posts</h2>
          <Link href="/admin/posts" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {posts.slice(0, 5).map((post) => {
            const date = post.createdAt instanceof Date ? post.createdAt : (post.createdAt as any)?.toDate?.();
            return (
              <div key={post.id} className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{post.subject}</span>
                    {date && <span>{formatDate(date)}</span>}
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {post.status}
                  </span>
                  <Link href={`/admin/posts/${post.id}/edit`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Edit</Link>
                </div>
              </div>
            );
          })}
          {posts.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No posts yet. <Link href="/admin/posts/new" className="text-indigo-600 hover:underline">Create your first post</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { href: '/admin/posts/new', icon: PlusCircle, label: 'New Post', color: 'bg-indigo-600 text-white' },
          { href: '/admin/browse', icon: BarChart3, label: 'Browse Manager', color: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700' },
          { href: '/admin/comments', icon: MessageSquare, label: 'View Comments', color: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700' },
          { href: '/admin/messages', icon: Mail, label: 'View Messages', color: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700' },
          { href: '/', icon: Eye, label: 'View Site', color: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-2 px-4 py-5 rounded-2xl text-sm font-medium transition-all hover:shadow-md ${color}`}
          >
            <Icon className="w-6 h-6" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
