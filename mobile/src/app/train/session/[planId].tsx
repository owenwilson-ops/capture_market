import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TRAINING_PLANS } from '@/shared-data/trainingData';
import { useAuth } from '@/context/AuthContext';
import { useJournal } from '@/hooks/useJournal';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette } from '@/context/ThemeMode';
import { supabase } from '@/lib/supabase';
import { IconArrowLeft, IconLock, IconChevronDown, IconX } from '@/components/Icons';
import { fonts, withAlpha, mix, type Palette } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

type TagType = 'lock' | 'primary' | string;

function TagChip({ label, type, primary, c }: { label: string; type: TagType; primary: string; c: Palette }) {
  let bg = c.fieldBg;
  let border = c.border;
  let color = c.textDim;
  if (type === 'lock') {
    bg = c.fieldBg;
    border = c.borderSoft;
    color = c.textMuted;
  } else if (type === 'primary') {
    bg = withAlpha(primary, 0.18);
    border = withAlpha(primary, 0.35);
    color = primary;
  }
  return (
    <View style={[styles_chip.chip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles_chip.chipText, { color }]}>{label}</Text>
    </View>
  );
}

const styles_chip = {
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start' as const,
  },
  chipText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const },
};

function DrillRow({ drill, last, primary }: { drill: any; last: boolean; primary: string }) {
  const c = usePalette();
  const styles = useStyles();
  return (
    <View style={[styles.drill, !last && { borderBottomWidth: 1, borderBottomColor: c.borderSoft }]}>
      <Text style={styles.drillNum}>{drill.num}</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.drillHead}>
          <Text style={styles.drillName}>{drill.name}</Text>
          {!!drill.tag && <TagChip label={drill.tag} type={drill.tagType} primary={primary} c={c} />}
        </View>
        <Text style={styles.drillDesc}>{drill.description}</Text>
        <Text style={styles.drillSets}>{drill.sets}</Text>
      </View>
    </View>
  );
}

