import { Metadata } from 'next';
import Image from 'next/image';
import { Download, FileText, Calendar, GraduationCap, ShieldCheck, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SPPU 2024 Pattern Syllabus PDF Download – All Engineering Branches',
  description: 'Download the official SPPU 2024 Pattern Syllabus PDF for First Year (FE), Second Year (SE), and Third Year (TE) Engineering. Access latest course structures for Computer, IT, AI&DS, Mechanical, Civil, Electrical, and E&TC.',
  keywords: 'sppu 2024 pattern syllabus, sppu engineering syllabus pdf, first year engineering syllabus sppu 2024, computer engineering syllabus sppu 2024, mechanical engineering syllabus sppu, civil engineering syllabus sppu, electrical syllabus sppu 2024, entc syllabus sppu, sppu 2024 pattern pdf, pune university engineering syllabus',
};

export default function SyllabusPage() {
  const feSyllabus = [
    { srNo: 1, branch: 'All Branches (Common for First Year)', href: '#' }
  ];

  const branches = [
    { name: 'Computer Engineering', href: '#' },
    { name: 'Information Technology', href: '#' },
    { name: 'Artificial Intelligence and Data Science', href: '#' },
    { name: 'Mechanical Engineering', href: '#' },
    { name: 'Electrical Engineering', href: '#' },
    { name: 'Civil Engineering', href: '#' },
    { name: 'Electronics and Telecommunication', href: '#' }
  ];

  const tags = [
    'SPPU 2024 Pattern', 'Syllabus PDF', 'Pune University', 'Engineering Syllabus',
    'FE Syllabus', 'SE Syllabus', 'TE Syllabus', 'Computer Engineering Syllabus',
    'IT Syllabus', 'AI & DS Syllabus', 'Mechanical Syllabus', 'Electrical Syllabus',
    'Civil Syllabus', 'E&TC Syllabus', 'SPPU 2024 Syllabus Download'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 uppercase tracking-wider mb-4">
            🎓 Academic Syllabus
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
            SPPU <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">2024 Pattern</span> Syllabus
          </h1>
          <p className="text-base sm:text-lg text-gray-650 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Download the official and updated Savitribai Phule Pune University (SPPU) 2024 Pattern engineering course structures and subject syllabus PDFs.
          </p>
        </div>

        {/* ── 1. First Year (FE) 2024 ── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 sm:p-8 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">FE 2024 Pattern</h2>
                <p className="text-xs text-gray-500">First Year Engineering Syllabus</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                  <th className="py-3.5 px-4 w-20">Sr No</th>
                  <th className="py-3.5 px-4">Branch / Stream</th>
                  <th className="py-3.5 px-4 text-right w-40">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                {feSyllabus.map((item) => (
                  <tr key={item.srNo} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-450">{item.srNo}</td>
                    <td className="py-4 px-4 font-bold text-gray-850 dark:text-gray-200">{item.branch}</td>
                    <td className="py-4 px-4 text-right">
                      <a href={item.href} className="inline-flex items-center hover:scale-105 transition-transform duration-200 py-1">
                        <Image
                          src="/downloadpng.png"
                          alt="Download PDF"
                          width={180}
                          height={42}
                          className="h-10 w-auto object-contain rounded-lg"
                        />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. Second Year (SE) 2024 ── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 sm:p-8 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">SE 2024 Pattern</h2>
                <p className="text-xs text-gray-500">Second Year Engineering Syllabus</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                  <th className="py-3.5 px-4 w-20">Sr No</th>
                  <th className="py-3.5 px-4">Branch / Stream</th>
                  <th className="py-3.5 px-4 text-right w-40">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                {branches.map((b, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-450">{index + 1}</td>
                    <td className="py-4 px-4 font-bold text-gray-850 dark:text-gray-200">{b.name}</td>
                    <td className="py-4 px-4 text-right">
                      <a href={b.href} className="inline-flex items-center hover:scale-105 transition-transform duration-200 py-1">
                        <Image
                          src="/downloadpng.png"
                          alt="Download PDF"
                          width={140}
                          height={42}
                          className="h-10 w-auto object-contain rounded-lg"
                        />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. Third Year (TE) 2024 ── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 sm:p-8 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">TE 2024 Pattern</h2>
                <p className="text-xs text-gray-500">Third Year Engineering Syllabus</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                  <th className="py-3.5 px-4 w-20">Sr No</th>
                  <th className="py-3.5 px-4">Branch / Stream</th>
                  <th className="py-3.5 px-4 text-right w-40">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                {branches.map((b, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-450">{index + 1}</td>
                    <td className="py-4 px-4 font-bold text-gray-850 dark:text-gray-200">{b.name}</td>
                    <td className="py-4 px-4 text-right">
                      <a href={b.href} className="inline-flex items-center hover:scale-105 transition-transform duration-200 py-1">
                        <Image
                          src="/downloadpng.png"
                          alt="Download PDF"
                          width={140}
                          height={42}
                          className="h-10 w-auto object-contain rounded-lg"
                        />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Tags / Keywords Section ── */}
        <div className="bg-gray-100 dark:bg-gray-850 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-extrabold text-gray-750 dark:text-gray-300 uppercase tracking-wider">Syllabus Tags &amp; Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-350 rounded-xl shadow-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
