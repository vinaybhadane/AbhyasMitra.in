import { NextRequest, NextResponse } from 'next/server';
import { requireUser, sameOrigin, failure } from '@/lib/server/security';
const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
export async function POST(request: NextRequest) {
  try {
    sameOrigin(request);
    const user = await requireUser(request);
    const response = NextResponse.json({ admin: user.admin === true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set('admin-token', request.headers.get('authorization')!.slice(7),
      { ...options, maxAge: Math.max(0, user.exp - Math.floor(Date.now()/1000)) });
    return response;
  } catch (error) { return failure(error); }
}
export async function DELETE(request: NextRequest) {
  try {
    sameOrigin(request);
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-token', '', { ...options, maxAge: 0 });
    return response;
  } catch (error) { return failure(error); }
}
