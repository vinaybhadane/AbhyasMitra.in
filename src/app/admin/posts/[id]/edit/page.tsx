'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Eye, Upload, X, Tag } from 'lucide-react';
import { getPost, updatePost, uploadImage } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { SUBJECTS, Post } from '@/lib/types';
import { generateExcerpt } from '@/lib/utils';
import toast from 'react-hot-toast';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [form, setForm] = useState({
    title: '', content: '', featuredImage: '', tags: '',
    subject: '', year: '1st' as '1st' | '2nd', metaTitle: '',
    metaDescription: '', keywords: '', status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const p = await getPost(id);
        if (p) {
          setPost(p);
          setForm({
            title: p.title, content: p.content, featuredImage: p.featuredImage,
            tags: p.tags.join(', '), subject: p.subject, year: p.year,
            metaTitle: p.metaTitle, metaDescription: p.metaDescription,
            keywords: p.keywords, status: p.status,
          });
        }
      } catch {
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, `posts/${Date.now()}_${file.name}`);
      setForm((prev) => ({ ...prev, featuredImage: url }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!id || !form.title.trim() || !form.subject) {
      toast.error('Title and subject are required');
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const excerpt = generateExcerpt(form.content);
      await updatePost(id, {
        title: form.title, content: form.content, excerpt,
        featuredImage: form.featuredImage, tags, category: form.subject,
        subject: form.subject, year: form.year, metaTitle: form.metaTitle || form.title,
        metaDescription: form.metaDescription || excerpt, keywords: form.keywords,
        status,
      });
      toast.success(status === 'published' ? 'Post published!' : 'Draft saved!');
      router.push('/admin/posts');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton h-96 rounded-2xl" />;
  if (!post) return <p className="text-gray-500">Post not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Post</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave('draft')} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
            <Eye className="w-4 h-4" /> {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          <input
            type="text"
            placeholder="Post Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-5 py-4 text-xl font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
            <button onClick={() => setActiveTab('content')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'content' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>Content</button>
            <button onClick={() => setActiveTab('seo')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'seo' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>SEO</button>
          </div>
          {activeTab === 'content' ? (
            <RichEditor content={form.content} onChange={(c) => setForm({ ...form, content: c })} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              {[
                { id: 'metaTitle', label: 'Meta Title', placeholder: 'SEO title (50-60 chars)', value: form.metaTitle },
                { id: 'metaDescription', label: 'Meta Description', placeholder: 'SEO description', value: form.metaDescription },
                { id: 'keywords', label: 'Keywords', placeholder: 'keyword1, keyword2', value: form.keywords },
              ].map(({ id, label, placeholder, value }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                  {id === 'metaDescription' ? (
                    <textarea value={value} onChange={(e) => setForm({ ...form, [id]: e.target.value })} placeholder={placeholder} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  ) : (
                    <input type="text" value={value} onChange={(e) => setForm({ ...form, [id]: e.target.value })} placeholder={placeholder} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold mb-4">Subject & Year</h3>
            <div className="space-y-3">
              <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value as '1st' | '2nd', subject: '' })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
              </select>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select subject</option>
                {SUBJECTS.filter((s) => s.year === form.year).map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold mb-4">Featured Image</h3>
            {form.featuredImage ? (
              <div className="relative">
                <img src={form.featuredImage} alt="Featured" className="w-full h-36 object-cover rounded-xl" />
                <button onClick={() => setForm({ ...form, featuredImage: '' })} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-indigo-400">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload image'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
            <input type="url" placeholder="Or paste image URL" value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} className="mt-3 w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</h3>
            <input type="text" placeholder="tag1, tag2, tag3" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold mb-4">Update</h3>
            <div className="space-y-2">
              <button onClick={() => handleSave('draft')} disabled={saving} className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Save Draft</button>
              <button onClick={() => handleSave('published')} disabled={saving} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Update & Publish'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
