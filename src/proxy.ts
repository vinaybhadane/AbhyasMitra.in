import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/server/security';
export async function proxy(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    const user = await verifyToken(token);
    if (user.admin !== true) return new NextResponse('Forbidden', { status: 403 });
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch { return NextResponse.redirect(new URL('/login', request.url)); }
}
export const config = { matcher: ['/admin/:path*'] };
