// Monthly calendar grid used on the Home tab. Marks days that have a logged
// training session and/or an athlete-added event, and reports the tapped day.
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { usePalette } from '@/context/ThemeMode';
import { fonts, withAlpha } from '@/theme';
import { IconChevronRight } from '@/components/Icons';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MonthCalendar({
  eventColorsByDay,
  sessionDays,
  selectedKey,
  onSelectDay,
  primary,
  showLegend = true,
}: {
  eventColorsByDay: Record<string, string[]>;
  sessionDays: Set<string>;
  selectedKey: string | null;
  onSelectDay: (key: string) => void;
  primary: string;
  showLegend?: boolean;
}) {
  const c = usePalette();
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const todayKey = dateKey(today);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Leading blanks + each day of the month.
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (delta: number) => setView(new Date(year, month + delta, 1));

  return (
    <View style={{ backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Pressable onPress={() => shiftMonth(-1)} hitSlop={10} style={{ transform: [{ rotate: '180deg' }], padding: 4 }}>
          <IconChevronRight size={18} color={c.textMuted} />
        </Pressable>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, letterSpacing: 2, color: c.text }}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={() => shiftMonth(1)} hitSlop={10} style={{ padding: 4 }}>
          <IconChevronRight size={18} color={c.textMuted} />
        </Pressable>
      </View>

      {/* Weekday labels */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {WEEKDAYS.map((w, i) => (
          <Text
            key={i}
            style={{ flex: 1, textAlign: 'center', fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: c.textFaint }}>
            {w}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={`b-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          const key = dateKey(d);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const eventColors = eventColorsByDay[key] || [];
          const hasSession = sessionDays.has(key);
          return (
            <Pressable
              key={key}
              onPress={() => onSelectDay(key)}
              style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? primary : isToday ? withAlpha(primary, 0.14) : 'transparent',
                  borderWidth: isToday && !isSelected ? 1 : 0,
                  borderColor: withAlpha(primary, 0.5),
                }}>
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 13,
                    color: isSelected ? '#fff' : isToday ? primary : c.textDim,
                  }}>
                  {d.getDate()}
                </Text>
              </View>
              {/* Markers: training session (primary) then a dot per event category */}
              <View style={{ flexDirection: 'row', gap: 3, height: 5, marginTop: 2 }}>
                {hasSession && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : primary }} />}
                {eventColors.slice(0, 3).map((col, idx) => (
                  <View key={idx} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : col }} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' }}>
          <Legend color={primary} label="Training" />
          <Legend color={withAlpha(primary, 0.45)} label="Event" />
        </View>
      )}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const c = usePalette();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: c.textMuted }}>{label}</Text>
    </View>
  );
}
