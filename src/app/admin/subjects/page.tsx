'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Pencil, X, Zap } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader';
import { getCustomSubjects, createCustomSubject, deleteCustomSubject, updateCustomSubject, CustomSubjectDoc } from '@/lib/firestore';
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
  { id: 'sem1', label: 'Semester 1' }, { id: 'sem2', label: 'Semester 2' },
  { id: 'sem3', label: 'Semester 3' }, { id: 'sem4', label: 'Semester 4' },
  { id: 'sem5', label: 'Semester 5' }, { id: 'sem6', label: 'Semester 6' },
  { id: 'sem7', label: 'Semester 7 (Locked)' }, { id: 'sem8', label: 'Semester 8 (Locked)' },
];

const ICONS = [
  'BookOpen', 'Cpu', 'Database', 'Binary', 'Radio', 'Layers', 'Settings',
  'FlaskConical', 'Telescope', 'Calculator', 'Ruler', 'Code2', 'GitBranch',
  'Sigma', 'Microscope', 'Atom', 'Network', 'CircuitBoard', 'Wrench', 'BarChart3',
];

const COLOR_PRESETS = [
  { value: 'from-blue-600 to-cyan-600',       label: 'Blue/Cyan',       hex: '#2563eb' },
  { value: 'from-indigo-500 to-purple-600',   label: 'Indigo/Purple',   hex: '#6366f1' },
  { value: 'from-green-500 to-teal-600',      label: 'Green/Teal',      hex: '#0d9488' },
  { value: 'from-orange-400 to-pink-500',     label: 'Orange/Pink',     hex: '#ea580c' },
  { value: 'from-rose-500 to-pink-600',       label: 'Rose/Pink',       hex: '#e11d48' },
  { value: 'from-amber-500 to-orange-600',    label: 'Amber/Orange',    hex: '#d97706' },
  { value: 'from-violet-500 to-purple-700',   label: 'Violet/Purple',   hex: '#7c3aed' },
  { value: 'from-emerald-500 to-green-700',   label: 'Emerald/Green',   hex: '#059669' },
  { value: 'from-sky-500 to-blue-700',        label: 'Sky/Blue',        hex: '#0284c7' },
  { value: 'from-fuchsia-500 to-pink-700',    label: 'Fuchsia/Pink',    hex: '#c026d3' },
  { value: 'from-lime-500 to-green-600',      label: 'Lime/Green',      hex: '#65a30d' },
  { value: 'from-gray-600 to-slate-700',      label: 'Gray/Slate',      hex: '#475569' },
];

function buildSemesterLabel(year: string, branch: string, semester: string): string {
  const yrPrefix = year === '1st' ? 'FE' : year === '2nd' ? 'SE' : year === '3rd' ? 'TE' : 'BE';
  const branchCode =
    branch === 'first-year' ? '' :
    branch === 'computer'   ? 'Comp' :
    branch === 'it'         ? 'IT' :
    branch === 'ai-ds'      ? 'AIDS' :
    branch === 'civil'      ? 'Civil' :
    branch === 'electrical' ? 'Elec' :
    branch === 'mechanical' ? 'Mech' :
    branch === 'entc'       ? 'ENTC' : branch.toUpperCase();
  const semNum = semester.replace('sem', '');
  return `${yrPrefix} ${branchCode} Sem ${semNum}`.replace(/\s+/g, ' ').trim();
}

const BLANK = {
  name: '', branch: 'computer', year: '2nd', semester: 'sem3',
  description: '', iconName: 'BookOpen', colorIndex: 0, bannerUrl: '',
};

