import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/server/security';
import AdminShell from './AdminShell';
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
 const token = (await cookies()).get('admin-token')?.value;
 if (!token) redirect('/login');
 let user;
 try { user = await verifyToken(token); } catch { redirect('/login'); }
 if (user.admin !== true) redirect('/login');
 return <AdminShell>{children}</AdminShell>;
}
