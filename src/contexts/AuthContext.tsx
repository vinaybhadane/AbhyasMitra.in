'use client';

import { onIdTokenChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, signOut, googleProvider, signInWithPopup, User } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdminUser: boolean;
  loading: boolean;
  sessionError: string | null;
  refreshAccess: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdminUser: false,
  loading: true,
  sessionError: null,
  refreshAccess: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [isAdminUser, setIsAdminUser] = useState(false);
  useEffect(() => {
    let generation = 0;
    const unsubscribe = onIdTokenChanged(auth, async (u) => {
      const current = ++generation;
      setLoading(true); setIsAdminUser(false); setSessionError(null); setUser(u);
      try {
        if (u) {
          const token = await u.getIdTokenResult();
          const response = await fetch('/api/session', { method: 'POST', headers: { Authorization: `Bearer ${token.token}` } });
          const result = response.ok ? await response.json() : null;
          if (current === generation) {
            setIsAdminUser(response.ok && result?.admin === true && token.claims.admin === true);
            if (!response.ok) setSessionError(response.status >= 500
              ? 'Server sign-in is unavailable. The site owner needs to check the server configuration.'
              : 'We could not verify your sign-in. Please sign out and try again.');
          }
        } else { await fetch('/api/session', { method: 'DELETE' }); }
      } catch {
        if (current === generation) {
          setIsAdminUser(false);
          setSessionError('We could not connect to the sign-in service. Please try again.');
        }
      }
      finally { if (current === generation) setLoading(false); }
    });
    const timer = setInterval(() => { auth.currentUser?.getIdToken(true).catch(() => {}); }, 50 * 60 * 1000);
    return () => { generation++; unsubscribe(); clearInterval(timer); };
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const refreshAccess = async () => {
    if (auth.currentUser) await auth.currentUser.getIdToken(true);
  };

  const logout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdminUser,
        loading,
        sessionError,
        refreshAccess,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
