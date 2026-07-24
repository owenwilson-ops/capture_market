// Event categories for the calendar. Each event stores its category key in the
// `type` column; the COLOR is resolved here at render time, so a user can
// recolor a category and every existing event updates. Color overrides persist
// in AsyncStorage (same as theme mode) — events keep meaning, not raw colors.
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

export type EventCategory = { key: string; label: string; color: string };

export const EVENT_CATEGORIES: { key: string; label: string; defaultColor: string }[] = [
  { key: 'official-visit', label: 'Official Visit', defaultColor: '#34C759' },
  { key: 'game', label: 'Game / Tournament', defaultColor: '#3B82F6' },
  { key: 'camp', label: 'Camp', defaultColor: '#F59E0B' },
  { key: 'showcase', label: 'Showcase', defaultColor: '#8B5CF6' },
  { key: 'practice', label: 'Practice', defaultColor: '#14B8A6' },
  { key: 'other', label: 'Other', defaultColor: '#8E8E93' },
];

export const DEFAULT_CATEGORY = 'game';

// Palette offered when recoloring a category.
export const COLOR_SWATCHES = [
  '#34C759', '#3B82F6', '#F59E0B', '#8B5CF6',
  '#14B8A6', '#EF4444', '#EC4899', '#F97316',
  '#06B6D4', '#84CC16', '#6366F1', '#8E8E93',
];

const STORAGE_KEY = 'eventCategoryColors';

type ColorMap = Record<string, string>;

type Value = {
  categories: EventCategory[];
  colorForType: (type?: string | null) => string;
  labelForType: (type?: string | null) => string;
  setCategoryColor: (key: string, color: string) => void;
};

const Ctx = createContext<Value | null>(null);

export function EventCategoriesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<ColorMap>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (!v) return;
      try {
        const parsed = JSON.parse(v);
        if (parsed && typeof parsed === 'object') setOverrides(parsed);
      } catch {
        // ignore corrupt value
      }
    });
  }, []);

  const setCategoryColor = useCallback((key: string, color: string) => {
    setOverrides((prev) => {
      const next = { ...prev, [key]: color };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const categories = useMemo<EventCategory[]>(
    () => EVENT_CATEGORIES.map((cat) => ({ key: cat.key, label: cat.label, color: overrides[cat.key] || cat.defaultColor })),
    [overrides]
  );

  const colorForType = useCallback(
    (type?: string | null) => {
      const hit = categories.find((x) => x.key === type);
      return hit ? hit.color : categories.find((x) => x.key === 'other')!.color;
    },
    [categories]
  );

  const labelForType = useCallback(
    (type?: string | null) => {
      const hit = categories.find((x) => x.key === type);
      return hit ? hit.label : 'Other';
    },
    [categories]
  );

  const value = useMemo<Value>(
    () => ({ categories, colorForType, labelForType, setCategoryColor }),
    [categories, colorForType, labelForType, setCategoryColor]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEventCategories(): Value {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEventCategories must be used within an EventCategoriesProvider');
  return ctx;
}
