'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function Login() {
 const { user, isAdminUser, loading, sessionError, refreshAccess, signInWithGoogle, logout } = useAuth();
 const router = useRouter(); const [error, setError] = useState('');
 useEffect(() => { if (!loading && isAdminUser) router.replace('/admin'); }, [loading, isAdminUser, router]);
 const button = 'bg-indigo-600 text-white rounded-xl px-6 py-3 disabled:opacity-50';
 return <section className="max-w-md mx-auto p-8 text-center space-y-4"><h1 className="text-2xl font-bold mb-4">Administrator sign in</h1>
 {loading && <p role="status">Verifying access...</p>}
 {user && <p>Signed in as {user.email}</p>}
 {user && !loading && !isAdminUser && !sessionError && <p>This account has not been granted administrator access. After the site owner grants access, select Refresh access.</p>}
 {user ? <div className="flex flex-wrap justify-center gap-3">
   <button disabled={loading} className={button} onClick={() => { setError(''); void refreshAccess().catch(() => setError('Could not refresh access. Please sign out and sign in again.')); }}>Refresh access</button>
   <button className={button} onClick={() => { setError(''); void logout().catch(() => setError('Sign out failed. Please try again.')); }}>Sign out</button>
 </div> : <button disabled={loading} className={button} onClick={() => { setError(''); void signInWithGoogle().catch(() => setError('Sign in failed. Please try again.')); }}>Sign in with Google</button>}
 <p role="alert">{error || sessionError}</p></section>;
}
