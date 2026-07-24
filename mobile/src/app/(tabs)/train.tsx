import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { TRAINING_PLANS, plansForPosition, weeklyPlanForPosition } from '@/shared-data/trainingData';
import { IconChevronRight, IconCheck } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useEvents } from '@/hooks/useEvents';
import { useEventCategories } from '@/context/EventCategories';
import { useJournal } from '@/hooks/useJournal';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette } from '@/context/ThemeMode';
import { supabase } from '@/lib/supabase';
import { fonts, withAlpha, mix } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Local YYYY-MM-DD key (avoids UTC drift from toISOString).
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// The 7 dates of the week containing `ref`, Monday first.
function weekDates(ref: Date): Date[] {
  const day = ref.getDay(); // 0 = Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function findPlan(planId?: string | null) {
  return TRAINING_PLANS.find((p: any) => p.id === planId);
}

// Logs include the Home wall-ball timer (planId 'wall-ball'), which is not a
// full training plan — label it instead of falling through to a broken link.
function planTitle(planId?: string | null): string {
  if (planId === 'wall-ball') return 'Wall Ball';
  return findPlan(planId)?.title || 'Session';
}

function SecondaryChip({ label }: { label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.secChip}>
      <Text style={styles.secChipText}>{label}</Text>
    </View>
  );
}

