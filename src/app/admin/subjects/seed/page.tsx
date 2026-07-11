'use client';

import { useState } from 'react';
import { Loader2, Zap, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { createCustomSubject, getCustomSubjects } from '@/lib/firestore';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import rawSubjects from '@/data/sppu_subjects.json';

// ── Mappings ────────────────────────────────────────────────────────────────

const BRANCH_MAP: Record<string, string> = {
  'Common (All Branches)':                        'first-year',
  'Computer Engineering':                          'computer',
  'Information Technology':                        'it',
  'Artificial Intelligence & Data Science':        'ai-ds',
  'Civil Engineering':                             'civil',
  'Electrical Engineering':                        'electrical',
  'Mechanical Engineering':                        'mechanical',
  'Electronics & Telecommunication Engineering':  'entc',
};

const YEAR_MAP: Record<string, '1st' | '2nd' | '3rd' | '4th'> = {
  'FE': '1st',
  'SE': '2nd',
  'TE': '3rd',
  'BE': '4th',
};

const SEM_MAP: Record<number, string> = {
  1: 'sem1', 2: 'sem2', 3: 'sem3',
  4: 'sem4', 5: 'sem5', 6: 'sem6',
  7: 'sem7', 8: 'sem8',
};

// Icon pool — cycles deterministically
const ICON_POOL = [
  'BookOpen', 'Cpu', 'Database', 'Binary', 'Radio',
  'Layers', 'Settings', 'FlaskConical', 'Telescope', 'Calculator',
  'Ruler', 'Code2', 'GitBranch', 'Sigma', 'Microscope',
  'Atom', 'Network', 'CircuitBoard', 'Wrench', 'BarChart3',
];

// Color pool — cycles deterministically
const COLOR_POOL = [
  { value: 'from-blue-600 to-cyan-600',       hex: '#2563eb' },
  { value: 'from-indigo-500 to-purple-600',   hex: '#6366f1' },
  { value: 'from-green-500 to-teal-600',      hex: '#0d9488' },
  { value: 'from-orange-400 to-pink-500',     hex: '#ea580c' },
  { value: 'from-rose-500 to-pink-600',       hex: '#e11d48' },
  { value: 'from-amber-500 to-orange-600',    hex: '#d97706' },
  { value: 'from-violet-500 to-purple-700',   hex: '#7c3aed' },
  { value: 'from-emerald-500 to-green-700',   hex: '#059669' },
  { value: 'from-sky-500 to-blue-700',        hex: '#0284c7' },
  { value: 'from-fuchsia-500 to-pink-700',    hex: '#c026d3' },
  { value: 'from-lime-500 to-green-600',      hex: '#65a30d' },
  { value: 'from-gray-600 to-slate-700',      hex: '#475569' },
];

function buildSemesterLabel(yr: string, branch: string, semNum: number): string {
  const yrPrefix = yr === '1st' ? 'FE' : yr === '2nd' ? 'SE' : yr === '3rd' ? 'TE' : 'BE';
  const branchCode =
    branch === 'first-year' ? '' :
    branch === 'computer'   ? 'Comp' :
    branch === 'it'         ? 'IT' :
    branch === 'ai-ds'      ? 'AIDS' :
    branch === 'civil'      ? 'Civil' :
    branch === 'electrical' ? 'Elec' :
    branch === 'mechanical' ? 'Mech' :
    branch === 'entc'       ? 'ENTC' : branch.toUpperCase();
  return `${yrPrefix} ${branchCode} Sem ${semNum}`.replace(/\s+/g, ' ').trim();
}

interface SeedEntry {
  subject: string;
  branch: string;
  year: string;
  semester: number;
  description: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SeedSubjectsPage() {
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal]      = useState(0);
  const [skipped, setSkipped]  = useState(0);
  const [added, setAdded]      = useState(0);
  const [errors, setErrors]    = useState(0);
  const [done, setDone]        = useState(false);
  const [log, setLog]          = useState<string[]>([]);

  const appendLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 200));

  const handleSeed = async () => {
    if (!confirm(`This will attempt to import ${rawSubjects.length} subjects into Firestore. Duplicates will be skipped. Continue?`)) return;

    setSeeding(true);
    setDone(false);
    setProgress(0);
    setSkipped(0);
    setAdded(0);
    setErrors(0);
    setLog([]);

    const subjects = rawSubjects as SeedEntry[];
    setTotal(subjects.length);

    // Fetch existing slugs to detect duplicates
    let existingSlugs = new Set<string>();
    try {
      const existing = await getCustomSubjects();
      existingSlugs = new Set(existing.map(s => s.slug));
      appendLog(`✓ Found ${existingSlugs.size} existing subjects in Firestore`);
    } catch {
      appendLog('⚠ Could not fetch existing subjects — skipping duplicate check');
    }

    let addedCount   = 0;
    let skippedCount = 0;
    let errorCount   = 0;

    for (let i = 0; i < subjects.length; i++) {
      const entry = subjects[i];
      setProgress(i + 1);

      const branchId = BRANCH_MAP[entry.branch];
      const yearId   = YEAR_MAP[entry.year];
      const semId    = SEM_MAP[entry.semester];

      if (!branchId || !yearId || !semId) {
        appendLog(`⚠ Skipping "${entry.subject}" — unmapped branch/year/sem`);
        skippedCount++;
        setSkipped(skippedCount);
        continue;
      }

      const slug = slugify(entry.subject, { lower: true, strict: true });

      if (existingSlugs.has(slug)) {
        appendLog(`↩ Skip (exists): ${entry.subject}`);
        skippedCount++;
        setSkipped(skippedCount);
        continue;
      }

      const colorObj  = COLOR_POOL[i % COLOR_POOL.length];
      const iconName  = ICON_POOL[i % ICON_POOL.length];
      const semLabel  = buildSemesterLabel(yearId, branchId, entry.semester);

      try {
        await createCustomSubject({
          name: entry.subject,
          slug,
          branch: branchId,
          year: yearId,
          semester: semId,
          semesterLabel: semLabel,
          description: entry.description,
          iconName,
          color: colorObj.value,
          iconColor: colorObj.hex,
          bannerUrl: '',
        });

        existingSlugs.add(slug);
        addedCount++;
        setAdded(addedCount);
        appendLog(`✓ Added: ${entry.subject} [${semLabel}]`);
      } catch (e: unknown) {
        errorCount++;
        setErrors(errorCount);
        const msg = e instanceof Error ? e.message : String(e);
        appendLog(`✗ Error: "${entry.subject}": ${msg}`);
      }

      // Small delay to avoid hammering Firestore rate limits
      await new Promise(r => setTimeout(r, 80));
    }

    setDone(true);
    setSeeding(false);
    toast.success(`Seed complete! Added: ${addedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
  };

  const subjects = rawSubjects as SeedEntry[];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Zap className="w-7 h-7 text-indigo-600" /> Seed SPPU Subjects
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Bulk import all {subjects.length} subjects from the SPPU 2024 pattern JSON into Firestore.
          Existing subjects (matched by slug) are automatically skipped.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Subjects', value: subjects.length, color: 'indigo' },
          { label: 'Added',          value: added,           color: 'emerald' },
          { label: 'Skipped',        value: skipped,         color: 'amber'   },
          { label: 'Errors',         value: errors,          color: 'red'     },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-black text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {seeding && total > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Importing subjects…</span>
            <span className="text-sm font-bold text-indigo-600">{progress} / {total}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{Math.round((progress / total) * 100)}% complete</p>
        </div>
      )}

      {/* Done banner */}
      {done && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Seed complete!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">
              {added} subjects added, {skipped} skipped (already exist), {errors} errors.
            </p>
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2"
      >
        {seeding ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Seeding… ({progress}/{total})</>
        ) : (
          <><Zap className="w-5 h-5" /> Seed All {subjects.length} SPPU Subjects</>
        )}
      </button>

      {/* Live log */}
      {log.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-700 max-h-80 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Live Log (newest first)
          </p>
          {log.map((line, i) => (
            <p key={i} className={`text-xs font-mono leading-6 ${
              line.startsWith('✓') ? 'text-emerald-400' :
              line.startsWith('✗') ? 'text-red-400'     :
              line.startsWith('↩') ? 'text-amber-400'   :
              'text-gray-400'
            }`}>{line}</p>
          ))}
        </div>
      )}

      {/* Help note */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 text-xs text-blue-700 dark:text-blue-400">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">How it works</p>
          <ul className="space-y-1 list-disc list-inside text-blue-600 dark:text-blue-500">
            <li>Each subject gets a unique slug from its name (used as duplicate key)</li>
            <li>Icons and colors are assigned deterministically by position (cycles through {ICON_POOL.length} icons × {COLOR_POOL.length} colors)</li>
            <li>Re-running is safe — duplicates are skipped automatically</li>
            <li>After seeding, subjects appear immediately on the live website</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

