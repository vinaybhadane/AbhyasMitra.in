'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { getAllPosts, deletePost } from '@/lib/firestore';
import { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filtered, setFiltered] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    let result = posts;
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    if (search) result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.subject.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [posts, search, statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllPosts();
      setPosts(data);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Posts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{posts.length} total posts</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-4 w-24 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No posts found.</p>
            <Link href="/admin/posts/new" className="text-indigo-600 hover:underline text-sm mt-2 block">Create your first post</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Views</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((post) => {
                  const date = post.createdAt instanceof Date ? post.createdAt : (post.createdAt as any)?.toDate?.();
                  return (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{post.title}</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{post.subject}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{date ? formatDate(date) : '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                          <Eye className="w-3.5 h-3.5" />{post.views || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {post.status === 'published' && (
                            <Link
                              href={`/${post.slug}`}
                              target="_blank"
                              className="icon-btn text-gray-400 hover:text-indigo-600"
                              title="View post"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="icon-btn text-gray-400 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="icon-btn text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
