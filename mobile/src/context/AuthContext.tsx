import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signUp: (email: string, password: string) => ReturnType<typeof supabase.auth.signUp>;
  signOut: () => ReturnType<typeof supabase.auth.signOut>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Supabase recommends driving token auto-refresh off app foreground/background
// on React Native (there is no browser tab lifecycle).
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string) => supabase.auth.signUp({ email, password });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
