import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type ProfileValue = {
  profile: any;
  loading: boolean;
  error: any;
  updateProfile: (updates: Record<string, any>) => Promise<{ data?: any; error: any }>;
  refetch: () => Promise<void>;
};

// One shared profile for the whole app. Previously useProfile() was a local
// hook, so every screen (Home, Profile, ThemeContext, ...) held its own copy
// and an update in one place never reached the others — e.g. setting your name
// in Profile left Home still greeting "Athlete". A single provider keeps every
// consumer in sync the moment updateProfile resolves.
const ProfileContext = createContext<ProfileValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') {
      setError(error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Record<string, any>) => {
      if (!userId) return { error: new Error('No user') };
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates, updatedAt: new Date().toISOString() })
        .select()
        .single();
      if (!error) setProfile(data); // single source of truth → all screens re-render
      return { data, error };
    },
    [userId]
  );

  const value = useMemo<ProfileValue>(
    () => ({ profile, loading, error, updateProfile, refetch: fetchProfile }),
    [profile, loading, error, updateProfile, fetchProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

// Signature kept backward-compatible (callers pass user?.id) but the argument is
// now ignored — the provider sources the user from AuthContext itself.
export function useProfile(_userId?: string | null): ProfileValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
