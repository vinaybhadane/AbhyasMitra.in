import Link from 'next/link';
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
        <section className="pt-8 pb-2">
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

            {/* ── Branch Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {BRANCHES.map((branch) => (
                <GridCard
                  key={branch.id}
                  title={branch.label}
                  href={branch.href}
                  gradientIndex={branch.gradientIndex}
                  badge={branch.badge}
                  bgImageUrl={configsMap.get(branch.id)}
                />
              ))}
              {/* WhatsApp CTA card */}
              <WhatsAppCard />
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

