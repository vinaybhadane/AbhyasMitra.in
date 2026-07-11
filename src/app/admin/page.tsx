'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, Mail, Eye, PlusCircle, BarChart3, Bell } from 'lucide-react';
import { 
  getAllPosts, 
  getAllComments, 
  getContactMessages, 
  getNotifications, 
  createNotification, 
  deleteNotification,
  Notification 
} from '@/lib/firestore';
import { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({ totalViews: 0, comments: 0, messages: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);
  
  // New notification form states
  const [newNotif, setNewNotif] = useState({ title: '', content: '', link: '' });
  const [addingNotif, setAddingNotif] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, commentsData, messagesData, notifsData] = await Promise.all([
          getAllPosts(),
          getAllComments(),
          getContactMessages(),
          getNotifications(20),
        ]);
        setPosts(postsData);
        setNotifications(notifsData);
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

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotif.title.trim() || !newNotif.content.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setAddingNotif(true);
    try {
      await createNotification(
        newNotif.title.trim(),
        newNotif.content.trim(),
        newNotif.link.trim()
      );
      toast.success('Notification posted!');
      setNewNotif({ title: '', content: '', link: '' });
      const updated = await getNotifications(20);
      setNotifications(updated);
    } catch {
      toast.error('Failed to post notification');
    } finally {
      setAddingNotif(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

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

      {/* Main Sections side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Posts</h2>
            <Link href="/admin/posts" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 flex-1 overflow-y-auto max-h-[500px]">
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

        {/* Notifications Manager */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Latest Notifications Manager</h2>
          </div>
          
          <form onSubmit={handleAddNotification} className="space-y-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Title *</label>
              <input
                type="text"
                value={newNotif.title}
                onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                placeholder="e.g. Unit 4 notes uploaded!"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Message / Content *</label>
              <textarea
                value={newNotif.content}
                onChange={(e) => setNewNotif({ ...newNotif, content: e.target.value })}
                placeholder="e.g. Added comprehensive unit 4 notes with past papers."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Link (Optional)</label>
              <input
                type="text"
                value={newNotif.link}
                onChange={(e) => setNewNotif({ ...newNotif, link: e.target.value })}
                placeholder="e.g. /browse/computer"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={addingNotif}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {addingNotif ? 'Posting...' : 'Share Update / Notification'}
            </button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-1">
            {notifications.map((n) => {
              const date = n.createdAt instanceof Date ? n.createdAt : (n.createdAt as any)?.toDate?.();
              return (
                <div key={n.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{n.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{n.content}</p>
                    {n.link && <p className="text-[10px] text-indigo-500 hover:underline mt-1 truncate">{n.link}</p>}
                    {date && <p className="text-[9px] text-gray-400 mt-1">{formatDate(date)}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteNotification(n.id)}
                    className="text-xs text-red-500 hover:underline shrink-0 self-start cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-6">No notifications posted yet.</div>
            )}
          </div>
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
