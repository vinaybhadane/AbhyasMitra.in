import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import { getCachedNotifications, getCachedBrowseConfigs } from '@/lib/firestoreCache';
import LastVisitedBanner from '@/components/LastVisitedBanner';

export const metadata: Metadata = {
  title: 'AbhyasMitra – Free SPPU 2024 Pattern Notes & Study Material',
  description:
    'Free notes, solved problems, and study material for SPPU 2024 Pattern engineering students. Covers 1st Year and all branches of Engineering.',
  keywords: 'SPPU 2024 pattern notes, engineering notes, first year engineering, computer engineering notes',
};

export const revalidate = 3600;

async function getHomeData() {
  try {
    const notifications = await getCachedNotifications(15);
    return { notifications };
  } catch {
    return { notifications: [] };
  }
}

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.floor(rating);
        const isHalf = !isFilled && star === Math.ceil(rating) && (rating % 1 !== 0);
        return (
          <svg
            key={star}
            viewBox="0 0 24 24"
            fill={isFilled ? '#eab308' : isHalf ? 'url(#halfGrad)' : '#e2e8f0'}
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
          </svg>
        );
      })}
    </div>
  );
};

const BRANCHES = [
  {
    id: 'first-year',
    label: '1st Year Engineering',
    href: '/subjects/first-year',
    badge: 'All Branches',
    gradientIndex: 0,
    desc: 'First Year Engineering covers Basic Sciences, Mechanics, Programming, Graphics, and Fundamental Electrical Systems.',
    rating: 4.8,
    students: 2450,
  },
  {
    id: 'computer',
    label: 'Computer Engineering',
    href: '/browse/computer',
    badge: 'CE',
    gradientIndex: 1,
    desc: 'Computer Engineering focuses on Programming, AI, Networking, Database and Software Engineering.',
    rating: 4.9,
    students: 1840,
  },
  {
    id: 'it',
    label: 'Information Technology',
    href: '/browse/it',
    badge: 'IT',
    gradientIndex: 2,
    desc: 'Information Technology covers Web Dev, Cyber Security, Cloud Computing, Database Administration, and Network Systems.',
    rating: 4.8,
    students: 1520,
  },
  {
    id: 'ai-ds',
    label: 'AI & Data Science',
    href: '/browse/ai-ds',
    badge: 'AI&DS',
    gradientIndex: 3,
    desc: 'AI & Data Science covers Machine Learning, Neural Networks, Big Data Analytics, Statistical Modeling, and AI Ethics.',
    rating: 4.9,
    students: 1150,
  },
  {
    id: 'mechanical',
    label: 'Mechanical Engineering',
    href: '/browse/mechanical',
    badge: 'ME',
    gradientIndex: 0,
    desc: 'Mechanical Engineering focuses on Thermodynamics, Machine Design, Fluid Mechanics, CAD/CAM, and Material Science.',
    rating: 4.7,
    students: 1280,
  },
  {
    id: 'electrical',
    label: 'Electrical Engineering',
    href: '/browse/electrical',
    badge: 'EE',
    gradientIndex: 1,
    desc: 'Electrical Engineering covers Control Systems, Power Electronics, Electrical Machines, Grid Infrastructure, and Circuits.',
    rating: 4.7,
    students: 980,
  },
  {
    id: 'civil',
    label: 'Civil Engineering',
    href: '/browse/civil',
    badge: 'CE',
    gradientIndex: 2,
    desc: 'Civil Engineering focuses on Structural Analysis, Concrete Technology, Fluid Mechanics, Surveying, and Environmental Engineering.',
    rating: 4.6,
    students: 850,
  },
  {
    id: 'entc',
    label: 'Electronics & Telecomm.',
    href: '/browse/entc',
    badge: 'E&TC',
    gradientIndex: 3,
    desc: 'Electronics & Telecommunication covers Signal Processing, Embedded Systems, VLSI Design, and Communication Networks.',
    rating: 4.8,
    students: 1340,
  },
];

const GRADIENTS = [
  'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0d9488 0%, #2563eb 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
  'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
];

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AbhyasMitra',
  url: 'https://abhyasmitra.in',
  description: 'Free notes, solved problems, and study material for SPPU 2024 Pattern engineering students.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://abhyasmitra.in/search?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AbhyasMitra',
    url: 'https://abhyasmitra.in',
    logo: { '@type': 'ImageObject', url: 'https://abhyasmitra.in/logo12.png' },
    contactPoint: { '@type': 'ContactPoint', email: 'vinaybhadane06@gmail.com', contactType: 'customer support' },
  },
};

