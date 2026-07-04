import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';
import { Post } from '@/lib/types';
import slugify from 'slugify';

const GRADIENTS = [
  'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0d9488 0%, #2563eb 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
  'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
];

function hashIndex(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % GRADIENTS.length;
}

function getPostUrl(post: Post): string {
  if (post.slug.includes('/')) return `/${post.slug}`;
  const subjectSlug = slugify(post.subject || '', { lower: true, strict: true });
  return `/${subjectSlug}/${post.slug}`;
}

interface PostGridCardProps {
  post: Post;
}

export default function PostGridCard({ post }: PostGridCardProps) {
  const postUrl = getPostUrl(post);
  const hasImage = !!post.featuredImage;
  const gradient = GRADIENTS[hashIndex(post.title)];

  return (
    <Link
      href={postUrl}
      className={`grid-card${hasImage ? '' : ' grid-card--gradient'}`}
      style={hasImage ? undefined : { background: gradient }}
    >
      {/* Background image */}
      {hasImage && (
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30'%3E%3Crect fill='%23cbd5e1' width='40' height='30'/%3E%3C/svg%3E"
        />
      )}

      {/* Gradient overlay (stronger for image cards so text is readable) */}
      {hasImage && (
        <div
          className="grid-card__overlay"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
          }}
        />
      )}

      {/* Unit badge top-right */}
      {post.unit && (
        <span className="grid-card__badge">{post.unit}</span>
      )}

      {/* Bottom label: title + meta */}
      <span className="grid-card__label" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          {post.title}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 500, opacity: 0.82 }}>
          {post.readingTime > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock style={{ width: 11, height: 11 }} /> {post.readingTime} min
            </span>
          )}
          {post.views > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Eye style={{ width: 11, height: 11 }} /> {post.views}
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
