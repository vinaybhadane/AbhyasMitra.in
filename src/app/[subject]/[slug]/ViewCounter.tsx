'use client';

import { useEffect, useRef } from 'react';
import { incrementPostViews } from '@/lib/firestore';

export default function ViewCounter({ postId }: { postId: string }) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (!hasIncremented.current) {
      hasIncremented.current = true;
      incrementPostViews(postId).catch(() => {});
    }
  }, [postId]);

  return null;
}
