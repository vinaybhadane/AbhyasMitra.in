import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import { getPublishedPosts, getAllBrowseConfigs } from '@/lib/firestore';
import BlogCard from '@/components/BlogCard';
import GridCard from '@/components/GridCard';
import WhatsAppCard from '@/components/WhatsAppCard';
import LastVisitedBanner from '@/components/LastVisitedBanner';
import PostGridCard from '@/components/PostGridCard';

export const metadata: Metadata = {
  title: 'AbhyasMitra – Free SPPU 2024 Pattern Notes & Study Material',
  description:
    'Free notes, solved problems, and study material for SPPU 2024 Pattern engineering students. Covers 1st Year and all branches of Engineering.',
  keywords: 'SPPU 2024 pattern notes, engineering notes, first year engineering, computer engineering notes',
};

export const dynamic = 'force-dynamic';

async function getHomeData() {
  try {
    const { posts } = await getPublishedPosts(6);
    return { posts };
  } catch {
    return { posts: [] };
  }
}

const BRANCHES = [
  {
    id: 'first-year',
    label: '1st Year Engineering',
    href: '/subjects/first-year',
    badge: 'All Branches',
    gradientIndex: 0,
  },
  {
    id: 'computer',
    label: 'Computer Engineering',
    href: '/browse/computer',
    badge: 'CE',
    gradientIndex: 1,
  },
  {
    id: 'it',
    label: 'Information Technology',
    href: '/browse/it',
    badge: 'IT',
    gradientIndex: 2,
  },
  {
    id: 'ai-ds',
    label: 'AI & Data Science',
    href: '/browse/ai-ds',
    badge: 'AI&DS',
    gradientIndex: 3,
  },
  {
    id: 'mechanical',
    label: 'Mechanical Engineering',
    href: '/browse/mechanical',
    badge: 'ME',
    gradientIndex: 0,
  },
  {
    id: 'electrical',
    label: 'Electrical Engineering',
    href: '/browse/electrical',
    badge: 'EE',
    gradientIndex: 1,
  },
  {
    id: 'civil',
    label: 'Civil Engineering',
    href: '/browse/civil',
    badge: 'CE',
    gradientIndex: 2,
  },
  {
    id: 'entc',
    label: 'Electronics & Telecomm.',
    href: '/browse/entc',
    badge: 'E&TC',
    gradientIndex: 3,
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
  const { posts } = await getHomeData();
  const featuredPosts = posts.slice(0, 3);
  const recentPosts = posts.slice(3, 6);

  // Fetch configs
  let configsMap = new Map<string, string>();
  try {
    const allConfigs = await getAllBrowseConfigs();
    allConfigs.forEach(c => {
      if (c.bgImageUrl) configsMap.set(c.id, c.bgImageUrl);
    });
  } catch (e) {
    console.error('Failed to load configs', e);
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <div style={{ background: 'var(--am-bg-page)' }}>

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <section className="pt-8 pb-2" id="branches">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Last visited resume banner */}
            <LastVisitedBanner />

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--am-text-primary)' }}>
                Browse by Branch
              </h1>
              <p className="text-sm" style={{ color: 'var(--am-text-secondary)' }}>
                SPPU 2024 Pattern — Free notes &amp; study material
              </p>
            </div>

            {/* ── Branch List (one by one layout) ─────────────────────────── */}
            <div className="flex flex-col gap-4 mb-4">
              {BRANCHES.map((branch) => {
                const bgImageUrl = configsMap.get(branch.id);
                const gradient = GRADIENTS[branch.gradientIndex];
                return (
                  <Link
                    key={branch.id}
                    href={branch.href}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300 group cursor-pointer"
                  >
                    {/* Left side: Image or Gradient */}
                    <div className="relative w-24 h-18 sm:w-32 sm:h-24 rounded-xl overflow-hidden shrink-0 shadow-inner">
                      {bgImageUrl ? (
                        <Image
                          src={bgImageUrl}
                          alt={branch.label}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 96px, 128px"
                        />
                      ) : (
                        <div 
                          className="w-full h-full group-hover:scale-105 transition-transform duration-500" 
                          style={{ background: gradient }}
                        />
                      )}
                    </div>

                    {/* Right side: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-sky-600 transition-colors duration-200 truncate">
                          {branch.label}
                        </h3>
                        {branch.badge && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                            {branch.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Click to browse subjects, year-wise notes, and solutions
                      </p>
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

              {/* WhatsApp CTA Card (List Style) */}
              <a
                href="https://whatsapp.com/channel/0029VbD3UKE8aKvOTKJcwK1K"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 group cursor-pointer"
              >
                {/* Left side: WhatsApp Icon with green gradient */}
                <div className="relative w-24 h-18 sm:w-32 sm:h-24 rounded-xl flex items-center justify-center shrink-0 shadow-inner bg-gradient-to-br from-emerald-400 to-teal-500 group-hover:scale-105 transition-transform duration-500">
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-emerald-800 group-hover:text-emerald-600 transition-colors duration-200 truncate">
                      Join our WhatsApp Community
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Community
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-600/90">
                    Get instant updates on SPPU 2024 Pattern notes, exam resources, and syllabus changes
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ── Featured Posts ───────────────────────────────────────────── */}
        {featuredPosts.length > 0 && (
          <section className="py-10" style={{ borderTop: '1px solid var(--am-border-card)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--am-text-primary)' }}>Latest Notes</h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--am-text-secondary)' }}>Recently published study material</p>
                </div>
                <Link href="/search" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: '#2563eb' }}>
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {featuredPosts.map((post) => (
                  <PostGridCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Recent Posts ─────────────────────────────────────────────── */}
        {recentPosts.length > 0 && (
          <section className="py-10" style={{ borderTop: '1px solid var(--am-border-card)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--am-text-primary)' }}>More Notes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recentPosts.map((post) => (
                  <PostGridCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

