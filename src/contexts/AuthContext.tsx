'use client';

import { onIdTokenChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, signOut, googleProvider, signInWithPopup, User } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdminUser: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdminUser: false,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAdminUser, setIsAdminUser] = useState(false);
  useEffect(() => {
    let generation = 0;
    const unsubscribe = onIdTokenChanged(auth, async (u) => {
      const current = ++generation;
      setLoading(true); setIsAdminUser(false); setUser(u);
      try {
        if (u) {
          const token = await u.getIdTokenResult();
          const response = await fetch('/api/session', { method: 'POST', headers: { Authorization: `Bearer ${token.token}` } });
          if (current === generation) setIsAdminUser(response.ok && token.claims.admin === true);
        } else { await fetch('/api/session', { method: 'DELETE' }); }
      } catch { if (current === generation) setIsAdminUser(false); }
      finally { if (current === generation) setLoading(false); }
    });
    const timer = setInterval(() => { auth.currentUser?.getIdToken(true).catch(() => {}); }, 50 * 60 * 1000);
    return () => { generation++; unsubscribe(); clearInterval(timer); };
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
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
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
