import Link from 'next/link';
import Image from 'next/image';

// 4 rotating brand gradients for cards without images
const GRADIENTS = [
  'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0d9488 0%, #2563eb 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
  'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
];

interface GridCardProps {
  title: string;
  href: string;
  bgImageUrl?: string;
  gradientIndex?: number;
  badge?: string;
  icon?: React.ReactNode;
}

function hashIndex(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % GRADIENTS.length;
}

export default function GridCard({
  title,
  href,
  bgImageUrl,
  gradientIndex,
  badge,
  icon,
}: GridCardProps) {
  const gradIdx = gradientIndex ?? hashIndex(title);
  const gradient = GRADIENTS[gradIdx];

  return (
    <Link
      href={href}
      className={`grid-card${bgImageUrl ? '' : ' grid-card--gradient'}`}
      style={bgImageUrl ? undefined : { background: gradient }}
    >
      {bgImageUrl && (
        <Image
          src={bgImageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30'%3E%3Crect fill='%23cbd5e1' width='40' height='30'/%3E%3C/svg%3E"
        />
      )}

      {bgImageUrl && <div className="grid-card__overlay" />}

      {badge && <span className="grid-card__badge">{badge}</span>}

      <span className="grid-card__label">
        {icon && (
          <span className="block mb-1 opacity-90">{icon}</span>
        )}
        {title}
      </span>
    </Link>
  );
}
