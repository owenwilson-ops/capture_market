import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { SCHOOLS } from '@/shared-data/schools';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export type ThemeColors = {
  primary: string;
  secondary: string;
  textOnPrimary: string;
};

const FALLBACK: ThemeColors = {
  primary: '#2A2A3E',
  secondary: '#4A4A6A',
  textOnPrimary: '#FFFFFF',
};

const ThemeContext = createContext<ThemeColors>(FALLBACK);

// Mirrors the web hook useTheme(dreamSchoolId): pick the dream school's colors,
// falling back to the "undecided" school, then to the neutral default.
function colorsForSchool(dreamSchoolId?: string | null): ThemeColors {
  const school =
    SCHOOLS.find((s: any) => s.id === dreamSchoolId) ||
    SCHOOLS.find((s: any) => s.id === 'undecided');
  if (!school) return FALLBACK;
  return {
    primary: school.primaryColor,
    secondary: school.secondaryColor,
    textOnPrimary: school.textOnPrimary || '#FFFFFF',
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const colors = useMemo(() => colorsForSchool(profile?.dreamSchoolId), [profile?.dreamSchoolId]);

  return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>;
}

export const useThemeColors = () => useContext(ThemeContext);
