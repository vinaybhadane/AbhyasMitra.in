import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, Eye, ArrowRight, Library } from 'lucide-react';
import { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import slugify from 'slugify';

interface BlogCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
}

/**
 * Builds the correct post URL handling both old slugs (title-only)
 * and new slugs (subject/title format).
 * Old: "my-post-title"  → "/internet-of-things/my-post-title"
 * New: "internet-of-things/my-post-title" → "/internet-of-things/my-post-title"
 */
function getPostUrl(post: Post): string {
  if (post.slug.includes('/')) {
    // Already in new format: subject/title
    return `/${post.slug}`;
  }
  // Legacy slug — prefix with subject slug
  const subjectSlug = slugify(post.subject || '', { lower: true, strict: true });
  return `/${subjectSlug}/${post.slug}`;
}

export default function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  const date = post.publishDate instanceof Date
    ? post.publishDate
    : post.publishDate?.toDate?.();
  const postUrl = getPostUrl(post);

  if (variant === 'compact') {
    return (
      <Link href={postUrl} className="flex gap-3 group">
        {post.featuredImage && (
          <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
            <Image src={post.featuredImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {post.title}
          </h4>
          {date && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(date)}</p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <article className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1">
        <Link href={postUrl} className="block">
          <div className="relative h-56 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20">
            {post.featuredImage ? (
              <Image src={post.featuredImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-indigo-300 dark:text-indigo-700 opacity-50"><Library className="w-16 h-16" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white mb-2">
                {post.subject}
              </span>
            </div>
          </div>
        </Link>
        <div className="p-5">
          <Link href={postUrl}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              {date && (
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(date)}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readingTime} min</span>
            </div>
            {post.views > 0 && (
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views}</span>
            )}
          </div>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }

  // Default card
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg transition-all duration-300">
      <Link href={postUrl} className="block">
        <div className="relative h-44 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-700">
          {post.featuredImage ? (
            <Image src={post.featuredImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-indigo-300 dark:text-indigo-700 opacity-50"><Library className="w-12 h-12" /></div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full border border-indigo-100 dark:border-indigo-800">
            {post.subject}
          </span>
        </div>
        <Link href={postUrl}>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(date)}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readingTime}m</span>
          </div>
          <Link
            href={postUrl}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all"
          >
            Read <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
