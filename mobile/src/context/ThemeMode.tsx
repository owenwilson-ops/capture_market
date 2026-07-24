import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkPalette, lightPalette, type Palette } from '@/theme';

export type ThemeMode = 'light' | 'dark' | 'auto';
const STORAGE_KEY = 'themeMode';

// "Auto" follows the time of day: daytime is light, evening/night is dark.
function autoScheme(): 'light' | 'dark' {
  const h = new Date().getHours();
  return h >= 7 && h < 19 ? 'light' : 'dark';
}

type ThemeModeValue = {
  mode: ThemeMode;
  scheme: 'light' | 'dark';
  palette: Palette;
  setMode: (m: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [, setTick] = useState(0); // forces re-eval of auto scheme over time

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'auto') setModeState(v);
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  // While on auto, recheck the clock periodically and on app foreground.
  useEffect(() => {
    if (mode !== 'auto') return;
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setTick((t) => t + 1);
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [mode]);

  const scheme = mode === 'auto' ? autoScheme() : mode;
  const palette = scheme === 'light' ? lightPalette : darkPalette;

  const value = useMemo(
    () => ({ mode, scheme, palette, setMode }),
    [mode, scheme, palette, setMode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}

export const usePalette = () => useThemeMode().palette;