export default async function HomePage() {
  const { notifications } = await getHomeData();

  // Fetch configs
  let configsMap = new Map<string, string>();
  try {
    const allConfigs = await getCachedBrowseConfigs();
    allConfigs.forEach(c => {
      if (c.bgImageUrl) configsMap.set(c.id, c.bgImageUrl);
    });
  } catch (e) {
    console.error('Failed to load configs', e);
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      {/* Global SVG Definitions for half-filled stars */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="halfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ background: 'var(--am-bg-page)' }}>

        {/* ── Dynamic Premium Hero Section ───────────────────────────── */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 pt-8 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LastVisitedBanner />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center mt-4">
              {/* Image Left */}
              <div className="md:col-span-5 flex justify-center order-first">
                <div className="relative w-full max-w-[340px] md:max-w-full aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src="/heroImage.png"
                    alt="AbhyasMitra SPPU Study Hub"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Text Right */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-5 text-left">
                <h1 className="text-3xl sm:text-4.5xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                  Your Complete <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-indigo-600">SPPU 2024 Pattern</span> Study Hub
                </h1>
                
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  All Notes, PYQs, Study Materials, and Exam Resources — Everything You Need in One Place. 
                  No more searching across multiple websites. AbhyasMitra has you covered from your first lecture to your final exam.
                </p>

                {/* WhatsApp Channel Ribbon Link */}
                <div className="pt-1">
                  <a
                    href="https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3.5 p-4 sm:p-5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 fill-current text-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="text-left pr-1.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-green-100 opacity-90">Join WhatsApp Channel</p>
                      <p className="text-xs sm:text-sm font-bold leading-snug">
                        Get instant SPPU notes, PYQs, and exam notifications directly on your phone!
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Browse by Branch Section ─────────────────────────────────── */}
        <section className="pt-10 pb-8" id="branches">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 uppercase tracking-wider">
                ⚡ Course Library
              </div>
              <h2 className="text-2xl sm:text-3.5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Explore Engineering <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">Branches</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Select your branch to access reference books, notes, and study guides.
              </p>
            </div>

            {/* ── Branch List (2-column layout on desktop) ─────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {BRANCHES.map((branch) => {
                const bgImageUrl = configsMap.get(branch.id);
                const gradient = GRADIENTS[branch.gradientIndex];
                return (
                  <Link
                    key={branch.id}
                    href={branch.href}
                    className="flex items-center gap-5 p-4 bg-white border border-gray-100 rounded-2xl hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300 group cursor-pointer"
                  >
                    {/* Left side: Image or Gradient (Increased Size) */}
                    <div className="relative w-32 h-24 sm:w-44 sm:h-28 rounded-xl overflow-hidden shrink-0 shadow-inner">
                      {bgImageUrl ? (
                        <Image
                          src={bgImageUrl}
                          alt={branch.label}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 128px, 176px"
                        />
                      ) : (
                        <div 
                          className="w-full h-full group-hover:scale-105 transition-transform duration-500" 
                          style={{ background: gradient }}
                        />
                      )}
                    </div>

                    {/* Right side: Centered Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-sky-600 transition-colors duration-200 truncate">
                          {branch.label}
                        </h3>
                        {branch.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                            {branch.badge}
                          </span>
                        )}
                      </div>
                      
                      {/* Description - Desktop Only */}
                      <p className="hidden md:block text-xs text-gray-500 leading-relaxed max-w-xl">
                        {branch.desc}
                      </p>

                      {/* Ratings - Mobile and Desktop */}
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] sm:text-xs text-gray-500 font-medium">
                        {renderStars(branch.rating)}
                        <span className="text-amber-600 font-bold ml-0.5">{branch.rating.toFixed(1)}</span>
                        <span className="text-gray-300">|</span>
                        <span>Rated by {branch.students.toLocaleString()} students</span>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="text-gray-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </Link>
                );
              })}

              {/* WhatsApp CTA Card (Horizontal Banner spanning 2 columns) */}
              <a
                href="https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K"
                target="_blank"
                rel="noopener noreferrer"
                className="md:col-span-2 flex flex-col sm:flex-row items-center gap-5 p-6 sm:p-8 bg-gradient-to-br from-emerald-50 via-emerald-50/30 to-teal-50/50 border border-emerald-100/60 rounded-3xl hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/40 transition-all duration-300 group cursor-pointer"
              >
                {/* Left side: WhatsApp Icon with green gradient */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br from-emerald-400 to-teal-500 group-hover:scale-105 transition-transform duration-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-10 h-10 text-white drop-shadow-md"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>

                {/* Right side: WhatsApp Content */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center sm:justify-start">
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-800 group-hover:text-emerald-700 transition-colors duration-200">
                      Join our WhatsApp Community
                    </h3>
                    <span className="w-fit mx-auto sm:mx-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Official Channel
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-700/80 leading-relaxed font-medium">
                    Join our Whatsapp Community for Latest Updates, Premium notes and PYQ&apos;s.
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ── Latest Notifications ───────────────────────────────────────── */}
        <section className="py-12 border-t border-gray-100 dark:border-gray-800 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  Latest Notifications
                </h2>
              </div>
              <p className="text-sm text-gray-500">
                Stay updated with recent notes releases, syllabus patterns, and education updates from the administrators
              </p>
            </div>

            <div className="space-y-4">
              {notifications.map((n) => {
                const date = n.createdAt instanceof Date ? n.createdAt : (n.createdAt as any)?.toDate?.();
                
                const cardContent = (
                  <div className="p-5 bg-white border border-gray-100 hover:border-sky-200 hover:shadow-md hover:shadow-sky-50/50 rounded-2xl transition-all duration-300 flex items-start gap-4 cursor-pointer">
                    <span className="flex h-2 w-2 translate-y-2 rounded-full bg-sky-400 shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors duration-200">
                        {n.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">
                        {n.content}
                      </p>
                      {date && (
                        <span className="text-xs text-gray-400 mt-3 block">
                          Posted on {date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                );

                if (n.link) {
                  return (
                    <Link key={n.id} href={n.link} className="block group">
                      {cardContent}
                    </Link>
                  );
                }

                return <div key={n.id}>{cardContent}</div>;
              })}

              {notifications.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  No notifications or updates posted yet. Check back soon!
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

