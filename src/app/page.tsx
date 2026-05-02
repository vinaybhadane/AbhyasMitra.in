import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { ArrowRight, BookOpen, Star, Users, Zap, ChevronRight, Target, CheckCircle2, Unlock } from 'lucide-react';
import { Metadata } from 'next';
import { getPublishedPosts, getPostsBySubject } from '@/lib/firestore';
import { SUBJECTS, Post } from '@/lib/types';
import BlogCard from '@/components/BlogCard';

export const metadata: Metadata = {
  title: 'AbhyasMitra – Free SPPU 2024 Pattern Notes & Study Material',
  description:
    'Free notes, solved problems, and study material for SPPU 2024 Pattern engineering students. Covers 1st Year and 2nd Year Computer Engineering subjects.',
  keywords: 'SPPU 2024 pattern notes, engineering notes, first year engineering, computer engineering notes',
};

export const revalidate = 3600; // ISR: revalidate every hour

async function getHomeData() {
  try {
    const { posts } = await getPublishedPosts(6);
    return { posts };
  } catch {
    return { posts: [] };
  }
}

export default async function HomePage() {
  const { posts } = await getHomeData();
  const featuredPosts = posts.slice(0, 3);
  const recentPosts = posts.slice(3, 6);

  const firstYearSubjects = SUBJECTS.filter((s) => s.year === '1st');
  const secondYearSubjects = SUBJECTS.filter((s) => s.year === '2nd');

  return (
    <div className="page-enter">
      {/* ─── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 pt-16 pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-800/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-200/30 dark:bg-purple-800/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800 mb-6">
              <Star className="w-4 h-4" /> SPPU 2024 Pattern Study Material
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Your{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Study Companion
              </span>{' '}
              for Engineering
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
              Free notes, solved problems, and study material for SPPU 2024 Pattern students. 
              Covering 1st Year and 2nd Year Computer Engineering subjects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/subject/engineering-mathematics-2"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
              >
                Start Learning <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
              >
                Search Notes
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
            {[
              { icon: BookOpen, label: 'Subjects', value: '13+' },
              { icon: Users, label: 'Students', value: '10K+' },
              { icon: Zap, label: 'Free Notes', value: '100%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 1st Year Subjects ────────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">First Year Subjects</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">SPPU 2024 Pattern – Semester 1 & 2</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {firstYearSubjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subject/${subject.slug}`}
                className="group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl mb-3 shadow-sm`}>
                  {subject.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">
                  {subject.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2nd Year Subjects ────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Second Year (Computer Engineering)</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">SPPU 2024 Pattern – Semester 3 & 4</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {secondYearSubjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subject/${subject.slug}`}
                className="group flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-xl shrink-0`}>
                  {subject.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                    {subject.name}
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">{subject.year} Year</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Posts ───────────────────────────────────────────────────── */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Notes</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Recently published study material</p>
              </div>
              <Link href="/search" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Why AbhyasMitra ─────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-gray-900 dark:bg-black">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose AbhyasMitra?</h2>
            <p className="text-indigo-200 max-w-2xl mx-auto">
              Designed specifically for SPPU students with exam-focused content and clear explanations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-12 h-12 text-indigo-400" />,
                title: 'SPPU 2024 Pattern',
                desc: 'All content is aligned with the latest SPPU 2024 pattern syllabus.',
              },
              {
                icon: <CheckCircle2 className="w-12 h-12 text-emerald-400" />,
                title: 'Verified Content',
                desc: 'Notes reviewed by engineering students and subject matter experts.',
              },
              {
                icon: <Unlock className="w-12 h-12 text-purple-400" />,
                title: 'Completely Free',
                desc: 'Access all notes, solutions, and study material at zero cost.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-white hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit border border-white/10 shadow-inner">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recent Posts ─────────────────────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">More Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Start Studying Smarter Today
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of SPPU students who use AbhyasMitra to ace their exams.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Contact Us <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
