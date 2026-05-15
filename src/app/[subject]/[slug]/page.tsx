import { Metadata } from 'next';
import { getPostBySlug } from '@/lib/firestore';
import { generatePostMetadata } from '@/lib/seo';
import BlogPostClient from './BlogPostClient';

interface PageProps {
  params: Promise<{ subject: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject, slug } = await params;
  const fullSlug = `${subject}/${slug}`;
  try {
    const post = await getPostBySlug(fullSlug);
    if (!post) return { title: 'Post Not Found | AbhyasMitra' };
    return generatePostMetadata(post) as Metadata;
  } catch {
    return { title: 'AbhyasMitra' };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { subject, slug } = await params;
  const fullSlug = `${subject}/${slug}`;
  return <BlogPostClient slug={fullSlug} />;
}
