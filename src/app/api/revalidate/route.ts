import { requireAdmin, rateLimit, failure } from '@/lib/server/security';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    await rateLimit(`revalidate:${user.uid}`, 30);
    // Revalidate the entire site cache layout on-demand when called
    revalidatePath('/', 'layout');
    revalidateTag('customSubjects', 'max');
    revalidateTag('browseConfigs', 'max');
    revalidateTag('notifications', 'max');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) { return failure(error); }
}
