'use client';

import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import GridCard from '@/components/GridCard';

interface SemItem {
  id: string;
  label: string;
  badge: string;
  locked?: boolean;
  gradientIndex: number;
}

interface SemesterGridProps {
  branch: string;
  semesters: SemItem[];
  configsMap: Record<string, string>;
}

export default function SemesterGrid({ branch, semesters, configsMap }: SemesterGridProps) {
  const handleLockedClick = (semLabel: string) => {
    toast(`${semLabel} is coming soon!`, {
      icon: '🔒',
      style: {
        borderRadius: '14px',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
      },
    });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {semesters.map((sem) => {
        const bgImg = configsMap[`${branch}/${sem.id}`];
        if (sem.locked) {
          return (
            <div
              key={sem.id}
              onClick={() => handleLockedClick(sem.label)}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] p-5 flex flex-col justify-between border border-gray-100 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/40 opacity-70 cursor-pointer group hover:scale-[1.01] hover:border-gray-200 transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {sem.badge}
                </span>
                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-700 dark:text-gray-300 leading-tight">
                  {sem.label}
                </h3>
                <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-wider">Coming Soon</p>
              </div>
            </div>
          );
        }

        return (
          <GridCard
            key={sem.id}
            title={sem.label}
            href={`/browse/${branch}/${sem.id}`}
            gradientIndex={sem.gradientIndex}
            badge={sem.badge}
            bgImageUrl={bgImg}
          />
        );
      })}
    </div>
  );
}
