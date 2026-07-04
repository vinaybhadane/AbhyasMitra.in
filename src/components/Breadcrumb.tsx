import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight
                className="breadcrumb__sep"
                style={{ width: 13, height: 13, flexShrink: 0, opacity: 0.5 }}
                aria-hidden="true"
              />
            )}
            {isLast || !crumb.href ? (
              <span className={isLast ? 'breadcrumb__current' : ''}>
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="breadcrumb__link">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