function TimelineBlock({
  block,
  isLast,
  expanded,
  onToggle,
  primary,
}: {
  block: any;
  isLast: boolean;
  expanded: boolean;
  onToggle: () => void;
  primary: string;
}) {
  const c = usePalette();
  const styles = useStyles();
  const isLocked = !!block.locked;
  return (
    <View style={styles.blockRow}>
      <View style={styles.timeCol}>
        <Text style={[styles.timeStart, { color: isLocked ? primary : c.textDim }]}>{block.startTime}</Text>
        <Text style={styles.timeDur}>{block.duration}m</Text>
      </View>

      <View style={styles.connector}>
        <View
          style={[
            styles.dot,
            { backgroundColor: isLocked ? primary : c.borderStrong, borderColor: isLocked ? primary : c.borderStrong },
          ]}
        />
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.blockCardWrap}>
        <Pressable
          onPress={onToggle}
          style={[
            styles.blockCard,
            {
              backgroundColor: isLocked ? mix(primary, c.surfaceDeep, 0.06) : c.surfaceDeep,
              borderColor: isLocked ? withAlpha(primary, 0.25) : c.borderSoft,
              borderLeftColor: isLocked ? primary : c.borderStrong,
              borderLeftWidth: 3,
            },
          ]}>
          <View style={styles.blockHead}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                {isLocked ? (
                  <View style={[styles_chip.chip, { backgroundColor: c.fieldBg, borderColor: c.borderSoft }]}>
                    <IconLock size={8} color={c.textMuted} />
                    <Text style={[styles_chip.chipText, { color: c.textMuted, marginLeft: 4 }]}>Non-Negotiable · Daily</Text>
                  </View>
                ) : (
                  <TagChip label={block.phase} type="secondary" primary={primary} c={c} />
                )}
              </View>
              <Text style={styles.blockTitle}>{block.title}</Text>
            </View>
            <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
              <IconChevronDown size={16} color={c.textMuted} />
            </View>
          </View>
        </Pressable>

        {expanded && block.drills && (
          <View style={styles.drillList}>
            {block.drills.map((drill: any, i: number) => (
              <DrillRow key={drill.num} drill={drill} last={i === block.drills.length - 1} primary={primary} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function SessionScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const colors = useThemeColors();
  const c = usePalette();
  const styles = useStyles();
  const plan = TRAINING_PLANS.find((p: any) => p.id === planId);

  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { addEntry } = useJournal();
  const [showJournal, setShowJournal] = useState(false);
  const [jRating, setJRating] = useState(0);
  const [jFocus, setJFocus] = useState<string[]>([]);
  const [jNotes, setJNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // The clock only advances while the session is running and not paused, so an
  // athlete can stop for water or to switch drills without losing their time.
  useEffect(() => {
    if (sessionStarted && !paused) {
      timerRef.current = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStarted, paused]);

  async function finish(withJournal: boolean) {
    if (!user) return;
    setSaving(true);
    await supabase.from('sessionLogs').insert({
      userId: user.id,
      planId,
      completedAt: new Date().toISOString(),
      durationMinutes: Math.round(sessionSeconds / 60),
    });
    if (withJournal && plan) {
      await addEntry({
        date: new Date().toISOString().slice(0, 10),
        planId: String(planId),
        planTitle: plan.title,
        rating: jRating,
        focus: jFocus,
        notes: jNotes.trim(),
      });
    }
    setSaving(false);
    router.replace('/train');
  }

  if (!plan) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: c.textMuted }}>Plan not found.</Text>
      </View>
    );
  }

  const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
  const secs = String(sessionSeconds % 60).padStart(2, '0');

  // Skill blocks make the journal's "what to work on" chips (skip warm-down).
  const focusOptions = Array.from(new Set((plan.blocks || []).map((b: any) => b.title as string))).filter(
    (t) => !/cool-?down|conditioning/i.test(t)
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
            <IconArrowLeft size={18} color={c.textDim} />
            <Text style={styles.backText}>Training Plans</Text>
          </Pressable>

          <View style={{ marginBottom: 28 }}>
            <Text style={styles.title}>{plan.title}</Text>
            <Text style={styles.focus}>{plan.focus}</Text>
            {sessionStarted && (
              <View style={styles.timerRow}>
                <Text style={[styles.runTimer, { color: paused ? c.textMuted : colors.primary }]}>
                  {mins}:{secs}
                </Text>
                {paused && <Text style={styles.pausedLabel}>Paused</Text>}
              </View>
            )}
          </View>

          <View>
            {plan.blocks?.map((block: any, idx: number) => (
              <TimelineBlock
                key={block.id}
                block={block}
                isLast={idx === plan.blocks.length - 1}
                expanded={expandedBlock === block.id}
                onToggle={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                primary={colors.primary}
              />
            ))}
          </View>

          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>Total Duration</Text>
            <Text style={styles.totalValue}>{plan.totalMinutes} MIN</Text>
          </View>

          {!sessionStarted ? (
            <Pressable
              onPress={() => setSessionStarted(true)}
              style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }]}>
              <Text style={[styles.actionText, { color: colors.textOnPrimary }]}>Start Session</Text>
            </Pressable>
          ) : (
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={() => setPaused((p) => !p)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: paused ? colors.primary : withAlpha(colors.primary, 0.16),
                    borderWidth: paused ? 0 : 1,
                    borderColor: withAlpha(colors.primary, 0.4),
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}>
                <Text style={[styles.actionText, { color: paused ? colors.textOnPrimary : colors.primary }]}>
                  {paused ? 'Resume Session' : 'Pause — Water / Switch Drills'}
                </Text>
              </Pressable>
              <Pressable onPress={() => setShowJournal(true)} style={({ pressed }) => [styles.finishBtn, { opacity: pressed ? 0.9 : 1 }]}>
                <Text style={[styles.actionText, { color: c.text }]}>Finish & Log Session</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Post-workout journal */}
      <Modal visible={showJournal} transparent animationType="slide" onRequestClose={() => setShowJournal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.jBackdrop} onPress={() => setShowJournal(false)}>
            <Pressable style={styles.jSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.jHead}>
                <Text style={styles.jTitle}>How did today go?</Text>
                <Pressable onPress={() => setShowJournal(false)} hitSlop={8}>
                  <IconX size={18} color={c.textMuted} />
                </Pressable>
              </View>
              <Text style={styles.jSub}>{plan.title} · {Math.round(sessionSeconds / 60)} min</Text>

              <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={styles.jLabel}>Rate the session</Text>
                <View style={styles.jRatingRow}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const on = jRating >= n;
                    return (
                      <Pressable
                        key={n}
                        onPress={() => setJRating(n)}
                        style={[styles.jRatingDot, { borderColor: on ? colors.primary : c.borderStrong, backgroundColor: on ? colors.primary : 'transparent' }]}>
                        <Text style={[styles.jRatingNum, { color: on ? colors.textOnPrimary : c.textMuted }]}>{n}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {focusOptions.length > 0 && (
                  <>
                    <Text style={styles.jLabel}>What to keep working on</Text>
                    <View style={styles.jChips}>
                      {focusOptions.map((f) => {
                        const on = jFocus.includes(f);
                        return (
                          <Pressable
                            key={f}
                            onPress={() => setJFocus((prev) => (on ? prev.filter((x) => x !== f) : [...prev, f]))}
                            style={[styles.jChip, { borderColor: on ? colors.primary : c.borderStrong, backgroundColor: on ? withAlpha(colors.primary, 0.15) : c.surfaceRaised }]}>
                            <Text style={[styles.jChipText, { color: on ? c.text : c.textDim }]}>{f}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}

                <Text style={styles.jLabel}>Notes</Text>
                <TextInput
                  value={jNotes}
                  onChangeText={setJNotes}
                  placeholder="Wall ball felt sharp, footwork needs work…"
                  placeholderTextColor={c.textMuted}
                  multiline
                  style={styles.jInput}
                />
              </ScrollView>

              <View style={styles.jBtnRow}>
                <Pressable onPress={() => finish(false)} disabled={saving} style={[styles.jSkipBtn, { borderColor: c.borderStrong }]}>
                  <Text style={[styles.jSkipText, { color: c.textDim }]}>Skip</Text>
                </Pressable>
                <Pressable
                  onPress={() => finish(true)}
                  disabled={saving}
                  style={({ pressed }) => [styles.jSaveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : pressed ? 0.9 : 1 }]}>
                  <Text style={[styles.jSaveText, { color: colors.textOnPrimary }]}>{saving ? 'Saving…' : 'Save & Finish'}</Text>
                </Pressable>
              </View>
              <SafeAreaView edges={['bottom']} />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  backText: { fontSize: 14, color: c.textDim, fontFamily: fonts.body },
  title: { fontFamily: fonts.display, fontSize: 42, letterSpacing: 2, color: c.text, lineHeight: 44, marginBottom: 6 },
  focus: { color: c.textDim, fontSize: 14, fontFamily: fonts.body },
  timerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
  runTimer: { fontFamily: fonts.display, fontSize: 28, letterSpacing: 2 },
  pausedLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.textMuted },
  blockRow: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  timeCol: { width: 52, paddingTop: 18 },
  timeStart: { fontFamily: fonts.display, fontSize: 18, letterSpacing: 1 },
  timeDur: { fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1, color: c.textFaint, textTransform: 'uppercase' },
  connector: { alignItems: 'center', paddingTop: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  line: { width: 1, flex: 1, minHeight: 40, backgroundColor: c.border, marginTop: 4 },
  blockCardWrap: { flex: 1, paddingBottom: 12 },
  blockCard: { borderWidth: 1, borderRadius: 10, padding: 16 },
  blockHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  blockTitle: { fontFamily: fonts.display, fontSize: 22, letterSpacing: 1.5, color: c.text },
  drillList: { marginTop: 4, backgroundColor: c.surfaceDeep, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 10, overflow: 'hidden' },
  drill: { flexDirection: 'row', gap: 12, padding: 16 },
  drillNum: { fontFamily: fonts.mono, fontSize: 11, color: c.textFaint, marginTop: 2 },
  drillHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  drillName: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  drillDesc: { fontSize: 13, color: c.textDim, lineHeight: 21, marginBottom: 6, fontFamily: fonts.body },
  drillSets: { fontFamily: fonts.mono, fontSize: 10, color: c.textMuted, letterSpacing: 1 },
  totalBar: {
    backgroundColor: c.surfaceDeep,
    borderWidth: 1,
    borderColor: c.borderSoft,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  totalLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.textMuted },
  totalValue: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 2, color: c.text },
  actionBtn: { borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  finishBtn: { borderRadius: 8, paddingVertical: 16, alignItems: 'center', backgroundColor: c.surfaceRaised, borderWidth: 1, borderColor: c.borderStrong },
  actionText: { fontSize: 17, fontFamily: fonts.semibold },
  // Journal sheet
  jBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  jSheet: { backgroundColor: c.surfaceDeep, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  jHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  jTitle: { fontFamily: fonts.display, fontSize: 26, letterSpacing: 1.5, color: c.text },
  jSub: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: c.textMuted, marginTop: 4, marginBottom: 18 },
  jLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: c.textMuted, marginBottom: 10, marginTop: 4 },
  jRatingRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  jRatingDot: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  jRatingNum: { fontFamily: fonts.semibold, fontSize: 16 },
  jChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  jChip: { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  jChipText: { fontFamily: fonts.medium, fontSize: 13 },
  jInput: { backgroundColor: c.surfaceRaised, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, color: c.text, fontSize: 15, fontFamily: fonts.body, minHeight: 80, textAlignVertical: 'top', marginBottom: 8 },
  jBtnRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  jSkipBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  jSkipText: { fontFamily: fonts.semibold, fontSize: 15 },
  jSaveBtn: { flex: 2, paddingVertical: 15, alignItems: 'center', borderRadius: 10 },
  jSaveText: { fontFamily: fonts.semibold, fontSize: 16 },
}));
