import { Metadata } from 'next';
import { getPostBySlug } from '@/lib/firestore';
import { generatePostMetadata } from '@/lib/seo';
import BlogPostClient from './BlogPostClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: 'Post Not Found | AbhyasMitra' };
    return generatePostMetadata(post) as Metadata;
  } catch {
    return { title: 'AbhyasMitra' };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
