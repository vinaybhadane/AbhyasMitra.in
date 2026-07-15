import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, BookOpen, TrendingUp, CheckCircle2, Layers } from 'lucide-react';
import { getSubjectBySlug, SUBJECTS, Post, SubjectUnit, getLucideIcon } from '@/lib/types';
import { getPostsBySubject, getUnitsBySubject, getBrowseConfig, getSubjectNotes, SubjectNoteUnit } from '@/lib/firestore';
import { getCachedCustomSubjects } from '@/lib/firestoreCache';
import PostGridCard from '@/components/PostGridCard';
import { generateMetadata as genMeta } from '@/lib/seo';
import Image from 'next/image';

const WA_URL = 'https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K';

function getDeterministicRating(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = 4.4 + (Math.abs(hash) % 7) / 10; // Generates between 4.4 and 5.0
  return rating.toFixed(1);
}

function getDeterministicDownloads(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const downloads = 1850 + (Math.abs(hash) % 3151); // Generates between 1,850 and 5,000
  return downloads.toLocaleString('en-IN');
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function resolveSubject(slug: string) {
  const staticSub = getSubjectBySlug(slug);
  if (staticSub) return staticSub;

  try {
    const list = await getCachedCustomSubjects();
    const found = list.find((s) => s.slug === slug);
    if (found) {
      return {
        id: found.id,
        name: found.name,
        slug: found.slug,
        year: found.year,
        semester: found.semesterLabel,
        description: found.description,
        icon: getLucideIcon(found.iconName),
        color: found.color,
        iconColor: found.iconColor,
      };
    }
  } catch {}
  return undefined;
}

export async function generateStaticParams() {
  return SUBJECTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = await resolveSubject(slug);
  if (!subject) return {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abhyasmitra.in';

  return genMeta({
    title: `${subject.name} Notes (SPPU 2024 Pattern) | Free PDF`,
    description: `Download free unit-wise study notes, syllabus, solved numericals, and exam preparation material for ${subject.name} under SPPU 2024 Pattern. Access top engineering notes.`,
    keywords: `${subject.name} notes, sppu 2024 notes for ${subject.name}, ${subject.name} sppu notes, ${subject.name} 2024 pattern notes pdf, engineering ${subject.name} study material, ${subject.name} unit wise notes sppu, sppu ${subject.name} engineering notes`,
    canonical: `${siteUrl}/subject/${slug}`,
  });
}

export const revalidate = 3600;

export default async function SubjectPage({ params }: PageProps) {
  const { slug } = await params;
  const subject = await resolveSubject(slug);
  if (!subject) notFound();

  let posts: Post[] = [];
  let units: SubjectUnit[] = [];
  let bgImageUrl = '';
  let directNotes: SubjectNoteUnit[] = [];

  try {
    const configKey = subject.year === '1st' ? `first-year/${slug}` : `computer/2nd/${slug}`;
    const [postsData, unitsData, matchedConfig, subjectNotesDoc] = await Promise.all([
      getPostsBySubject(subject.name, 50),
      getUnitsBySubject(slug),
      getBrowseConfig(configKey),
      getSubjectNotes(slug),
    ]);
    posts = postsData;
    units = unitsData;
    if (subjectNotesDoc && subjectNotesDoc.units) {
      directNotes = subjectNotesDoc.units;
    }

    if (matchedConfig?.bgImageUrl) {
      bgImageUrl = matchedConfig.bgImageUrl;
    }
  } catch {
    posts = []; units = []; directNotes = [];
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
        <section 
          className={`bg-gradient-to-br ${subject.color} py-16 relative overflow-hidden`}
          style={bgImageUrl ? { background: 'none' } : undefined}
        >
          {bgImageUrl && (
            <Image
              src={bgImageUrl}
              alt={subject.name}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-white">
            <div className="max-w-2xl">
              <div className="text-6xl mb-4">{subject.icon}</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">{subject.name} Notes</h1>
              <p className="text-white/80 text-lg mb-4">{subject.description}</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm font-semibold">SPPU 2024 Pattern</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm font-semibold">{subject.year} Year Engineering</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm font-semibold flex items-center gap-1">
                  ⭐ {getDeterministicRating(slug)} / 5.0 Rating
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm font-semibold flex items-center gap-1">
                  📥 {getDeterministicDownloads(slug)}+ Downloads
                </span>
                {units.length > 0 && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm flex items-center gap-1 font-semibold">
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
            <div className="flex-1 space-y-10">
              {/* 1. PDF Notes Table Section (if any direct notes exist) */}
              {directNotes.length > 0 && (
                <section className="space-y-5">
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                      Download {subject.name} PDF Notes (SPPU 2024 Pattern)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Direct unit-wise PDF downloads for {subject.name}. Clean & high speed notes.
                    </p>
                  </div>

                  {/* Modern Responsive Table */}
                  <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm bg-white dark:bg-gray-900">
                    {/* Desktop View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-150 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                            <th className="px-6 py-4 w-24">Unit No.</th>
                            <th className="px-6 py-4">Unit / Chapter Name</th>
                            <th className="px-6 py-4 text-center w-48">Download</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-sm text-gray-600 dark:text-gray-300">
                          {directNotes.map((note, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10 transition-colors">
                              <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">{note.unitNo}</td>
                              <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{note.unitName}</td>
                              <td className="px-6 py-3 text-center">
                                <a href={note.downloadUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 active:scale-95 transition-transform inline-flex items-center justify-center">
                                  <img src="/downloadpng.png" alt="Download PDF" className="h-16 md:h-20 w-auto object-contain mx-auto" />
                                </a>
                              </td>
                            </tr>
                          ))}
                          {/* Join WhatsApp Channel Row */}
                          <tr className="bg-emerald-50/10 dark:bg-[#25D366]/5 hover:bg-emerald-50/20 dark:hover:bg-[#25D366]/10 transition-colors">
                            <td colSpan={3} className="px-6 py-4">
                              <a 
                                href={WA_URL} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#25D366]/20">
                                    <WhatsAppIcon />
                                  </div>
                                  <div className="text-left">
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white mb-0.5">
                                      Join WhatsApp Channel
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                      Get Very Important Questions, Oneshot Notes, and instant notifications directly on your phone!
                                    </p>
                                  </div>
                                </div>
                                <span className="px-8 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-extrabold rounded-2xl transition-all shadow-lg shrink-0 hover:scale-105 active:scale-95">
                                  Join Channel
                                </span>
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
 
                    {/* Mobile Card List (Sleek Mobile App Layout) */}
                    <div className="block sm:hidden space-y-3 p-3 bg-gray-50/50 dark:bg-gray-900/30">
                      {directNotes.map((note, i) => {
                        // Create a short badge text (e.g. "Unit 1" -> "U1", "Syllabus" -> "SYL")
                        const shortBadge = note.unitNo.toLowerCase().includes('unit')
                          ? note.unitNo.toUpperCase().replace('UNIT', 'U').replace(/\s+/g, '')
                          : note.unitNo.slice(0, 3).toUpperCase();
                        
                        return (
                          <div 
                            key={i} 
                            className="bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                          >
                            {/* Left Side: Badge + Titles */}
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-650 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
                                {shortBadge}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                                  {note.unitNo}
                                </span>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white break-words">
                                  {note.unitName}
                                </h3>
                              </div>
                            </div>
 
                            {/* Right Side: Action Trigger */}
                            <a 
                              href={note.downloadUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="shrink-0 hover:scale-105 active:scale-95 transition-transform inline-block"
                            >
                              <img src="/downloadpng.png" alt="Download PDF" className="h-12 w-auto object-contain" />
                            </a>
                          </div>
                        );
                      })}
                      {/* WhatsApp Channel Mobile Card */}
                      <div className="bg-emerald-50/10 dark:bg-[#25D366]/5 border border-[#25D366]/30 dark:border-[#25D366]/20 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
                        <a 
                          href={WA_URL} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-between gap-4 w-full"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#25D366]/10">
                              <WhatsAppIcon />
                            </div>
                            <div className="min-w-0 text-left">
                              <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#25D366] block mb-0.5">
                                Official Channel
                              </span>
                              <h4 className="text-xs font-black text-gray-900 dark:text-white leading-tight mb-1">
                                Join WhatsApp Channel
                              </h4>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal break-words pr-1 font-medium">
                                For Very Important Questions, Oneshot Notes and Notifications.
                              </p>
                            </div>
                          </div>
                          <span className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-extrabold rounded-xl transition-all shrink-0 hover:scale-105 active:scale-95 shadow-md">
                            Join
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 2. Blog Posts Section */}
              {posts.length > 0 ? (
                hasUnits ? (
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
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {unitPosts.map(post => <PostGridCard key={post.id} post={post} />)}
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {uncategorized.map(post => <PostGridCard key={post.id} post={post} />)}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
                      {posts.map(post => <PostGridCard key={post.id} post={post} />)}
                    </div>
                    <WhatsAppBanner subjectName={subject.name} />
                  </>
                )
              ) : (
                /* No posts, but check if we also have no direct notes before rendering empty state */
                directNotes.length === 0 && (
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
                )
              )}

              {/* Dynamic Extreme SEO Tags */}
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-155 dark:border-gray-800/80 rounded-3xl p-6 mt-8">
                <h3 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Search Tags</h3>
                <div className="flex flex-wrap gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#{subject.name} sppu 2024 notes</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#{subject.name} engineering notes sppu</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#sppu 2024 pattern notes</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#sppu engineering study material</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#{subject.name} syllabus unit notes</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#{subject.name} question bank sppu</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#sppu exam pdf downloads</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#sppu syllabus 2024</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#sppu important questions 2024</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#sppu mock tests</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#sppu model answer sheets</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#abhyasmitra notes</span>
                  <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">#abhyasmitra sppu pattern</span>
                </div>
              </div>
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
