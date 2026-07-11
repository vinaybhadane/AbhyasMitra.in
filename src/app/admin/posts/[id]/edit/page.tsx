'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Eye, Tag, Link2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getPost, updatePost, getUnitsBySubject, countWords, getCustomSubjects } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { SUBJECTS, Post, SubjectUnit } from '@/lib/types';
import { generateExcerpt } from '@/lib/utils';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/ImageUploader';
import slugify from 'slugify';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false });

const MIN_WORDS = 300;

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [units, setUnits] = useState<SubjectUnit[]>([]);
  const [form, setForm] = useState({
    title: '', content: '', featuredImage: '', tags: '',
    subject: '', unit: '', year: '1st' as '1st' | '2nd' | '3rd' | '4th',
    metaTitle: '', metaDescription: '', keywords: '',
    status: 'draft' as 'draft' | 'published',
    customSlug: '', // post part only
  });

  // Load post
  useEffect(() => {
    if (!id) return;
    getPost(id).then((p) => {
      if (p) {
        setPost(p);
        // Extract post slug part (after subject/)
        const slugParts = p.slug?.split('/') || [];
        const postSlugPart = slugParts.length > 1 ? slugParts[slugParts.length - 1] : p.slug;
        setForm({
          title: p.title, content: p.content, featuredImage: p.featuredImage,
          tags: p.tags.join(', '), subject: p.subject, unit: p.unit || '',
          year: p.year, metaTitle: p.metaTitle, metaDescription: p.metaDescription,
          keywords: p.keywords, status: p.status, customSlug: postSlugPart,
        });
      }
    }).catch(() => toast.error('Failed to load post')).finally(() => setLoading(false));
  }, [id]);

  const [customSubjects, setCustomSubjects] = useState<any[]>([]);

  useEffect(() => {
    getCustomSubjects().then((list) => {
      const mapped = list.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        year: s.year,
        semester: s.semesterLabel,
        description: s.description,
        icon: null,
        color: s.color,
        iconColor: s.iconColor,
        branch: s.branch,
      }));
      setCustomSubjects(mapped);
    }).catch(console.error);
  }, []);

  const BRANCH_LABELS: Record<string, string> = {
    'first-year': 'First Year (FE)',
    'computer':   'Computer Engineering',
    'it':         'Information Technology',
    'ai-ds':      'AI & Data Science',
    'mechanical': 'Mechanical Engineering',
    'electrical': 'Electrical Engineering',
    'civil':      'Civil Engineering',
    'entc':       'Electronics & Telecomm.',
  };

  // Load units when subject changes
  useEffect(() => {
    if (!form.subject) { setUnits([]); return; }
    const all = [...SUBJECTS, ...customSubjects];
    const subjectObj = all.find(s => s.name === form.subject);
    if (!subjectObj) return;
    getUnitsBySubject(subjectObj.slug).then(setUnits).catch(() => setUnits([]));
  }, [form.subject, customSubjects]);

  // Slug preview
  const subjectSlugPart = useMemo(
    () => {
      if (!form.subject) return 'subject';
      const all = [...SUBJECTS, ...customSubjects];
      const match = all.find(s => s.name === form.subject);
      return match ? match.slug : slugify(form.subject, { lower: true, strict: true });
    },
    [form.subject, customSubjects]
  );
  const postSlugPart = useMemo(() => {
    const base = form.customSlug.trim() || form.title;
    return base ? slugify(base, { lower: true, strict: true }) : 'post-url';
  }, [form.customSlug, form.title]);
  const slugPreview = `${subjectSlugPart}/${postSlugPart}`;

  const wordCount = useMemo(() => countWords(form.content), [form.content]);
  const wordCountOk = wordCount >= MIN_WORDS;

  const handleSave = async (status: 'draft' | 'published') => {
    if (!id || !form.title.trim() || !form.subject) {
      toast.error('Title and subject are required');
      return;
    }
    if (status === 'published' && !wordCountOk) {
      toast.error(`Warning: Content is short (${wordCount} words). Recommended minimum is ${MIN_WORDS} for SEO.`);
    }
    setSaving(true);
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const excerpt = generateExcerpt(form.content);
      await updatePost(
        id,
        {
          title: form.title, content: form.content, excerpt,
          featuredImage: form.featuredImage, tags, category: form.subject,
          subject: form.subject, unit: form.unit, year: form.year,
          metaTitle: form.metaTitle || form.title,
          metaDescription: form.metaDescription || excerpt,
          keywords: form.keywords, status,
        },
        form.customSlug.trim() || undefined
      );
      toast.success(status === 'published' ? 'Published!' : 'Draft saved!');
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
            <Eye className="w-4 h-4" /> {saving ? 'Saving...' : 'Update & Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Main Editor ── */}
        <div className="xl:col-span-2 space-y-5">
          <input
            type="text"
            placeholder="Post Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-5 py-4 text-xl font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
            {(['content', 'seo'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
              >
                {tab === 'seo' ? 'SEO' : 'Content'}
              </button>
            ))}
          </div>

          {activeTab === 'content' ? (
            <>
              <RichEditor content={form.content} onChange={(c) => setForm({ ...form, content: c })} />
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${wordCountOk ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'}`}>
                {wordCountOk ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{wordCount} words {!wordCountOk && `(${MIN_WORDS - wordCount} more needed)`}</span>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              {[
                { id: 'metaTitle', label: 'Meta Title', placeholder: 'SEO title (50–60 chars)', value: form.metaTitle, maxLen: 60 },
                { id: 'metaDescription', label: 'Meta Description', placeholder: 'SEO description (150–160 chars)', value: form.metaDescription, maxLen: 160 },
                { id: 'keywords', label: 'Keywords', placeholder: 'keyword1, keyword2, keyword3', value: form.keywords, maxLen: 0 },
              ].map(({ id: fieldId, label, placeholder, value, maxLen }) => (
                <div key={fieldId}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    {maxLen > 0 && <span className={`text-xs ${value.length > maxLen ? 'text-red-500' : 'text-gray-400'}`}>{value.length}/{maxLen}</span>}
                  </div>
                  {fieldId === 'metaDescription' ? (
                    <textarea value={value} onChange={(e) => setForm({ ...form, [fieldId]: e.target.value })} placeholder={placeholder} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  ) : (
                    <input type="text" value={value} onChange={(e) => setForm({ ...form, [fieldId]: e.target.value })} placeholder={placeholder} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Subject, Year & Unit */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold mb-4">Subject & Unit</h3>
            <div className="space-y-3">
              <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value as '1st' | '2nd' | '3rd' | '4th', subject: '', unit: '' })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100">
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, unit: '' })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100">
                <option value="">Select subject</option>
                {Object.entries(BRANCH_LABELS).map(([branchKey, branchName]) => {
                  const branchSubjects = [...SUBJECTS, ...customSubjects].filter(
                    (s) => s.year === form.year && (s.branch === branchKey || (!s.branch && (s.year === '1st' ? 'first-year' : 'computer') === branchKey))
                  );
                  if (branchSubjects.length === 0) return null;
                  return (
                    <optgroup key={branchKey} label={branchName}>
                      {branchSubjects.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              {form.subject && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Unit / Chapter</label>
                  {units.length === 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                      No units yet. Add from Admin → Units.
                    </p>
                  ) : (
                    <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">No unit (Uncategorized)</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Custom Slug */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Link2 className="w-4 h-4" /> URL Slug
            </h3>
            <p className="text-xs text-gray-400 mb-3">Editing will change the public URL.</p>
            <input
              type="text"
              value={form.customSlug}
              onChange={(e) => setForm({ ...form, customSlug: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <div className="mt-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono break-all">/{slugPreview}</p>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold mb-4">Featured Image</h3>
            <ImageUploader value={form.featuredImage} onChange={(url) => setForm({ ...form, featuredImage: url })} folder="posts" />
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</h3>
            <input type="text" placeholder="tag1, tag2, tag3" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* SEO Checklist */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">SEO Checklist</h3>
            <ul className="space-y-1.5 text-xs">
              {[
                { label: `Title (${form.title.length} chars)`, ok: form.title.length >= 30 },
                { label: `Meta title (${form.metaTitle.length}/60)`, ok: form.metaTitle.length >= 30 && form.metaTitle.length <= 60 },
                { label: `Meta desc (${form.metaDescription.length}/160)`, ok: form.metaDescription.length >= 100 },
                { label: `Keywords added`, ok: form.keywords.trim().length > 0 },
                { label: `Tags (≥2)`, ok: form.tags.split(',').filter(t => t.trim()).length >= 2 },
                { label: `Words ≥ ${MIN_WORDS} (${wordCount})`, ok: wordCountOk },
                { label: `Featured image`, ok: !!form.featuredImage },
              ].map(({ label, ok }) => (
                <li key={label} className={`flex items-center gap-2 ${ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${ok ? '' : 'opacity-30'}`} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Update buttons */}
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
