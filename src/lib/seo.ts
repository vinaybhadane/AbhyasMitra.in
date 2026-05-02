import { Post } from './types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  author?: string;
  publishDate?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://abhyasmitra.com';
const SITE_NAME = 'AbhyasMitra';
const DEFAULT_DESCRIPTION =
  'AbhyasMitra – Free notes, study material, and solutions for SPPU 2024 Pattern students. Engineering Mathematics, Physics, Chemistry, DBMS, IoT, and more.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export function generateMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = 'SPPU 2024 pattern notes, engineering notes, SPPU study material',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  author = 'AbhyasMitra Team',
  publishDate,
}: SEOProps = {}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – SPPU 2024 Pattern Notes`;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: author }],
    openGraph: {
      title: fullTitle,
      description,
      type: ogType,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      ...(canonical && { url: canonical }),
      ...(publishDate && { publishedTime: publishDate }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(canonical && {
      alternates: { canonical },
    }),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export function generatePostMetadata(post: Post) {
  return generateMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords || post.tags.join(', '),
    ogImage: post.featuredImage || DEFAULT_OG_IMAGE,
    ogType: 'article',
    canonical: `${SITE_URL}/blog/${post.slug}`,
    author: post.author,
    publishDate:
      post.publishDate instanceof Date
        ? post.publishDate.toISOString()
        : post.publishDate?.toDate?.()?.toISOString(),
  });
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleJsonLd(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished:
      post.publishDate instanceof Date
        ? post.publishDate.toISOString()
        : post.publishDate?.toDate?.()?.toISOString(),
    dateModified:
      post.updatedAt instanceof Date
        ? post.updatedAt.toISOString()
        : post.updatedAt?.toDate?.()?.toISOString(),
    url: `${SITE_URL}/blog/${post.slug}`,
  };
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function generateTOC(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h[2-6]>/gi;
  const toc: { id: string; text: string; level: number }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, '');
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    toc.push({ id, text, level });
  }
  return toc;
}

export const SITE_URL_EXPORT = SITE_URL;
export const SITE_NAME_EXPORT = SITE_NAME;
