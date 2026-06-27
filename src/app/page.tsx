import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';
import { getPublishedPosts } from '@/lib/firestore';
import { SUBJECTS } from '@/lib/types';
import BlogCard from '@/components/BlogCard';

export const metadata: Metadata = {
  title: 'AbhyasMitra – Free SPPU 2024 Pattern Notes & Study Material',
  description:
    'Free notes, solved problems, and study material for SPPU 2024 Pattern engineering students. Covers 1st Year and 2nd Year Computer Engineering subjects.',
  keywords: 'SPPU 2024 pattern notes, engineering notes, first year engineering, computer engineering notes',
};

// Always fetch fresh data so homepage shows latest posts immediately after publish/update
export const dynamic = 'force-dynamic';

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    <div style={{ background: 'var(--am-bg-page)' }}>
      {/* ─── 1st Year Subjects ────────────────────────────────────────────────── */}
      <section className="pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--am-text-primary)' }}>
              Browse Subjects
            </h1>
            <p className="text-sm" style={{ color: 'var(--am-text-secondary)' }}>
              SPPU 2024 Pattern — Free notes & study material
            </p>
          </div>

          <div className="mb-5">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--am-text-primary)' }}>
              <span className="w-1 h-5 rounded-full" style={{ background: '#2563eb' }} />
              First Year Engineering
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {firstYearSubjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/subject/${subject.slug}`}
                  className="subject-card"
                >
                  <div
                    className="subject-card__icon"
                    style={{ background: `${subject.iconColor}14`, color: subject.iconColor }}
                  >
                    {subject.icon}
                  </div>
                  <span className="subject-card__name">{subject.name}</span>
                  <span className="subject-card__badge">{subject.semester}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2nd Year Subjects ────────────────────────────────────────────────── */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--am-text-primary)' }}>
            <span className="w-1 h-5 rounded-full" style={{ background: '#7c3aed' }} />
            Second Year — Computer Engineering
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {secondYearSubjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subject/${subject.slug}`}
                className="subject-card"
              >
                <div
                  className="subject-card__icon"
                  style={{ background: `${subject.iconColor}14`, color: subject.iconColor }}
                >
                  {subject.icon}
                </div>
                <span className="subject-card__name">{subject.name}</span>
                <span className="subject-card__badge">{subject.semester}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Posts ───────────────────────────────────────────────────── */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Recent Posts ─────────────────────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="py-10" style={{ borderTop: '1px solid var(--am-border-card)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--am-text-primary)' }}>More Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
    </>
  );
}