function PlanCard({
  title,
  focus,
  kicker,
  primary,
  blocks,
  minutes,
  onPress,
}: {
  title: string;
  focus: string;
  kicker?: string;
  primary: string;
  blocks: number;
  minutes: number;
  onPress: () => void;
}) {
  const c = usePalette();
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <LinearGradient
        colors={[c.surfaceHigh, c.surfaceLow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planCard}>
        <View style={[styles.accentBar, { backgroundColor: primary }]} />
        <View style={{ paddingLeft: 12 }}>
          {!!kicker && <Text style={styles.kicker}>{kicker}</Text>}
          <View style={styles.planTopRow}>
            <Text style={styles.planTitle}>{title}</Text>
            <IconChevronRight size={16} color={c.textGhost} />
          </View>
          <Text style={styles.planFocus}>{focus}</Text>
          <View style={styles.chipRow}>
            <SecondaryChip label={`${blocks} Blocks`} />
            <SecondaryChip label={`${minutes} min`} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

type SessionLog = { planId: string | null; completedAt: string; durationMinutes: number | null };

function CalendarView({ primary }: { primary: string }) {
  const { user } = useAuth();
  const c = usePalette();
  const styles = useStyles();
  const router = useRouter();
  const { events } = useEvents();
  const { colorForType, labelForType } = useEventCategories();
  const { entryFor } = useJournal();
  const [logs, setLogs] = useState<SessionLog[]>([]);

  const week = weekDates(new Date());
  const weekKeys = week.map((d) => dateKey(d));
  const todayKey = dateKey(new Date());
  const [selectedKey, setSelectedKey] = useState(todayKey);

  // Events falling in the visible week, grouped by day.
  const eventsByDay: Record<string, typeof events> = {};
  for (const e of events) {
    if (weekKeys.includes(e.date)) (eventsByDay[e.date] ||= []).push(e);
  }

  const load = useCallback(async () => {
    if (!user) return;
    const start = week[0].toISOString();
    const end = new Date(week[6].getTime() + 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('sessionLogs')
      .select('planId, completedAt, durationMinutes')
      .eq('userId', user.id)
      .gte('completedAt', start)
      .lt('completedAt', end)
      .order('completedAt', { ascending: true });
    if (data) setLogs(data as SessionLog[]);
    // week[] is stable per render; recompute is cheap and avoids stale deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Refetch whenever the tab regains focus (e.g. returning from a finished session).
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Completed session logs grouped by local day key.
  const byDay: Record<string, SessionLog[]> = {};
  for (const l of logs) {
    const k = dateKey(new Date(l.completedAt));
    (byDay[k] ||= []).push(l);
  }

  const selEvents = eventsByDay[selectedKey] || [];
  const selLogs = byDay[selectedKey] || [];
  const selLabel = new Date(`${selectedKey}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View>
      <View style={styles.calRow}>
        {week.map((d, i) => {
          const key = dateKey(d);
          const done = (byDay[key]?.length || 0) > 0;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          return (
            <Pressable key={key} style={styles.calCell} onPress={() => setSelectedKey(key)}>
              <Text style={[styles.calDow, isToday && { color: primary }]}>{WEEK_DAYS[i]}</Text>
              <View
                style={[
                  styles.calDot,
                  done
                    ? { backgroundColor: primary, borderColor: primary }
                    : {
                        backgroundColor: isSelected ? withAlpha(primary, 0.14) : 'transparent',
                        borderColor: isSelected || isToday ? primary : c.borderStrong,
                      },
                ]}>
                {done ? (
                  <IconCheck size={12} color="#fff" />
                ) : (
                  <Text style={[styles.calDate, (isToday || isSelected) && { color: primary }]}>{d.getDate()}</Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 3, height: 5, marginTop: 3 }}>
                {(eventsByDay[key] || []).slice(0, 3).map((e, idx) => (
                  <View key={idx} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colorForType(e.type) }} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.dayPanel}>
        <Text style={styles.dayPanelLabel}>{selLabel}</Text>
        {selEvents.length === 0 && selLogs.length === 0 ? (
          <Text style={styles.dayPanelEmpty}>Nothing scheduled. Add an event from the Home calendar.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {/* Upcoming events for this day — never labeled completed */}
            {selEvents.map((event) => (
              <View
                key={event.id}
                style={[styles.logRow, { backgroundColor: mix(colorForType(event.type), c.surfaceDeep, 0.05), borderColor: c.borderSoft }]}>
                <View style={[styles.rowDot, { backgroundColor: colorForType(event.type) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTitle}>{event.title}</Text>
                  <Text style={styles.logMeta}>{labelForType(event.type)}{event.notes ? ` · ${event.notes}` : ''}</Text>
                </View>
              </View>
            ))}
            {/* Training actually completed on this day */}
            {selLogs.map((e, idx) => {
              const plan = findPlan(e.planId);
              const entry = e.planId ? entryFor(selectedKey, e.planId) : undefined;
              const hasJournal = entry && (entry.rating > 0 || !!entry.notes);
              return (
                <Pressable
                  key={`log-${idx}`}
                  disabled={!plan}
                  onPress={() => plan && router.push(`/train/session/${plan.id}`)}
                  style={({ pressed }) => [styles.logRow, { alignItems: 'flex-start', backgroundColor: mix(primary, c.surfaceDeep, 0.05), borderColor: c.borderSoft, opacity: pressed && plan ? 0.9 : 1 }]}>
                  <View style={[styles.completedBadge, { borderColor: withAlpha(primary, 0.4) }]}>
                    <IconCheck size={12} color={primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logTitle}>{planTitle(e.planId)}</Text>
                    <Text style={[styles.logMeta, { color: primary }]}>Completed{e.durationMinutes ? ` · ${e.durationMinutes} min` : ''}</Text>
                    {hasJournal && (
                      <Text style={styles.journalNote} numberOfLines={3}>
                        {entry!.rating > 0 ? `Felt ${entry!.rating}/5` : ''}
                        {entry!.rating > 0 && entry!.notes ? ' · ' : ''}
                        {entry!.notes}
                      </Text>
                    )}
                  </View>
                  {plan && <IconChevronRight size={16} color={c.textGhost} />}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

export default function TrainScreen() {
  const [tab, setTab] = useState<'skill' | 'week' | 'calendar'>('skill');
  const [selectedDay, setSelectedDay] = useState(Math.max(0, Math.min(4, new Date().getDay() - 1)));
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const colors = useThemeColors();
  const c = usePalette();
  const styles = useStyles();
  const activeDayIndex = Math.max(0, Math.min(4, new Date().getDay() - 1));

  // Plans tailored to the athlete's position (falls back to all if unset).
  const position = profile?.position as string | undefined;
  const plans = plansForPosition(position);
  const weeklyPlan = weeklyPlanForPosition(position);

  const open = (id: string) => router.push(`/train/session/${id}`);
  const dayEntry = weeklyPlan.days[selectedDay];
  const weekPlan = TRAINING_PLANS.find((p: any) => p.id === dayEntry.planId);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[withAlpha(colors.primary, 0.18), c.bg]} style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <Text style={styles.h1}>Training Plans</Text>
            <Text style={styles.sub}>Every session opens with 20 minutes of wall ball. No exceptions.</Text>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          {/* Segmented tabs */}
          <View style={styles.segment}>
            {([['skill', 'Skill'], ['week', 'Week'], ['calendar', 'Calendar']] as const).map(([key, label]) => {
              const active = tab === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  style={[styles.segBtn, active && { backgroundColor: colors.primary }]}>
                  <Text style={[styles.segText, active && { color: colors.textOnPrimary }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          {tab === 'skill' && (
            <View style={{ gap: 10 }}>
              <Text style={styles.positionNote}>
                {position ? `Tailored for your position: ${position}` : 'Set your position in Profile to tailor these workouts.'}
              </Text>
              {plans.map((plan: any) => (
                <PlanCard
                  key={plan.id}
                  title={plan.title}
                  focus={plan.focus}
                  primary={colors.primary}
                  blocks={plan.blocks.length}
                  minutes={plan.totalMinutes}
                  onPress={() => open(plan.id)}
                />
              ))}
            </View>
          )}

          {tab === 'week' && (
            <View>
              <View style={styles.dayRow}>
                {DAYS.map((d, i) => {
                  const active = selectedDay === i;
                  const isToday = i === activeDayIndex;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setSelectedDay(i)}
                      style={[
                        styles.dayBtn,
                        {
                          backgroundColor: active ? colors.primary : isToday ? c.fieldBg : 'transparent',
                          borderColor: active ? colors.primary : c.borderSoft,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.dayText,
                          { color: active ? colors.textOnPrimary : isToday ? c.textDim : c.textMuted },
                        ]}>
                        {d}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {weekPlan && (
                <PlanCard
                  title={weekPlan.title}
                  focus={weekPlan.focus}
                  kicker={dayEntry.day}
                  primary={colors.primary}
                  blocks={weekPlan.blocks.length}
                  minutes={weekPlan.totalMinutes}
                  onPress={() => open(weekPlan.id)}
                />
              )}
            </View>
          )}

          {tab === 'calendar' && <CalendarView primary={colors.primary} />}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  hero: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  h1: { fontFamily: fonts.display, fontSize: 48, letterSpacing: 3, color: c.text, lineHeight: 50 },
  sub: { color: c.textMuted, fontSize: 13, marginTop: 6, fontFamily: fonts.body },
  positionNote: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: c.textMuted, marginBottom: 4 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  segment: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 24,
    backgroundColor: c.fieldBg,
    borderWidth: 1,
    borderColor: c.borderSoft,
    borderRadius: 12,
    padding: 4,
  },
  segBtn: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  segText: { fontFamily: fonts.semibold, fontSize: 14, color: c.textMuted },
  planCard: { borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 20, overflow: 'hidden' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  kicker: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.textMuted, marginBottom: 10 },
  planTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  planTitle: { fontFamily: fonts.display, fontSize: 26, letterSpacing: 2, color: c.text, flex: 1 },
  planFocus: { fontSize: 12, color: c.textMuted, marginTop: 4, marginBottom: 12, fontFamily: fonts.body },
  chipRow: { flexDirection: 'row', gap: 6 },
  secChip: {
    backgroundColor: 'rgba(106,94,122,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(106,94,122,0.25)',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  secChipText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(150,135,175,0.95)' },
  dayRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dayBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  dayText: { fontSize: 13, fontFamily: fonts.semibold },
  // Calendar
  calRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  calCell: { alignItems: 'center', gap: 8, flex: 1 },
  calDow: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: c.textMuted },
  calDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  calDate: { fontFamily: fonts.semibold, fontSize: 14, color: c.textDim },
  dayPanel: { backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 16 },
  dayPanelLabel: { fontFamily: fonts.semibold, fontSize: 15, color: c.text, marginBottom: 12 },
  dayPanelEmpty: { fontFamily: fonts.body, fontSize: 13, color: c.textMuted },
  rowDot: { width: 10, height: 10, borderRadius: 5 },
  completedBadge: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 12, padding: 14 },
  logDayBadge: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  logDow: { fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1, textTransform: 'uppercase' },
  logDate: { fontFamily: fonts.display, fontSize: 18, color: c.text, letterSpacing: 1 },
  logTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  logMeta: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: c.textMuted, marginTop: 3 },
  journalNote: { fontFamily: fonts.body, fontSize: 13, color: c.textDim, lineHeight: 19, marginTop: 6 },
  emptyCard: { backgroundColor: c.surfaceDeep, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.textDim },
  emptySub: { fontFamily: fonts.body, fontSize: 13, color: c.textMuted, marginTop: 6, textAlign: 'center' },
}));
