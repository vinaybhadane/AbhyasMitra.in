'use client';

import { useState, useEffect } from 'react';
import { BookMarked, Plus, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { getUnitsBySubject, createUnit, updateUnit, deleteUnit } from '@/lib/firestore';
import { SUBJECTS, SubjectUnit } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminUnitsPage() {
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState('');
  const [units, setUnits] = useState<SubjectUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const selectedSubject = SUBJECTS.find(s => s.slug === selectedSubjectSlug);

  useEffect(() => {
    if (!selectedSubjectSlug) { setUnits([]); return; }
    setLoading(true);
    getUnitsBySubject(selectedSubjectSlug)
      .then(setUnits)
      .catch(() => toast.error('Failed to load units'))
      .finally(() => setLoading(false));
  }, [selectedSubjectSlug]);

  const handleAdd = async () => {
    if (!newUnitName.trim() || !selectedSubjectSlug) return;
    setAdding(true);
    try {
      await createUnit({
        subjectSlug: selectedSubjectSlug,
        name: newUnitName.trim(),
        order: units.length + 1,
      });
      toast.success('Unit added!');
      setNewUnitName('');
      const updated = await getUnitsBySubject(selectedSubjectSlug);
      setUnits(updated);
    } catch {
      toast.error('Failed to add unit');
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateUnit(id, { name: editName.trim() });
      setUnits(units.map(u => u.id === id ? { ...u, name: editName.trim() } : u));
      setEditingId(null);
      toast.success('Unit updated!');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete unit "${name}"? Posts in this unit will become Uncategorized.`)) return;
    try {
      await deleteUnit(id);
      setUnits(units.filter(u => u.id !== id));
      toast.success('Unit deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-indigo-500" /> Manage Units
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize posts into units/chapters per subject.
          </p>
        </div>
      </div>

      {/* Subject Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Select Subject</label>
        <select
          value={selectedSubjectSlug}
          onChange={(e) => setSelectedSubjectSlug(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Choose a subject --</option>
          {['1st', '2nd'].map(year => (
            <optgroup key={year} label={`${year} Year`}>
              {SUBJECTS.filter(s => s.year === year).map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {selectedSubjectSlug && (
        <>
          {/* Add new unit */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Add Unit to: <span className="text-indigo-600 dark:text-indigo-400">{selectedSubject?.name}</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Unit 1: Differential Equations"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAdd}
                disabled={adding || !newUnitName.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Press Enter or click Add. Units are shown in order added.</p>
          </div>

          {/* Units list */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Units ({units.length})
              </h3>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
              </div>
            ) : units.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No units yet. Add your first unit above.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {units.map((unit, idx) => (
                  <li key={unit.id} className="flex items-center gap-3 px-5 py-3">
                    <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {editingId === unit.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(unit.id)}
                        autoFocus
                        className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-indigo-300 dark:border-indigo-600 rounded-lg text-sm focus:outline-none"
                      />
                    ) : (
                      <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{unit.name}</span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      {editingId === unit.id ? (
                        <>
                          <button onClick={() => handleEdit(unit.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(unit.id); setEditName(unit.name); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(unit.id, unit.name)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
