'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function Login() {
 const { user, isAdminUser, loading, signInWithGoogle } = useAuth();
 const router = useRouter(); const [error, setError] = useState('');
 useEffect(() => { if (!loading && isAdminUser) router.replace('/admin'); }, [loading, isAdminUser, router]);
 return <section className="max-w-md mx-auto p-8 text-center"><h1 className="text-2xl font-bold mb-4">Administrator sign in</h1>
 {user && !loading && !isAdminUser && <p>Administrator access is required.</p>}
 <button className="bg-indigo-600 text-white rounded-xl px-6 py-3" onClick={() => signInWithGoogle().catch(() => setError('Sign in failed. Please try again.'))}>Sign in with Google</button><p role="alert">{error}</p></section>;
}
