// SVG icons ported 1:1 from the web app's src/components/Icons.jsx.
// RN has no `currentColor` cascade, so each icon takes an explicit `color`.
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { palette } from '@/theme';

type IconProps = { size?: number; color?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
});

export function IconHome({ size = 22, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <Path d="M9 21V12h6v9" />
    </Svg>
  );
}

export function IconTrain({ size = 22, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 3" />
    </Svg>
  );
}

export function IconSchools({ size = 22, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2L2 7l10 5 10-5-10-5z" />
      <Path d="M2 17l10 5 10-5" />
      <Path d="M2 12l10 5 10-5" />
    </Svg>
  );
}

export function IconRoadmap({ size = 22, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h4l3 12h8l3-12h-4" />
      <Circle cx={12} cy={6} r={2} />
    </Svg>
  );
}

export function IconProfile({ size = 22, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </Svg>
  );
}

export function IconChevronRight({ size = 16, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

export function IconChevronDown({ size = 16, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function IconCheck({ size = 16, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

export function IconFlame({ size = 20, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2c0 6-6 8-6 13a6 6 0 0012 0c0-5-6-7-6-13z" />
      <Path d="M12 12c0 3-2 4-2 6a2 2 0 004 0c0-2-2-3-2-6z" />
    </Svg>
  );
}

export function IconArrowLeft({ size = 20, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

export function IconPlus({ size = 18, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconX({ size = 18, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

export function IconSearch({ size = 18, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={11} cy={11} r={8} />
      <Path d="M21 21l-4.35-4.35" />
    </Svg>
  );
}

export function IconLock({ size = 14, color = palette.text }: IconProps) {
  return (
    <Svg {...base(size)} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={11} width={18} height={11} rx={2} />
      <Path d="M7 11V7a5 5 0 0110 0v4" />
    </Svg>
  );
}
