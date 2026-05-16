import { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/firestore';
import { SUBJECTS } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://abhyasmitra.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Subject pages
  const subjectPages: MetadataRoute.Sitemap = SUBJECTS.map((s) => ({
    url: `${SITE_URL}/subject/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Blog post pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await getPublishedPosts(100);
    blogPages = posts.map((post) => ({
      url: `${SITE_URL}/${post.slug}`,
      lastModified:
        post.updatedAt instanceof Date
          ? post.updatedAt
          : (post.updatedAt as any)?.toDate?.() || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
  } catch {}

  return [...staticPages, ...subjectPages, ...blogPages];
}
