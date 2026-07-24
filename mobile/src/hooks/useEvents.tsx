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

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type?: string | null;
  notes?: string | null;
  createdAt?: string;
};

type EventsValue = {
  events: CalendarEvent[];
  loading: boolean;
  addEvent: (e: { title: string; date: string; type?: string; notes?: string }) => Promise<{ error: any }>;
  deleteEvent: (id: string) => Promise<{ error: any }>;
  refetch: () => Promise<void>;
};

// Events are stored on-device (AsyncStorage), keyed per user, like theme mode
// and category colors. This was previously a Supabase table that required a
// manual migration that was never run, so every add failed silently and nothing
// showed on the calendars. Local storage makes it work with zero setup. Tradeoff:
// device-local, not synced across devices — revisit with a Supabase table if
// cross-device sync is needed.
const EventsContext = createContext<EventsValue | null>(null);

const keyFor = (userId?: string | null) => `events:${userId || 'anon'}`;
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function EventsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(keyFor(userId));
      const parsed = raw ? (JSON.parse(raw) as CalendarEvent[]) : [];
      parsed.sort((a, b) => a.date.localeCompare(b.date));
      setEvents(parsed);
    } catch {
      setEvents([]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const persist = useCallback(
    async (next: CalendarEvent[]) => {
      const sorted = [...next].sort((a, b) => a.date.localeCompare(b.date));
      setEvents(sorted);
      await AsyncStorage.setItem(keyFor(userId), JSON.stringify(sorted));
    },
    [userId]
  );

  const addEvent = useCallback<EventsValue['addEvent']>(
    async (e) => {
      const event: CalendarEvent = {
        id: newId(),
        title: e.title,
        date: e.date,
        type: e.type ?? null,
        notes: e.notes ?? null,
        createdAt: new Date().toISOString(),
      };
      await persist([...events, event]);
      return { error: null };
    },
    [events, persist]
  );

  const deleteEvent = useCallback<EventsValue['deleteEvent']>(
    async (id) => {
      await persist(events.filter((e) => e.id !== id));
      return { error: null };
    },
    [events, persist]
  );

  const value = useMemo<EventsValue>(
    () => ({ events, loading, addEvent, deleteEvent, refetch: fetchEvents }),
    [events, loading, addEvent, deleteEvent, fetchEvents]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within an EventsProvider');
  return ctx;
}
