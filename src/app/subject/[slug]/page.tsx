import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, BookOpen, TrendingUp, CheckCircle2, Layers } from 'lucide-react';
import { getSubjectBySlug, SUBJECTS, Post, SubjectUnit } from '@/lib/types';
import { getPostsBySubject, getUnitsBySubject } from '@/lib/firestore';
import BlogCard from '@/components/BlogCard';
import { generateMetadata as genMeta } from '@/lib/seo';

const WA_URL = 'https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SUBJECTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) return {};
  return genMeta({
    title: `${subject.name} Notes – SPPU 2024 Pattern`,
    description: `${subject.description} Get free unit-wise notes, solved examples, and past paper solutions for SPPU 2024 Pattern.`,
    keywords: `${subject.name} notes, SPPU 2024 ${subject.name}, ${subject.name} study material, SPPU ${subject.name} unit wise notes`,
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/subject/${slug}`,
  });
}

export const dynamic = 'force-dynamic'; // Always fresh post counts

export default async function SubjectPage({ params }: PageProps) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  let posts: Post[] = [];
  let units: SubjectUnit[] = [];
  try {
    [posts, units] = await Promise.all([
      getPostsBySubject(subject.name, 50),
      getUnitsBySubject(slug),
    ]);
  } catch {
    posts = []; units = [];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abhyasmitra.in';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${subject.name} Notes – SPPU 2024 Pattern`,
    description: subject.description,
    url: `${siteUrl}/subject/${slug}`,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: subject.name, item: `${siteUrl}/subject/${slug}` },
    ],
  };

  // Group posts by unit
  const unitNames = units.map(u => u.name);
  const postsByUnit: Record<string, Post[]> = {};
  const uncategorized: Post[] = [];

  posts.forEach(post => {
    if (post.unit && unitNames.includes(post.unit)) {
      if (!postsByUnit[post.unit]) postsByUnit[post.unit] = [];
      postsByUnit[post.unit].push(post);
    } else {
      uncategorized.push(post);
    }
  });

  // If no units defined, show all posts flat
  const hasUnits = units.length > 0;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="page-enter">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li><span className="text-gray-900 dark:text-gray-100 font-medium">{subject.name}</span></li>
            </ol>
          </div>
        </nav>

        {/* Subject Hero */}
        <section className={`bg-gradient-to-br ${subject.color} py-16 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-white">
            <div className="max-w-2xl">
              <div className="text-6xl mb-4">{subject.icon}</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">{subject.name} Notes</h1>
              <p className="text-white/80 text-lg mb-4">{subject.description}</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">SPPU 2024 Pattern</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">{subject.year} Year Engineering</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">{posts.length} Notes</span>
                {units.length > 0 && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {units.length} Units
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Posts — unit-wise or flat */}
            <div className="flex-1">
              {posts.length === 0 ? (
                /* Empty State */
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm px-6">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Notes Coming Soon</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto mb-8 leading-relaxed">
                    We are working on {subject.name} notes. Join our WhatsApp channel to get notified instantly!
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#25D366]/20 hover:-translate-y-0.5">
                      <WhatsAppIcon /> Join WhatsApp Channel
                    </a>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all">
                      Back to Home
                    </Link>
                  </div>
                </div>
              ) : hasUnits ? (
                /* Unit-wise layout */
                <div className="space-y-10">
                  {units.map((unit, idx) => {
                    const unitPosts = postsByUnit[unit.name] || [];
                    if (unitPosts.length === 0) return null;
                    return (
                      <section key={unit.id}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white text-sm font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{unit.name}</h2>
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{unitPosts.length} notes</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {unitPosts.map(post => <BlogCard key={post.id} post={post} variant="featured" />)}
                        </div>
                      </section>
                    );
                  })}
                  {uncategorized.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Other Notes</h2>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{uncategorized.length}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {uncategorized.map(post => <BlogCard key={post.id} post={post} variant="featured" />)}
                      </div>
                    </section>
                  )}
                  {/* WhatsApp Banner */}
                  <WhatsAppBanner subjectName={subject.name} />
                </div>
              ) : (
                /* Flat layout (no units defined) */
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      All {subject.name} Notes ({posts.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {posts.map(post => <BlogCard key={post.id} post={post} variant="featured" />)}
                  </div>
                  <WhatsAppBanner subjectName={subject.name} />
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-6">
              {/* WhatsApp Compact */}
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#25D366] to-[#20bd5a] rounded-2xl text-white hover:-translate-y-0.5 transition-transform shadow-lg shadow-[#25D366]/20">
                <WhatsAppIcon />
                <div>
                  <p className="text-sm font-bold">Join WhatsApp</p>
                  <p className="text-xs text-white/80">PDF notes & instant updates</p>
                </div>
              </a>

              {/* All Subjects */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-sm uppercase tracking-wide">All Subjects</h3>
                <ul className="space-y-1">
                  {SUBJECTS.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/subject/${s.slug}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${s.slug === slug
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        <span>{s.icon}</span>
                        <span className="truncate">{s.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Study Tips */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Study Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {['Read notes before lectures', 'Practice previous year papers', 'Make revision notes', 'Join study groups'].map(tip => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function WhatsAppBanner({ subjectName }: { subjectName: string }) {
  return (
    <div className="bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 dark:from-[#25D366]/20 dark:to-transparent border border-[#25D366]/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
      <div className="text-center md:text-left">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
          Get PDF Notes & Updates!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
          Download {subjectName} PDF notes and get instant notifications when new notes are published.
        </p>
      </div>
      <a
        href="https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-[#25D366]/20 hover:-translate-y-1"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
        Join WhatsApp
      </a>
    </div>
  );
}
