// Post-workout journal entries, stored on-device per user (AsyncStorage), like
// events and academics. Kept off Supabase on purpose: adding columns to
// sessionLogs would need a migration that may never run, and worse, a failed
// insert could break session logging itself. Local storage makes it work with
// zero setup. Revisit with a table if journals ever need to sync across devices.
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

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  planId: string;
  planTitle: string;
  rating: number; // 1–5, 0 = unrated
  focus: string[];
  notes: string;
  createdAt: string;
};

type Value = {
  entries: JournalEntry[];
  loading: boolean;
  addEntry: (e: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<void>;
  entryFor: (date: string, planId: string) => JournalEntry | undefined;
};

const Ctx = createContext<Value | null>(null);
const keyFor = (userId?: string | null) => `journal:${userId || 'anon'}`;
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function JournalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    AsyncStorage.getItem(keyFor(userId))
      .then((raw) => {
        if (!active) return;
        try {
          setEntries(raw ? (JSON.parse(raw) as JournalEntry[]) : []);
        } catch {
          setEntries([]);
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  const addEntry = useCallback<Value['addEntry']>(
    async (e) => {
      const entry: JournalEntry = { ...e, id: newId(), createdAt: new Date().toISOString() };
      setEntries((prev) => {
        const next = [entry, ...prev];
        AsyncStorage.setItem(keyFor(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId]
  );

  // Most recent entry for a given day + plan (used to surface on the calendar).
  const entryFor = useCallback<Value['entryFor']>(
    (date, planId) => entries.find((e) => e.date === date && e.planId === planId),
    [entries]
  );

  const value = useMemo<Value>(() => ({ entries, loading, addEntry, entryFor }), [entries, loading, addEntry, entryFor]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJournal(): Value {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useJournal must be used within a JournalProvider');
  return ctx;
}
