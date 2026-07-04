'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown, ChevronRight, Image as ImageIcon, PlusCircle,
  Check, X, Loader2, BookOpen, Layers,
} from 'lucide-react';
import { getAllBrowseConfigs, upsertBrowseConfig, BrowseConfig } from '@/lib/firestore';
import { SUBJECTS } from '@/lib/types';
import toast from 'react-hot-toast';

// ─── Static data matching the homepage BRANCHES ───────────────────────────────
const BRANCHES = [
  { id: 'first-year', label: '1st Year Engineering', years: [] },
  { id: 'computer',   label: 'Computer Engineering',   years: ['2nd', '3rd', '4th'] },
  { id: 'it',         label: 'Information Technology',  years: ['2nd', '3rd', '4th'] },
  { id: 'ai-ds',      label: 'AI & Data Science',       years: ['2nd', '3rd', '4th'] },
  { id: 'mechanical', label: 'Mechanical Engineering',  years: ['2nd', '3rd', '4th'] },
  { id: 'electrical', label: 'Electrical Engineering',  years: ['2nd', '3rd', '4th'] },
  { id: 'civil',      label: 'Civil Engineering',       years: ['2nd', '3rd', '4th'] },
  { id: 'entc',       label: 'Electronics & Telecomm.', years: ['2nd', '3rd', '4th'] },
];

// Get subjects from SUBJECTS data (only 1st and 2nd year currently populated)
function getSubjectsForBranchYear(branchId: string, year: string) {
  if (branchId === 'first-year') {
    return SUBJECTS.filter(s => s.year === '1st');
  }
  if (branchId === 'computer' && year === '2nd') {
    return SUBJECTS.filter(s => s.year === '2nd');
  }
  return [];
}

// ─── Image URL Editor ─────────────────────────────────────────────────────────
function ImageUrlEditor({
  configId,
  label,
  initialUrl,
  onSaved,
}: {
  configId: string;
  label: string;
  initialUrl: string;
  onSaved: (url: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await upsertBrowseConfig(configId, url.trim());
      onSaved(url.trim());
      setEditing(false);
      toast.success(`Image saved for ${label}`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-start gap-3 mt-2">
      {/* Preview thumbnail */}
      {url && !editing ? (
        <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
          <Image src={url} alt={label} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-14 h-10 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {editing ? (
        <div className="flex-1 flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://... paste image URL"
            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            autoFocus
          />
          <button
            onClick={save}
            disabled={saving}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { setEditing(false); setUrl(initialUrl); }}
            className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {url ? 'Change background image' : 'Set background image'}
        </button>
      )}
    </div>
  );
}

// ─── Subject Row ──────────────────────────────────────────────────────────────
function SubjectRow({
  subject,
  configId,
  configs,
  onConfigSaved,
}: {
  subject: { id: string; name: string; slug: string; icon: React.ReactNode };
  configId: string;
  configs: Map<string, string>;
  onConfigSaved: (id: string, url: string) => void;
}) {
  return (
    <div className="pl-6 py-3 border-l-2 border-indigo-100 dark:border-indigo-900 ml-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-base">{subject.icon}</span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{subject.name}</span>
        </div>
        <Link
          href={`/admin/posts/new?subject=${encodeURIComponent(subject.name)}`}
          className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" /> New Note
        </Link>
      </div>
      <ImageUrlEditor
        configId={configId}
        label={subject.name}
        initialUrl={configs.get(configId) ?? ''}
        onSaved={url => onConfigSaved(configId, url)}
      />
    </div>
  );
}

// ─── Year Row ─────────────────────────────────────────────────────────────────
function YearRow({
  branchId,
  year,
  configs,
  onConfigSaved,
}: {
  branchId: string;
  year: string;
  configs: Map<string, string>;
  onConfigSaved: (id: string, url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const yearConfigId = `${branchId}/${year}`;
  const subjects = getSubjectsForBranchYear(branchId, year);

  return (
    <div className="ml-5 border-l-2 border-purple-100 dark:border-purple-900 pl-4 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 w-full text-left"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Layers className="w-4 h-4 opacity-50" />
        {year} Year
        {subjects.length > 0 && (
          <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{subjects.length} subjects</span>
        )}
      </button>
      <ImageUrlEditor
        configId={yearConfigId}
        label={`${year} Year`}
        initialUrl={configs.get(yearConfigId) ?? ''}
        onSaved={url => onConfigSaved(yearConfigId, url)}
      />

      {open && (
        <div className="mt-3 space-y-2">
          {subjects.length > 0 ? subjects.map(s => (
            <SubjectRow
              key={s.id}
              subject={s as { id: string; name: string; slug: string; icon: React.ReactNode }}
              configId={`${branchId}/${year}/${s.slug}`}
              configs={configs}
              onConfigSaved={onConfigSaved}
            />
          )) : (
            <p className="pl-6 text-xs text-gray-400 italic">No subjects configured for this year yet</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Branch Row ───────────────────────────────────────────────────────────────
function BranchRow({
  branch,
  configs,
  onConfigSaved,
}: {
  branch: typeof BRANCHES[0];
  configs: Map<string, string>;
  onConfigSaved: (id: string, url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const subjects = branch.id === 'first-year' ? getSubjectsForBranchYear('first-year', '') : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
      {/* Branch header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="flex-1 font-semibold text-gray-900 dark:text-gray-100">{branch.label}</span>
        <span className="text-xs text-gray-400 mr-2">{branch.id}</span>
        {open ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>

      {/* Branch-level image */}
      <ImageUrlEditor
        configId={branch.id}
        label={branch.label}
        initialUrl={configs.get(branch.id) ?? ''}
        onSaved={url => onConfigSaved(branch.id, url)}
      />

      {/* Expanded content */}
      {open && (
        <div className="mt-4 space-y-3">
          {/* 1st Year: show subjects directly */}
          {branch.id === 'first-year' ? (
            <div>
              {subjects.map(s => (
                <SubjectRow
                  key={s.id}
                  subject={s as { id: string; name: string; slug: string; icon: React.ReactNode }}
                  configId={`first-year/${s.slug}`}
                  configs={configs}
                  onConfigSaved={onConfigSaved}
                />
              ))}
            </div>
          ) : (
            // Other branches: years then subjects
            branch.years.map(year => (
              <YearRow
                key={year}
                branchId={branch.id}
                year={year}
                configs={configs}
                onConfigSaved={onConfigSaved}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminBrowsePage() {
  const [configs, setConfigs] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBrowseConfigs()
      .then(all => {
        const map = new Map<string, string>();
        all.forEach(c => { if (c.bgImageUrl) map.set(c.id, c.bgImageUrl); });
        setConfigs(map);
      })
      .catch(() => toast.error('Failed to load config'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (id: string, url: string) => {
    setConfigs(prev => {
      const next = new Map(prev);
      next.set(id, url);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Browse Manager</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set background images for branches, years, and subjects. Use any public image URL.
        </p>
      </div>

      <div className="space-y-4">
        {BRANCHES.map(branch => (
          <BranchRow
            key={branch.id}
            branch={branch}
            configs={configs}
            onConfigSaved={handleSaved}
          />
        ))}
      </div>
    </div>
  );
}
