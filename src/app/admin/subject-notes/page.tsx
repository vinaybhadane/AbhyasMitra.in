'use client';

import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Save, FileDown, ArrowRight } from 'lucide-react';
import { getCustomSubjects, getSubjectNotes, saveSubjectNotes, SubjectNoteUnit, uploadImage } from '@/lib/firestore';
import { SUBJECTS } from '@/lib/types';
import toast from 'react-hot-toast';

const BRANCH_OPTIONS = [
  { id: 'first-year', label: '1st Year Engineering (FE)' },
  { id: 'computer',   label: 'Computer Engineering' },
  { id: 'it',         label: 'Information Technology' },
  { id: 'ai-ds',      label: 'AI & Data Science' },
  { id: 'mechanical', label: 'Mechanical Engineering' },
  { id: 'electrical', label: 'Electrical Engineering' },
  { id: 'civil',      label: 'Civil Engineering' },
  { id: 'entc',       label: 'Electronics & Telecomm.' },
];

const YEAR_OPTIONS = [
  { id: '1st', label: '1st Year (FE)' },
  { id: '2nd', label: '2nd Year (SE)' },
  { id: '3rd', label: '3rd Year (TE)' },
  { id: '4th', label: '4th Year (BE)' },
];

export default function SubjectNotesManagerPage() {
  const [customSubjects, setCustomSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Filter selections
  const [selectedBranch, setSelectedBranch] = useState('computer');
  const [selectedYear, setSelectedYear]     = useState('2nd');
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState('');

  // Active notes units list
  const [units, setUnits] = useState<SubjectNoteUnit[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNotes, setSavingNotes]   = useState(false);

  // New unit input form
  const [newUnitNo, setNewUnitNo] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newDownloadUrl, setNewDownloadUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const cleanName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[.-]|[.-]$/g, '');

      const ext = cleanName.split('.').pop() || '';
      const nameWithoutExt = cleanName.replace(/\.[^.]+$/, '');
      const path = ext === 'pdf' ? `pdfs/${nameWithoutExt}-${Date.now()}.pdf` : `media/${nameWithoutExt}-${Date.now()}.${ext}`;

      const url = await uploadImage(file, path);
      setNewDownloadUrl(url);

      if (!newUnitName) {
        const friendlyName = nameWithoutExt
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        setNewUnitName(friendlyName);
      }
      toast.success('File uploaded successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  // 1. Fetch subjects
  useEffect(() => {
    setLoadingSubjects(true);
    getCustomSubjects()
      .then(list => setCustomSubjects(list))
      .catch(() => toast.error('Failed to load subjects'))
      .finally(() => setLoadingSubjects(false));
  }, []);

  // 2. Computed list of filtered subjects
  const filteredSubjects = useMemo(() => {
    // Combine static and custom
    const all = [
      ...SUBJECTS.map(s => ({
        ...s,
        branch: s.year === '1st' ? 'first-year' : 'computer',
      })),
      ...customSubjects,
    ];

    return all.filter(
      s => s.branch === selectedBranch && s.year === selectedYear
    );
  }, [customSubjects, selectedBranch, selectedYear]);

  // 3. Reset subject slug when filters change
  useEffect(() => {
    setSelectedSubjectSlug('');
    setUnits([]);
  }, [selectedBranch, selectedYear]);

  // 4. Fetch existing subject notes when selected subject changes
  useEffect(() => {
    if (!selectedSubjectSlug) {
      setUnits([]);
      return;
    }

    setLoadingNotes(true);
    getSubjectNotes(selectedSubjectSlug)
      .then(doc => {
        if (doc && doc.units) {
          setUnits(doc.units);
        } else {
          setUnits([]);
        }
      })
      .catch(() => toast.error('Failed to fetch subject notes'))
      .finally(() => setLoadingNotes(false));
  }, [selectedSubjectSlug]);

  const activeSubjectName = useMemo(() => {
    const match = filteredSubjects.find(s => s.slug === selectedSubjectSlug);
    return match ? match.name : '';
  }, [selectedSubjectSlug, filteredSubjects]);

  // 5. Add temporary note unit row
  const handleAddUnit = () => {
    if (!newUnitNo.trim()) {
      toast.error('Please enter a Unit No. (e.g. Unit 1)');
      return;
    }
    if (!newUnitName.trim()) {
      toast.error('Please enter a Unit Name');
      return;
    }
    if (!newDownloadUrl.trim()) {
      toast.error('Please enter a Download URL');
      return;
    }

    const row: SubjectNoteUnit = {
      unitNo: newUnitNo.trim(),
      unitName: newUnitName.trim(),
      downloadUrl: newDownloadUrl.trim(),
    };

    setUnits(prev => [...prev, row]);
    setNewUnitNo('');
    setNewUnitName('');
    setNewDownloadUrl('');
    toast.success('Added row to list. Remember to Save Changes!');
  };

  // 6. Delete row
  const handleDeleteRow = (index: number) => {
    setUnits(prev => prev.filter((_, i) => i !== index));
  };

  // 7. Save to Firestore
  const handleSaveChanges = async () => {
    if (!selectedSubjectSlug) return;
    setSavingNotes(true);
    try {
      await saveSubjectNotes(selectedSubjectSlug, units);
      toast.success('Subject notes updated successfully!');
    } catch {
      toast.error('Failed to save subject notes');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileDown className="w-7 h-7 text-indigo-600" /> Add Notes to Subjects
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Attach direct downloadable PDF note links (e.g., syllabus files, PYQs, unit materials) to subjects.
        </p>
      </div>

      {/* Cascading Filter Controls */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">1. Select Branch</label>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="w-full text-sm px-3.5 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
          >
            {BRANCH_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">2. Select Year</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full text-sm px-3.5 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
          >
            {YEAR_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">3. Select Subject</label>
          {loadingSubjects ? (
            <div className="flex items-center gap-2 py-3 px-1 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Loading subjects...
            </div>
          ) : filteredSubjects.length === 0 ? (
            <select disabled className="w-full text-sm px-3.5 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 cursor-not-allowed">
              <option>No subjects found for selection</option>
            </select>
          ) : (
            <select
              value={selectedSubjectSlug}
              onChange={e => setSelectedSubjectSlug(e.target.value)}
              className="w-full text-sm px-3.5 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Choose a subject --</option>
              {filteredSubjects.map(sub => (
                <option key={sub.slug} value={sub.slug}>{sub.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Workspace (Visible only when subject is selected) */}
      {selectedSubjectSlug && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notes editor form */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm h-fit space-y-4">
            <h2 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Add Notes Row
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Unit Number</label>
                <input
                  type="text"
                  value={newUnitNo}
                  onChange={e => setNewUnitNo(e.target.value)}
                  placeholder="e.g. Unit 1, Unit 2, Syllabus, PYQs"
                  className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Unit / Material Name</label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={e => setNewUnitName(e.target.value)}
                  placeholder="e.g. Direct Current Circuits & AC"
                  className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Download Link (PDF URL)</label>
                <input
                  type="text"
                  value={newDownloadUrl}
                  onChange={e => setNewDownloadUrl(e.target.value)}
                  placeholder="e.g. https://abhyasmitra.in/media/pdfs/..."
                  className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 mb-2"
                />
                
                <div className="relative border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">
                      {uploadingFile ? 'Uploading note file...' : 'Or upload document file directly:'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm shrink-0 flex items-center gap-1">
                    {uploadingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> : <Plus className="w-3.5 h-3.5" />}
                    Choose File
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddUnit}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Row to List
              </button>
            </div>
          </div>

          {/* Current list preview & submit */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Notes Rows for: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{activeSubjectName}</span>
              </h2>
              <button
                onClick={handleSaveChanges}
                disabled={savingNotes}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                {savingNotes ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                Save Changes
              </button>
            </div>

            {loadingNotes ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading notes list...</p>
              </div>
            ) : units.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No downloadable notes added yet. Use the sidebar to add note rows!</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                        <th className="px-6 py-4">Unit No.</th>
                        <th className="px-6 py-4">Unit Name</th>
                        <th className="px-6 py-4 max-w-[200px] truncate">Link</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-600 dark:text-gray-300">
                      {units.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{row.unitNo}</td>
                          <td className="px-6 py-4">{row.unitName}</td>
                          <td className="px-6 py-4 max-w-[200px] truncate font-mono text-xs text-gray-400 dark:text-gray-500">{row.downloadUrl}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteRow(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                              title="Remove Note Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

