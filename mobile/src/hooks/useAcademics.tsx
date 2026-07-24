// Athlete academic profile (GPA + optional test scores), stored on-device per
// user via AsyncStorage. Kept off the Supabase profiles table on purpose: adding
// columns there needs a migration that may not be run (see the events lesson),
// and these inputs only drive the on-device academics view. Revisit with profile
// columns if academics ever need to sync across devices.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

export type Academics = { gpa: string; sat: string; act: string };
type Field = keyof Academics;

const EMPTY: Academics = { gpa: '', sat: '', act: '' };

type Value = {
  academics: Academics;
  loading: boolean;
  setField: (field: Field, value: string) => void;
};

const Ctx = createContext<Value | null>(null);
const keyFor = (userId?: string | null) => `academics:${userId || 'anon'}`;

export function AcademicsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [academics, setAcademics] = useState<Academics>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    AsyncStorage.getItem(keyFor(userId))
      .then((raw) => {
        if (!active) return;
        try {
          setAcademics(raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY);
        } catch {
          setAcademics(EMPTY);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  const setField = useCallback(
    (field: Field, value: string) => {
      setAcademics((prev) => {
        const next = { ...prev, [field]: value };
        AsyncStorage.setItem(keyFor(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId]
  );

  const value = useMemo<Value>(() => ({ academics, loading, setField }), [academics, loading, setField]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAcademics(): Value {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAcademics must be used within an AcademicsProvider');
  return ctx;
}
