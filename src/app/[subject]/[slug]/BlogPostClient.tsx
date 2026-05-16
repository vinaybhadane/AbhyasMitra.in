'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Calendar, Clock, Eye, Tag, Share2, BookOpen, AlignLeft } from 'lucide-react';
import { getPostBySlug, getRelatedPosts, incrementPostViews } from '@/lib/firestore';
import { Post } from '@/lib/types';
import { generateTOC, generateArticleJsonLd } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import CommentSection from '@/components/CommentSection';
import BlogCard from '@/components/BlogCard';
import AdUnit from '@/components/AdUnit';
import toast from 'react-hot-toast';
import { onSnapshot, rtCollection, rtQuery, rtWhere, rtLimit } from '@/lib/firebase';

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [loading, setLoading] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    // Real-time listener: updates the page whenever the post is edited in Firestore
    const q = rtQuery(rtCollection('posts'), rtWhere('slug', '==', slug), rtLimit(1));
    let viewsIncremented = false;

    const unsubscribe = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        setLoading(false);
        return;
      }
      const docSnap = snap.docs[0];
      const p = { id: docSnap.id, ...docSnap.data() } as Post;
      setPost(p);
      setToc(generateTOC(p.content));
      setLoading(false);

      // Increment views only once per page load (not on every real-time update)
      if (!viewsIncremented) {
        viewsIncremented = true;
        incrementPostViews(p.id).catch(() => {});
        const rel = await getRelatedPosts(p.subject, p.id, 3);
        setRelated(rel);
      }
    }, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);


  // TOC scroll spy
  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHeading(entry.target.id);
        });
      },
      { rootMargin: '-20% 0% -60% 0%' }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  // Add IDs to headings in rendered HTML
  const processedContent = useCallback(() => {
    if (!post?.content) return '';
    return post.content.replace(/<h([2-6])([^>]*)>(.*?)<\/h[2-6]>/gi, (_, level, attrs, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '');
      const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    });
  }, [post?.content]);

  const handleShare = async () => {
    if (!post) return;
    if (navigator.share) {
      await navigator.share({ title: post.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (loading) return <BlogPostSkeleton />;
  if (!post) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Post Not Found</h1>
        <Link href="/" className="text-indigo-600 hover:underline">Go to Home</Link>
      </div>
    </div>
  );

  const publishDate = post.publishDate instanceof Date ? post.publishDate : (post.publishDate as any)?.toDate?.();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://abhyasmitra.in';
  const subjectSlug = post.subject.toLowerCase().replace(/\s+/g, '-');

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: post.subject, item: `${siteUrl}/subject/${subjectSlug}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}/${post.slug}` },
    ],
  };

  return (
    <>
      {/* JSON-LD: Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleJsonLd(post)) }}
      />
      {/* JSON-LD: Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="page-enter">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li><Link href={`/subject/${post.subject.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{post.subject}</Link></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li><span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px] block">{post.title}</span></li>
            </ol>
          </div>
        </nav>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative h-64 sm:h-96 w-full bg-gray-100 dark:bg-gray-800">
            <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Article */}
            <article className="flex-1 min-w-0">
              {/* Category */}
              <div className="mb-4">
                <Link
                  href={`/subject/${post.subject.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full border border-indigo-100 dark:border-indigo-800"
                >
                  {post.subject}
                </Link>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <span className="font-medium text-gray-700 dark:text-gray-300">By {post.author}</span>
                {publishDate && (
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(publishDate)}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readingTime} min read</span>
                {post.views > 0 && (
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.views} views</span>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 ml-auto text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {/* Mobile TOC Toggle */}
              {toc.length > 0 && (
                <div className="lg:hidden mb-6">
                  <button
                    onClick={() => setTocOpen(!tocOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium"
                  >
                    <span className="flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Table of Contents</span>
                    <span>{tocOpen ? '▲' : '▼'}</span>
                  </button>
                  {tocOpen && (
                    <nav className="mt-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      {toc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={() => setTocOpen(false)}
                          className={`toc-link ${item.level === 2 ? '' : 'pl-4'} ${activeHeading === item.id ? 'active' : ''}`}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  )}
                </div>
              )}

              {/* Content */}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: processedContent() }}
              />

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Tag className="w-3.5 h-3.5" /> {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* AdSense – Between article content and comments (high-visibility placement) */}
              <AdUnit
                slot="1234567890"
                format="horizontal"
                className="my-8"
                label="Advertisement"
              />

              {/* Comments */}
              <CommentSection postId={post.id} />
            </article>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0">
              {/* Desktop TOC */}
              {toc.length > 0 && (
                <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" /> Table of Contents
                  </h3>
                  <nav className="space-y-0.5">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`toc-link ${item.level > 2 ? 'pl-4' : ''} ${activeHeading === item.id ? 'active' : ''}`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* AdSense Sidebar – Sticky vertical unit */}
              <div className="sticky top-20">
                <AdUnit
                  slot="0987654321"
                  format="rectangle"
                  responsive={false}
                  className="mb-6 min-h-[250px]"
                  label="Advertisement"
                />
              </div>

              {/* Related Posts */}
              {related.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Related Notes</h3>
                  <div className="space-y-4">
                    {related.map((rp) => (
                      <BlogCard key={rp.id} post={rp} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function BlogPostSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="skeleton h-6 w-48 mb-6" />
      <div className="skeleton h-96 w-full mb-8" />
      <div className="flex gap-10">
        <div className="flex-1 space-y-4">
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>
        <div className="w-72 hidden lg:block">
          <div className="skeleton h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
