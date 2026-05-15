'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Eye, Upload, X, Tag, Info } from 'lucide-react';
import { createPost } from '@/lib/firestore';
import { uploadImage } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { SUBJECTS } from '@/lib/types';
import { generateExcerpt } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/ImageUploader';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });

interface PostFormData {
  title: string;
  content: string;
  featuredImage: string;
  tags: string;
  subject: string;
  year: '1st' | '2nd';
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  status: 'draft' | 'published';
}

export default function NewPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<PostFormData>({
    title: '',
    content: '',
    featuredImage: '',
    tags: '',
    subject: '',
    year: '1st',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    status: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  const handleSave = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content || form.content === '<p></p>') { toast.error('Content is required'); return; }
    if (!form.subject) { toast.error('Please select a subject'); return; }
    if (!user) return;

    setSaving(true);
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const excerpt = generateExcerpt(form.content);
      await createPost({
        title: form.title,
        content: form.content,
        excerpt,
        featuredImage: form.featuredImage,
        tags,
        category: form.subject,
        subject: form.subject,
        year: form.year,
        metaTitle: form.metaTitle || form.title,
        metaDescription: form.metaDescription || excerpt,
        keywords: form.keywords || tags.join(', '),
        author: user.displayName || 'AbhyasMitra',
        authorEmail: user.email || '',
        publishDate: new Date(),
        status,
      });
      toast.success(status === 'published' ? 'Post published!' : 'Draft saved!');
      router.push('/admin/posts');
    } catch {
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Post</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="xl:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Post Title (SEO friendly, include keywords...)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-5 py-4 text-xl font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'content' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'seo' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              SEO Settings
            </button>
          </div>

          {activeTab === 'content' ? (
            <RichEditor content={form.content} onChange={(c) => setForm({ ...form, content: c })} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 mb-2">
                <Info className="w-4 h-4" />
                <p>These settings help your post rank on Google.</p>
              </div>
              {[
                { id: 'metaTitle', label: 'Meta Title', placeholder: 'SEO title (50-60 chars)', value: form.metaTitle, hint: `${form.metaTitle.length}/60` },
                { id: 'metaDescription', label: 'Meta Description', placeholder: 'SEO description (150-160 chars)', value: form.metaDescription, hint: `${form.metaDescription.length}/160` },
                { id: 'keywords', label: 'Keywords', placeholder: 'keyword1, keyword2, keyword3', value: form.keywords, hint: '' },
              ].map(({ id, label, placeholder, value, hint }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                  {id === 'metaDescription' ? (
                    <textarea
                      value={value}
                      onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                      placeholder={placeholder}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                  {hint && <p className="text-xs text-gray-400 mt-1 text-right">{hint}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Subject */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Subject & Year</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Year</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value as '1st' | '2nd', subject: '' })}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Subject *</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select subject</option>
                  {SUBJECTS.filter((s) => s.year === form.year).map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Featured Image</h3>
            <ImageUploader
              value={form.featuredImage}
              onChange={(url) => setForm({ ...form, featuredImage: url })}
              folder="posts"
            />
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags
            </h3>
            <input
              type="text"
              placeholder="tag1, tag2, tag3 (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {form.tags && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.tags.split(',').filter((t) => t.trim()).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Publish</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
