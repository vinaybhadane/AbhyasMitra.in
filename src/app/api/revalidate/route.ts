import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Revalidate the entire site cache layout on-demand when called
    revalidatePath('/', 'layout');
    revalidateTag('customSubjects', 'max');
    revalidateTag('browseConfigs', 'max');
    revalidateTag('notifications', 'max');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error: any) {
    console.error('[REVALIDATE_API_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}