export default function AdminSubjectsPage() {
  const [subjects, setSubjects]       = useState<CustomSubjectDoc[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [editTarget, setEditTarget]   = useState<CustomSubjectDoc | null>(null);
  const [searchQ, setSearchQ]         = useState('');
  const [name, setName]               = useState(BLANK.name);
  const [branch, setBranch]           = useState(BLANK.branch);
  const [year, setYear]               = useState(BLANK.year);
  const [semester, setSemester]       = useState(BLANK.semester);
  const [description, setDescription] = useState(BLANK.description);
  const [iconName, setIconName]       = useState(BLANK.iconName);
  const [colorIndex, setColorIndex]   = useState(BLANK.colorIndex);
  const [bannerUrl, setBannerUrl]     = useState(BLANK.bannerUrl);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try { setSubjects(await getCustomSubjects()); }
    catch { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setName(BLANK.name); setBranch(BLANK.branch); setYear(BLANK.year);
    setSemester(BLANK.semester); setDescription(BLANK.description);
    setIconName(BLANK.iconName); setColorIndex(BLANK.colorIndex); setBannerUrl(BLANK.bannerUrl);
  };

  const openEdit = (sub: CustomSubjectDoc) => {
    setEditTarget(sub);
    setName(sub.name); setBranch(sub.branch); setYear(sub.year);
    setSemester(sub.semester); setDescription(sub.description || '');
    setIconName(sub.iconName || 'BookOpen');
    const ci = COLOR_PRESETS.findIndex(c => c.value === sub.color);
    setColorIndex(ci >= 0 ? ci : 0);
    setBannerUrl(sub.bannerUrl || '');
  };

  const closeEdit = () => { setEditTarget(null); resetForm(); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const activeColor   = COLOR_PRESETS[colorIndex];
      const semesterLabel = buildSemesterLabel(year, branch, semester);
      const slug          = editTarget ? editTarget.slug : slugify(name, { lower: true, strict: true });
      if (editTarget) {
        await updateCustomSubject(editTarget.id, { name: name.trim(), branch, year: year as any, semester, semesterLabel, description: description.trim(), iconName, color: activeColor.value, iconColor: activeColor.hex, bannerUrl: bannerUrl.trim(), slug });
        toast.success(`"${name}" updated!`);
        setSubjects(prev => prev.map(s => s.id === editTarget.id ? { ...s, name: name.trim(), branch, year: year as any, semester, semesterLabel, description: description.trim(), iconName, color: activeColor.value, iconColor: activeColor.hex, bannerUrl: bannerUrl.trim() } : s));
        closeEdit();
      } else {
        await createCustomSubject({ name: name.trim(), slug, branch, year: year as any, semester, semesterLabel, description: description.trim(), iconName, color: activeColor.value, iconColor: activeColor.hex, bannerUrl: bannerUrl.trim() });
        toast.success(`Subject "${name}" added!`);
        resetForm(); fetchSubjects();
      }
    } catch { toast.error(editTarget ? 'Failed to update subject' : 'Failed to add subject'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (sub: CustomSubjectDoc) => {
    if (!confirm(`Delete "${sub.name}"?`)) return;
    try {
      await deleteCustomSubject(sub.id, sub.branch, sub.semester, sub.slug);
      toast.success(`"${sub.name}" deleted.`);
      setSubjects(prev => prev.filter(s => s.id !== sub.id));
    } catch { toast.error('Failed to delete subject'); }
  };

  const filteredSubjects = subjects.filter(s =>
    !searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.semesterLabel?.toLowerCase().includes(searchQ.toLowerCase()) ||
    (BRANCH_OPTIONS.find(b => b.id === s.branch)?.label || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Subjects Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Add, edit, or remove subjects visible on the live website.</p>
        </div>
        <Link href="/admin/subjects/seed" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
          <Zap className="w-4 h-4" /> Seed All SPPU Subjects
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {editTarget ? <><Pencil className="w-5 h-5 text-amber-500" /> Edit Subject</> : <><Plus className="w-5 h-5 text-indigo-600" /> Add Subject</>}
            </h2>
            {editTarget && (
              <button onClick={closeEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Subject Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Theory of Computation" required className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400" />
              {editTarget && <p className="text-[10px] text-gray-400 mt-1 font-mono">slug: {editTarget.slug}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Branch</label>
                <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100">
                  {BRANCH_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Year</label>
                <select value={year} onChange={e => setYear(e.target.value)} className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100">
                  {YEAR_OPTIONS.map(yr => <option key={yr} value={yr}>{yr} Year</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Semester</label>
              <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100">
                {SEMESTER_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief summary…" rows={2} className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Icon</label>
                <select value={iconName} onChange={e => setIconName(e.target.value)} className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100">
                  {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Color</label>
                <select value={colorIndex} onChange={e => setColorIndex(Number(e.target.value))} className="w-full text-sm px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100">
                  {COLOR_PRESETS.map((c, i) => <option key={c.value} value={i}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${COLOR_PRESETS[colorIndex].value} flex items-center justify-center text-white shrink-0`}>
                {getLucideIcon(iconName)}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Preview</span>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Banner Image</label>
              <ImageUploader value={bannerUrl} onChange={setBannerUrl} folder="subjects" label="Upload Subject Banner" />
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editTarget ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editTarget ? 'Save Changes' : 'Create Subject'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" /> All Subjects
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">{subjects.length}</span>
            </h2>
            <input type="search" placeholder="Search…" value={searchQ} onChange={e => setSearchQ(e.target.value)} className="text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 w-48" />
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading subjects…</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400 text-sm">{searchQ ? 'No subjects match your search.' : 'No subjects yet — add one or use Seed All.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-screen overflow-y-auto pr-1">
              {filteredSubjects.map(sub => {
                const branchName = BRANCH_OPTIONS.find(b => b.id === sub.branch)?.label || sub.branch;
                const isEditing  = editTarget?.id === sub.id;
                return (
                  <div key={sub.id} className={`bg-white dark:bg-gray-800 border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all ${isEditing ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-200 dark:ring-amber-900/40' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sub.color} flex items-center justify-center text-white shrink-0`}>
                            {getLucideIcon(sub.iconName)}
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 leading-tight">{sub.name}</h3>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">slug: {sub.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => isEditing ? closeEdit() : openEdit(sub)} className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20'}`} title={isEditing ? 'Cancel Edit' : 'Edit Subject'}>
                            {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(sub)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">{sub.description || 'No description.'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{branchName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">{sub.semesterLabel}</span>
                      {sub.bannerUrl && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">📸 Banner</span>}
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
