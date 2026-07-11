'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Loader2 } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import { getCustomSubjects, createCustomSubject, deleteCustomSubject, CustomSubjectDoc } from '@/lib/firestore';
import { getLucideIcon } from '@/lib/types';
import toast from 'react-hot-toast';
import slugify from 'slugify';

const BRANCH_OPTIONS = [
  { id: 'first-year', label: '1st Year Engineering' },
  { id: 'computer',   label: 'Computer Engineering' },
  { id: 'it',         label: 'Information Technology' },
  { id: 'ai-ds',      label: 'AI & Data Science' },
  { id: 'mechanical', label: 'Mechanical Engineering' },
  { id: 'electrical', label: 'Electrical Engineering' },
  { id: 'civil',      label: 'Civil Engineering' },
  { id: 'entc',       label: 'Electronics & Telecomm.' },
];

const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th'];

const SEMESTER_OPTIONS = [
  { id: 'sem1', label: 'Semester 1' },
  { id: 'sem2', label: 'Semester 2' },
  { id: 'sem3', label: 'Semester 3' },
  { id: 'sem4', label: 'Semester 4' },
  { id: 'sem5', label: 'Semester 5' },
  { id: 'sem6', label: 'Semester 6' },
  { id: 'sem7', label: 'Semester 7 (Locked)' },
  { id: 'sem8', label: 'Semester 8 (Locked)' },
];

const ICONS = ['BookOpen', 'Cpu', 'Database', 'Binary', 'Radio', 'Layers', 'Settings', 'FlaskConical', 'Telescope', 'Calculator', 'Ruler'];

const COLOR_PRESETS = [
  { value: 'from-blue-600 to-cyan-600', label: 'Blue Gradient', hex: '#2563eb' },
  { value: 'from-indigo-500 to-purple-600', label: 'Indigo/Purple Gradient', hex: '#6366f1' },
  { value: 'from-green-500 to-teal-600', label: 'Green/Teal Gradient', hex: '#0d9488' },
  { value: 'from-orange-400 to-pink-500', label: 'Orange/Pink Gradient', hex: '#ea580c' },
  { value: 'from-gray-600 to-slate-700', label: 'Gray/Slate Gradient', hex: '#475569' },
  { value: 'from-rose-500 to-pink-600', label: 'Rose Gradient', hex: '#e11d48' },
];

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<CustomSubjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('computer');
  const [year, setYear] = useState('2nd');
  const [semester, setSemester] = useState('sem3');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('BookOpen');
  const [colorIndex, setColorIndex] = useState(0);
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const list = await getCustomSubjects();
      setSubjects(list);
    } catch (e) {
      toast.error('Failed to load custom subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const slug = slugify(name, { lower: true, strict: true });
      const activeColor = COLOR_PRESETS[colorIndex];

      // Auto format standard semesterLabel e.g. "SE Comp Sem 3"
      const yrPrefix = year === '1st' ? 'FE' : year === '2nd' ? 'SE' : year === '3rd' ? 'TE' : 'BE';
      const branchCode = branch === 'first-year' ? '' : branch === 'computer' ? 'Comp' : branch.toUpperCase();
      const semNum = semester.replace('sem', '');
      const semesterLabel = `${yrPrefix} ${branchCode} Sem ${semNum}`.replace(/\s+/g, ' ').trim();

      await createCustomSubject({
        name: name.trim(),
        slug,
        branch,
        year: year as any,
        semester,
        semesterLabel,
        description: description.trim(),
        iconName,
        color: activeColor.value,
        iconColor: activeColor.hex,
        bannerUrl: bannerUrl.trim(),
      });

      toast.success(`Subject "${name}" added successfully!`);
      // Reset form
      setName('');
      setDescription('');
      setBannerUrl('');
      fetchSubjects();
    } catch (e) {
      toast.error('Failed to add custom subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (sub: CustomSubjectDoc) => {
    if (!confirm(`Are you sure you want to delete the subject "${sub.name}"?`)) return;

    try {
      await deleteCustomSubject(sub.id, sub.branch, sub.semester, sub.slug);
      toast.success(`Subject "${sub.name}" deleted.`);
      setSubjects((prev) => prev.filter((item) => item.id !== sub.id));
    } catch {
      toast.error('Failed to delete subject');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Subjects Manager</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Add custom subjects under specific branches, semesters, and years, with direct banner uploads.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Subject Form */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Add Custom Subject
          </h2>

          <form onSubmit={handleAddSubject} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Subject Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Theory of Computation"
                className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-450"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                >
                  {BRANCH_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                >
                  {YEAR_OPTIONS.map((yr) => (
                    <option key={yr} value={yr}>{yr} Year</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem.id} value={sem.id}>{sem.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief summary of the syllabus topics..."
                rows={2}
                className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-450"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Icon Shape</label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                >
                  {ICONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Color Palette</label>
                <select
                  value={colorIndex}
                  onChange={(e) => setColorIndex(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                >
                  {COLOR_PRESETS.map((col, idx) => (
                    <option key={col.value} value={idx}>{col.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Subject Banner Image</label>
              <ImageUploader
                value={bannerUrl}
                onChange={setBannerUrl}
                folder="subjects"
                label="Upload Subject Banner"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Subject
            </button>
          </form>
        </div>

        {/* Subjects List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" /> Existing Custom Subjects
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading custom subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No custom subjects added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((sub) => {
                const branchName = BRANCH_OPTIONS.find((b) => b.id === sub.branch)?.label || sub.branch;
                return (
                  <div
                    key={sub.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sub.color} flex items-center justify-center text-white shrink-0`}>
                            {getLucideIcon(sub.iconName)}
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{sub.name}</h3>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">slug: {sub.slug}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSubject(sub)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors shrink-0"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">{sub.description || 'No description provided.'}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {branchName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        {sub.semesterLabel}
                      </span>
                      {sub.bannerUrl && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          📸 Banner Set
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
