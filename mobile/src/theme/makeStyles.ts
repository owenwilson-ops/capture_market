import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { usePalette } from '@/context/ThemeMode';
import type { Palette } from '@/theme';

// Build a themed StyleSheet that recomputes when the active palette changes.
// Usage:
//   const useStyles = makeStyles((c) => ({ root: { backgroundColor: c.bg } }));
//   function Screen() { const styles = useStyles(); ... }
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (c: Palette) => T) {
  return function useStyles(): T {
    const c = usePalette();
    return useMemo(() => StyleSheet.create(factory(c)), [c]);
  };
}
