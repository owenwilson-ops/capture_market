// Shared UI primitives that recreate the web app's index.css design system
// (gradient cards, ambient radial glow, chips, buttons) with RN primitives.
// All colors come from the active palette so they re-theme (light/dark).
import { type ReactNode } from 'react';
import { View, Text, Pressable, type ViewStyle, type StyleProp, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { fonts, radius, withAlpha } from '@/theme';
import { usePalette } from '@/context/ThemeMode';

/** Soft radial background glow — approximates CSS radial-gradient(). */
export function AmbientGlow({
  color,
  size = 500,
  opacity = 0.25,
  style,
}: {
  color: string;
  size?: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const c = usePalette();
  const o = opacity * c.glowOpacity;
  return (
    <View style={[{ width: size, height: size, pointerEvents: 'none' }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={o} />
            <Stop offset="70%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill="url(#glow)" />
      </Svg>
    </View>
  );
}

/** Card with the surface gradient + hairline border. */
export function GradientCard({
  children,
  style,
  alt = false,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  alt?: boolean;
}) {
  const c = usePalette();
  const colors = alt
    ? ([c.surfaceAltHigh, c.surfaceAltLow] as const)
    : ([c.surfaceHigh, c.surfaceLow] as const);
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderWidth: 1, borderColor: c.border, borderRadius: radius.lg }, style]}>
      {children}
    </LinearGradient>
  );
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = usePalette();
  return (
    <Text
      style={[
        {
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: c.textMuted,
          marginBottom: 12,
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 4,
        paddingVertical: 3,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
        backgroundColor: withAlpha(color, 0.18),
        borderColor: withAlpha(color, 0.35),
      }}>
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color,
        }}>
        {label}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  color,
  textColor = '#fff',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  color: string;
  textColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          borderRadius: radius.sm,
          paddingVertical: 13,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
        },
        { backgroundColor: color, opacity: disabled ? 0.6 : pressed ? 0.88 : 1 },
        style,
      ]}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, letterSpacing: 0.2, color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const c = usePalette();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: radius.sm,
          paddingVertical: 13,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.fieldBg,
          borderWidth: 1,
          borderColor: c.borderStrong,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.textDim }}>{label}</Text>
    </Pressable>
  );
}
