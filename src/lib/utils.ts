import { Timestamp } from 'firebase/firestore/lite';

export function formatDate(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatRelativeTime(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(d);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function generateExcerpt(content: string, length = 160): string {
  const text = stripHtml(content);
  return truncate(text, length);
}
