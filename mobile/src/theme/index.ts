// Design tokens ported from the web app's src/index.css.
// RN has no CSS variables / color-mix, so the equivalents live here as JS.
// Two palettes (dark + light) share the same keys; the active one is provided
// at runtime by ThemeMode (see src/context/ThemeMode.tsx) so screens re-theme.

export type Palette = {
  scheme: 'dark' | 'light';
  bg: string;
  surfaceHigh: string; // card gradient top
  surfaceLow: string; // card gradient bottom
  surfaceAltHigh: string; // school-card gradient top
  surfaceAltLow: string; // school-card gradient bottom
  surfaceDeep: string; // recessed blocks (timeline / roadmap rows)
  surfaceRaised: string; // raised inner rows
  text: string;
  textDim: string;
  textMuted: string;
  textFaint: string;
  textGhost: string;
  border: string;
  borderSoft: string;
  borderStrong: string;
  fieldBg: string;
  navBg: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  accentBtn: string; // auth button (pre-theme)
  glowOpacity: number; // how strong ambient glows render per scheme
};

export const darkPalette: Palette = {
  scheme: 'dark',
  bg: '#0A0812',
  surfaceHigh: '#181424',
  surfaceLow: '#120f1c',
  surfaceAltHigh: '#161222',
  surfaceAltLow: '#110e1a',
  surfaceDeep: '#13101A',
  surfaceRaised: '#1A1525',
  text: '#F0EAFB',
  textDim: 'rgba(240,234,248,0.55)',
  textMuted: 'rgba(240,234,248,0.35)',
  textFaint: 'rgba(240,234,248,0.30)',
  textGhost: 'rgba(240,234,248,0.25)',
  border: 'rgba(255,255,255,0.08)',
  borderSoft: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.15)',
  fieldBg: 'rgba(255,255,255,0.05)',
  navBg: 'rgba(12,9,20,0.95)',
  danger: '#FF8080',
  dangerBg: 'rgba(255,80,80,0.10)',
  dangerBorder: 'rgba(255,80,80,0.25)',
  accentBtn: 'rgba(120,90,200,0.9)',
  glowOpacity: 1,
};

export const lightPalette: Palette = {
  scheme: 'light',
  bg: '#F4F1FA',
  surfaceHigh: '#FFFFFF',
  surfaceLow: '#F3EFFA',
  surfaceAltHigh: '#FFFFFF',
  surfaceAltLow: '#F1ECF8',
  surfaceDeep: '#FFFFFF',
  surfaceRaised: '#FBF9FE',
  text: '#1B1726',
  textDim: 'rgba(27,23,38,0.65)',
  textMuted: 'rgba(27,23,38,0.50)',
  textFaint: 'rgba(27,23,38,0.42)',
  textGhost: 'rgba(27,23,38,0.32)',
  border: 'rgba(20,12,40,0.12)',
  borderSoft: 'rgba(20,12,40,0.09)',
  borderStrong: 'rgba(20,12,40,0.22)',
  fieldBg: 'rgba(20,12,40,0.04)',
  navBg: 'rgba(255,255,255,0.96)',
  danger: '#C0341E',
  dangerBg: 'rgba(192,52,30,0.10)',
  dangerBorder: 'rgba(192,52,30,0.28)',
  accentBtn: 'rgba(120,90,200,0.95)',
  glowOpacity: 0.5,
};

// Fallback for any non-themed module scope (e.g. Icons default color).
export const palette = darkPalette;

// Font family keys must match the names passed to useFonts() in _layout.tsx.
export const fonts = {
  display: 'BebasNeue_400Regular',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const radius = { sm: 8, md: 12, lg: 14, xl: 18, pill: 20 } as const;

function clampHex(h: string): string {
  return h.replace('#', '').trim();
}

function hexToRgb(hex: string): [number, number, number] {
  let h = clampHex(hex);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Equivalent of rgba() over a hex color. alpha is 0..1. */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Equivalent of CSS `color-mix(in srgb, a weight%, b)`.
 * weight is 0..1 (share of `a`). Returns an #RRGGBB string.
 */
export function mix(a: string, b: string, weight: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const w = Math.max(0, Math.min(1, weight));
  const r = Math.round(ar * w + br * (1 - w));
  const g = Math.round(ag * w + bg * (1 - w));
  const bch = Math.round(ab * w + bb * (1 - w));
  return `#${[r, g, bch].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
