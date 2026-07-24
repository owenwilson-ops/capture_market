import { useState, useEffect, useRef, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { SCHOOLS } from '@/shared-data/schools';
import { NON_NEGOTIABLES } from '@/shared-data/nonNegotiables';
import { TRAINING_PLANS, weeklyPlanForPosition } from '@/shared-data/trainingData';

import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useEvents } from '@/hooks/useEvents';
import { useEventCategories } from '@/context/EventCategories';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette } from '@/context/ThemeMode';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TUTORIAL_HINT_KEY } from '@/lib/tutorial';
import { AmbientGlow, SectionLabel, Chip, PrimaryButton, GhostButton } from '@/components/ui';
import { MonthCalendar, dateKey } from '@/components/MonthCalendar';
import { AddEventSheet } from '@/components/AddEventSheet';
import { IconFlame, IconCheck, IconChevronRight, IconX, IconPlus } from '@/components/Icons';
import { fonts, withAlpha, mix } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function daysUntilGraduation(gradYear?: number) {
  if (!gradYear) return null;
  const grad = new Date(`${gradYear}-06-01`);
  const diff = Math.ceil((grad.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { events, deleteEvent } = useEvents();
  const { colorForType, labelForType } = useEventCategories();
  const colors = useThemeColors();
  const c = usePalette();
  const styles = useStyles();
  const router = useRouter();

  const [checked, setChecked] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [sessionDays, setSessionDays] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<string>(dateKey(new Date()));
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(20 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // One-time pointer to the walkthrough for brand-new athletes.
  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_HINT_KEY).then((v) => {
      if (!v) setShowHint(true);
    });
  }, []);

  function dismissHint() {
    setShowHint(false);
    AsyncStorage.setItem(TUTORIAL_HINT_KEY, '1');
  }

  const school = SCHOOLS.find((s: any) => s.id === profile?.dreamSchoolId);
  // Today's session comes from the athlete's position-tailored week (Mon–Fri).
  const jsDay = new Date().getDay(); // 0 Sun .. 6 Sat
  const weekIdx = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : -1;
  const todayPlanId = weekIdx >= 0 ? weeklyPlanForPosition(profile?.position).days[weekIdx].planId : null;
  const todayPlan = TRAINING_PLANS.find((p: any) => p.id === todayPlanId);

  useEffect(() => {
    if (!user) return;
    async function loadStreak() {
      const today = new Date().toISOString().slice(0, 10);
      const { data: todayEntry } = await supabase
        .from('streaks')
        .select('*')
        .eq('userId', user!.id)
        .eq('date', today)
        .single();
      if (todayEntry?.nonNegotiablesChecked) setChecked(todayEntry.nonNegotiablesChecked);

      const { data: streakData } = await supabase
        .from('streaks')
        .select('date, completed')
        .eq('userId', user!.id)
        .eq('completed', true)
        .order('date', { ascending: false });
      if (streakData) {
        let count = 0;
        let d = new Date();
        for (const row of streakData) {
          const diff = Math.floor((d.getTime() - new Date(row.date).getTime()) / (1000 * 60 * 60 * 24));
          if (diff <= 1) {
            count++;
            d = new Date(row.date);
          } else break;
        }
        setStreak(count);
      }

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('sessionLogs')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user!.id)
        .gte('completedAt', weekStart.toISOString());
      setSessionsThisWeek(count || 0);

      // Days with a logged session (last ~6 months) → calendar markers.
      const since = new Date();
      since.setMonth(since.getMonth() - 6);
      const { data: logRows } = await supabase
        .from('sessionLogs')
        .select('completedAt')
        .eq('userId', user!.id)
        .gte('completedAt', since.toISOString());
      if (logRows) setSessionDays(new Set(logRows.map((r: any) => dateKey(new Date(r.completedAt)))));
    }
    loadStreak();
  }, [user]);

  async function toggleNonNeg(num: number) {
    const newChecked = checked.includes(num) ? checked.filter((n) => n !== num) : [...checked, num];
    setChecked(newChecked);
    const today = new Date().toISOString().slice(0, 10);
    const completed = newChecked.length === NON_NEGOTIABLES.length;
    await supabase
      .from('streaks')
      .upsert(
        { userId: user!.id, date: today, completed, nonNegotiablesChecked: newChecked },
        { onConflict: 'userId,date' }
      );
    if (completed) setStreak((s) => s + 1);
  }

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(
        () => setTimerSeconds((s) => (s <= 1 ? (setTimerRunning(false), 0) : s - 1)),
        1000
      );
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  async function logWallBall() {
    if (!user) return;
    await supabase.from('sessionLogs').insert({
      userId: user.id,
      planId: 'wall-ball',
      completedAt: new Date().toISOString(),
      durationMinutes: Math.round((20 * 60 - timerSeconds) / 60),
    });
    setTimerSeconds(20 * 60);
    setTimerRunning(false);
  }

  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const secs = String(timerSeconds % 60).padStart(2, '0');
  const allChecked = checked.length === NON_NEGOTIABLES.length;
  const days = daysUntilGraduation(profile?.gradYear);

  const eventColorsByDay: Record<string, string[]> = {};
  events.forEach((e) => {
    (eventColorsByDay[e.date] ||= []).push(colorForType(e.type));
  });
  const selectedEvents = events.filter((e) => e.date === selectedDay);
  const selectedHasSession = sessionDays.has(selectedDay);
  const selectedLabel = new Date(`${selectedDay}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <LinearGradient colors={[mix(colors.primary, c.bg, 0.22), c.bg]} style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{profile?.name || 'Athlete'}</Text>
            {school && school.id !== 'undecided' && (
              <View
                style={[
                  styles.schoolChip,
                  {
                    backgroundColor: withAlpha(school.primaryColor, 0.1),
                    borderColor: withAlpha(school.primaryColor, 0.3),
                  },
                ]}>
                <View style={[styles.schoolDot, { backgroundColor: school.primaryColor, shadowColor: school.primaryColor }]} />
                <View>
                  <Text style={styles.schoolName}>{school.name}</Text>
                  {!!school.mascot && (
                    <Text style={[styles.schoolMeta, { color: school.primaryColor }]}>
                      {school.mascot} · {school.conference}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          {showHint && (
            <View style={[styles.hintCard, { borderColor: withAlpha(colors.primary, 0.4), backgroundColor: withAlpha(colors.primary, 0.1) }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hintTitle}>New here?</Text>
                <Text style={styles.hintText}>A quick walkthrough lives in Profile under How to Use.</Text>
                <Pressable onPress={() => { dismissHint(); router.push('/tutorial'); }} style={{ marginTop: 8 }}>
                  <Text style={[styles.hintLink, { color: colors.primary }]}>Take the tour</Text>
                </Pressable>
              </View>
              <Pressable onPress={dismissHint} hitSlop={8}>
                <IconX size={16} color={c.textMuted} />
              </Pressable>
            </View>
          )}

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <StatCard value={String(streak)} label="Streak" color={colors.primary} icon={<IconFlame size={14} color={colors.primary} />} />
            <StatCard value={String(sessionsThisWeek)} label="Sessions" color={colors.primary} />
            <StatCard value={days != null ? String(days) : '—'} label="Days Left" color={colors.primary} small />
          </View>

          {/* Non-Negotiables */}
          <SectionLabel>Today's Non-Negotiables</SectionLabel>
          <View style={{ marginBottom: 28 }}>
            <View style={styles.progressRow}>
              {NON_NEGOTIABLES.map((nn: any) => (
                <View
                  key={nn.number}
                  style={[
                    styles.progressSeg,
                    { backgroundColor: checked.includes(nn.number) ? colors.primary : c.border },
                  ]}
                />
              ))}
            </View>

            <View style={{ gap: 8 }}>
              {NON_NEGOTIABLES.map((nn: any) => {
                const isChecked = checked.includes(nn.number);
                return (
                  <Pressable
                    key={nn.number}
                    onPress={() => toggleNonNeg(nn.number)}
                    style={[
                      styles.nnItem,
                      {
                        backgroundColor: isChecked ? mix(colors.primary, c.surfaceHigh, 0.12) : c.surfaceHigh,
                        borderColor: isChecked ? withAlpha(colors.primary, 0.35) : c.borderSoft,
                      },
                    ]}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isChecked ? colors.primary : c.fieldBg,
                          borderColor: isChecked ? colors.primary : c.borderStrong,
                        },
                      ]}>
                      {isChecked && <IconCheck size={12} color={colors.textOnPrimary} />}
                    </View>
                    <Text
                      style={[
                        styles.nnText,
                        isChecked && { color: c.textDim, textDecorationLine: 'line-through' },
                      ]}>
                      {nn.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {allChecked && (
              <View
                style={[
                  styles.allDone,
                  { backgroundColor: withAlpha(colors.primary, 0.1), borderColor: withAlpha(colors.primary, 0.25) },
                ]}>
                <Text style={[styles.allDoneText, { color: colors.primary }]}>All {NON_NEGOTIABLES.length} complete — streak extended</Text>
              </View>
            )}
          </View>

          {/* Today's Session */}
          <SectionLabel>Today's Session</SectionLabel>
          <View style={{ marginBottom: 28 }}>
            {todayPlan ? (
              <Pressable
                onPress={() => router.push(`/train/session/${todayPlan.id}`)}
                style={({ pressed }) => [styles.sessionCard, { opacity: pressed ? 0.92 : 1 }]}>
                <View style={[styles.sessionBar, { backgroundColor: colors.primary }]} />
                <View style={{ paddingLeft: 12 }}>
                  <Text style={styles.sessionKicker}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })} · Scheduled
                  </Text>
                  <Text style={styles.sessionTitle}>{todayPlan.title}</Text>
                  <Text style={styles.sessionFocus}>{todayPlan.focus}</Text>
                  <View style={styles.sessionFooter}>
                    <Chip label="90 min" color={colors.primary} />
                    <View style={styles.openRow}>
                      <Text style={[styles.openText, { color: colors.primary }]}>Open </Text>
                      <IconChevronRight size={12} color={colors.primary} />
                    </View>
                  </View>
                </View>
              </Pressable>
            ) : (
              <View style={styles.restCard}>
                <Text style={styles.restTitle}>Rest Day</Text>
                <Text style={styles.restSub}>Recovery is training. Sleep and eat well today.</Text>
              </View>
            )}
          </View>

          {/* Calendar */}
          <SectionLabel>Calendar</SectionLabel>
          <View style={{ marginBottom: 28 }}>
            <MonthCalendar
              eventColorsByDay={eventColorsByDay}
              sessionDays={sessionDays}
              selectedKey={selectedDay}
              onSelectDay={setSelectedDay}
              primary={colors.primary}
              showLegend={false}
            />

            <Pressable
              onPress={() => setAddEventOpen(true)}
              style={({ pressed }) => [styles.addEventBtn, { borderColor: withAlpha(colors.primary, 0.4), backgroundColor: withAlpha(colors.primary, 0.1), opacity: pressed ? 0.85 : 1 }]}>
              <IconPlus size={15} color={colors.primary} />
              <Text style={[styles.addEventText, { color: colors.primary }]}>Add Event</Text>
            </Pressable>

            <View style={styles.dayDetail}>
              <Text style={styles.dayDetailLabel}>{selectedLabel}</Text>
              {selectedHasSession && (
                <View style={styles.daySessionRow}>
                  <IconCheck size={12} color={colors.primary} />
                  <Text style={[styles.daySessionText, { color: colors.primary }]}>Training logged</Text>
                </View>
              )}
              {selectedEvents.length === 0 && !selectedHasSession ? (
                <Text style={styles.dayEmpty}>Nothing scheduled. Tap Add Event to put something on this day.</Text>
              ) : (
                selectedEvents.map((e) => (
                  <View key={e.id} style={styles.eventRow}>
                    <View style={[styles.eventDot, { backgroundColor: colorForType(e.type) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{e.title}</Text>
                      <Text style={styles.eventNotes}>{labelForType(e.type)}{e.notes ? ` · ${e.notes}` : ''}</Text>
                    </View>
                    <Pressable onPress={() => deleteEvent(e.id)} hitSlop={8}>
                      <IconX size={14} color={c.textGhost} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Academics */}
          <SectionLabel>Academics</SectionLabel>
          <Pressable
            onPress={() => router.push('/academics')}
            style={({ pressed }) => [styles.academicsCard, { opacity: pressed ? 0.92 : 1 }]}>
            <View style={[styles.sessionBar, { backgroundColor: colors.primary }]} />
            <View style={{ paddingLeft: 12, flex: 1 }}>
              <Text style={styles.sessionKicker}>Eligibility & Fit</Text>
              <Text style={styles.academicsTitle}>Academic Fit</Text>
              <Text style={styles.sessionFocus}>NCAA eligibility and where your GPA stands.</Text>
            </View>
            <IconChevronRight size={16} color={colors.primary} />
          </Pressable>

          {/* Wall Ball Timer */}
          <SectionLabel>Wall Ball Timer</SectionLabel>
          <View style={styles.timerCard}>
            {timerRunning && <AmbientGlow color={colors.primary} size={320} opacity={0.1} style={styles.timerGlow} />}
            <Text
              style={[
                styles.timerText,
                {
                  color: timerRunning ? colors.primary : c.text,
                  textShadowColor: timerRunning ? withAlpha(colors.primary, 0.5) : 'transparent',
                  textShadowRadius: timerRunning ? 24 : 0,
                },
              ]}>
              {mins}:{secs}
            </Text>
            <Text style={styles.timerLabel}>Non-Negotiable · 20:00</Text>
            <View style={styles.timerButtons}>
              <PrimaryButton
                label={timerRunning ? 'Pause' : timerSeconds < 20 * 60 ? 'Resume' : 'Start'}
                onPress={() => setTimerRunning((r) => !r)}
                color={colors.primary}
                textColor={colors.textOnPrimary}
                style={{ minWidth: 120 }}
              />
              {timerSeconds < 20 * 60 && <GhostButton label="Log" onPress={logWallBall} />}
            </View>
            {timerSeconds === 0 && <Text style={styles.timerDone}>Done. Move to shooting mechanics.</Text>}
          </View>
        </View>
      </ScrollView>

      <AddEventSheet visible={addEventOpen} initialDate={selectedDay} onClose={() => setAddEventOpen(false)} />
    </View>
  );
}

function StatCard({
  value,
  label,
  color,
  icon,
  small,
}: {
  value: string;
  label: string;
  color: string;
  icon?: ReactNode;
  small?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={styles.statCard}>
      <View style={styles.statValueRow}>
        {icon}
        <Text style={[styles.statValue, { fontSize: small ? 32 : 38, color, textShadowColor: withAlpha(color, 0.4) }]}>
          {value}
        </Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  hero: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  greeting: { fontSize: 13, color: c.textMuted, marginBottom: 6, fontFamily: fonts.body },
  name: { fontFamily: fonts.display, fontSize: 52, letterSpacing: 3, color: c.text, lineHeight: 54, marginBottom: 10 },
  schoolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 7,
    paddingLeft: 10,
    paddingRight: 16,
    alignSelf: 'flex-start',
  },
  schoolDot: { width: 9, height: 9, borderRadius: 5, shadowOpacity: 0.9, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } },
  schoolName: { fontSize: 13, color: c.text, fontFamily: fonts.semibold },
  schoolMeta: { fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: c.surfaceHigh,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  statValue: { fontFamily: fonts.display, letterSpacing: 2, textShadowRadius: 12 },
  statLabel: { fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: c.textFaint },
  progressRow: { flexDirection: 'row', gap: 4, marginBottom: 14 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2 },
  nnItem: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  nnText: { flex: 1, fontSize: 14, fontFamily: fonts.medium, color: c.text },
  allDone: { marginTop: 12, alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  allDoneText: { fontSize: 13, fontFamily: fonts.semibold },
  sessionCard: { backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 20, overflow: 'hidden' },
  sessionBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  sessionKicker: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.textMuted, marginBottom: 8 },
  sessionTitle: { fontFamily: fonts.display, fontSize: 30, letterSpacing: 2, color: c.text, marginBottom: 4 },
  sessionFocus: { fontSize: 13, color: c.textDim, marginBottom: 14, fontFamily: fonts.body },
  sessionFooter: { flexDirection: 'row', alignItems: 'center' },
  openRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  openText: { fontSize: 12, fontFamily: fonts.semibold },
  restCard: { backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 14, padding: 28, alignItems: 'center' },
  restTitle: { fontFamily: fonts.display, fontSize: 26, color: c.textFaint, marginBottom: 6 },
  restSub: { color: c.textFaint, fontSize: 13, fontFamily: fonts.body, textAlign: 'center' },
  timerCard: {
    backgroundColor: c.surfaceHigh,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },
  timerGlow: { position: 'absolute', top: -40, alignSelf: 'center' },
  timerText: { fontFamily: fonts.display, fontSize: 80, letterSpacing: 6, lineHeight: 84 },
  timerLabel: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.textFaint, marginTop: 6, marginBottom: 20 },
  timerButtons: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  timerDone: { marginTop: 14, color: c.textDim, fontSize: 13, fontFamily: fonts.body },
  addEventBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, paddingVertical: 13, borderRadius: 10, borderWidth: 1 },
  addEventText: { fontFamily: fonts.semibold, fontSize: 15 },
  hintCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 24 },
  hintTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text, marginBottom: 4 },
  hintText: { fontFamily: fonts.body, fontSize: 13, color: c.textDim, lineHeight: 19 },
  hintLink: { fontFamily: fonts.semibold, fontSize: 14 },
  academicsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 20, marginBottom: 28, overflow: 'hidden' },
  academicsTitle: { fontFamily: fonts.display, fontSize: 28, letterSpacing: 2, color: c.text, marginBottom: 4 },
  dayDetail: { marginTop: 14, backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 12, padding: 16 },
  dayDetailLabel: { fontFamily: fonts.semibold, fontSize: 14, color: c.text, marginBottom: 10 },
  daySessionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  daySessionText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  dayEmpty: { fontFamily: fonts.body, fontSize: 13, color: c.textMuted },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.borderSoft },
  eventDot: { width: 7, height: 7, borderRadius: 4 },
  eventTitle: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  eventNotes: { fontFamily: fonts.body, fontSize: 12, color: c.textMuted, marginTop: 2 },
}));
