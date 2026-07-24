import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette } from '@/context/ThemeMode';
import { ROADMAP_DATA } from '@/shared-data/roadmapData';
import { SCHOOLS } from '@/shared-data/schools';
import { supabase } from '@/lib/supabase';
import { IconCheck, IconChevronDown } from '@/components/Icons';
import { fonts, withAlpha, mix } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

const GRADE_ORDER = ['8th', '9th', '10th', '11th', '12th'];

function daysUntilGrad(gradYear?: number) {
  if (!gradYear) return null;
  const grad = new Date(`${gradYear}-06-01`);
  return Math.max(0, Math.ceil((grad.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function RoadmapScreen() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const colors = useThemeColors();
  const c = usePalette();
  const styles = useStyles();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

  const school = SCHOOLS.find((s: any) => s.id === profile?.dreamSchoolId);
  const currentGrade = profile?.grade || '10th';
  const days = daysUntilGrad(profile?.gradYear);
  const currentGradeIndex = GRADE_ORDER.indexOf(currentGrade);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('roadmapProgress')
      .select('milestoneId')
      .eq('userId', user.id)
      .then(({ data }: { data: any[] | null }) => {
        if (data) setCompleted(new Set(data.map((r) => r.milestoneId)));
      });
    setExpandedGrade(currentGrade);
  }, [user, currentGrade]);

  async function toggleMilestone(id: string) {
    if (!user) return;
    if (completed.has(id)) {
      await supabase.from('roadmapProgress').delete().eq('userId', user.id).eq('milestoneId', id);
      setCompleted((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    } else {
      await supabase
        .from('roadmapProgress')
        .insert({ userId: user.id, milestoneId: id, completedAt: new Date().toISOString() });
      setCompleted((s) => new Set([...s, id]));
    }
  }

  const groups = GRADE_ORDER.map((grade) => ({
    grade,
    milestones: ROADMAP_DATA.filter((m: any) => m.grade === grade),
    isCurrent: grade === currentGrade,
    isPast: GRADE_ORDER.indexOf(grade) < currentGradeIndex,
    isFuture: GRADE_ORDER.indexOf(grade) > currentGradeIndex,
  }));

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>Recruiting Roadmap</Text>
          {!!school && (
            <Text style={styles.goal}>
              Goal: <Text style={{ color: colors.primary, fontFamily: fonts.semibold }}>{school.name}</Text>
            </Text>
          )}

          {days !== null && (
            <View style={styles.countdown}>
              <View>
                <Text style={[styles.countNum, { color: colors.primary }]}>{days.toLocaleString()}</Text>
                <Text style={styles.countLabel}>Days Until Graduation</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.countSub}>Class of {profile?.gradYear}. Every day compounds.</Text>
              </View>
            </View>
          )}

          <View style={{ gap: 12 }}>
            {groups.map(({ grade, milestones, isCurrent, isPast, isFuture }) => {
              const isExpanded = expandedGrade === grade;
              const completedCount = milestones.filter((m: any) => completed.has(m.id)).length;
              return (
                <View key={grade}>
                  <Pressable
                    onPress={() => setExpandedGrade(isExpanded ? null : grade)}
                    style={[
                      styles.gradeHeader,
                      {
                        backgroundColor: isCurrent ? mix(colors.primary, c.surfaceDeep, 0.08) : c.surfaceDeep,
                        borderColor: isCurrent ? withAlpha(colors.primary, 0.3) : c.borderSoft,
                      },
                    ]}>
                    <View style={styles.gradeLeft}>
                      <View
                        style={[
                          styles.gradeDot,
                          {
                            backgroundColor: isCurrent ? colors.primary : isPast ? c.textMuted : c.border,
                            borderColor: isCurrent ? colors.primary : 'transparent',
                          },
                        ]}
                      />
                      <Text style={[styles.gradeTitle, { color: isFuture ? c.textMuted : c.text }]}>{grade} Grade</Text>
                      {isCurrent && (
                        <View style={[styles.currentChip, { backgroundColor: withAlpha(colors.primary, 0.18), borderColor: withAlpha(colors.primary, 0.35) }]}>
                          <Text style={[styles.currentChipText, { color: colors.primary }]}>Current</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.gradeRight}>
                      <Text style={styles.count}>
                        {completedCount}/{milestones.length}
                      </Text>
                      <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
                        <IconChevronDown size={16} color={c.textMuted} />
                      </View>
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.milestones}>
                      {milestones.map((m: any) => {
                        const done = completed.has(m.id);
                        return (
                          <View
                            key={m.id}
                            style={[
                              styles.milestone,
                              {
                                backgroundColor: done ? mix(colors.primary, c.surfaceDeep, 0.05) : c.surfaceRaised,
                                borderColor: done ? withAlpha(colors.primary, 0.2) : c.borderSoft,
                              },
                            ]}>
                            <Pressable
                              onPress={() => toggleMilestone(m.id)}
                              hitSlop={8}
                              style={[
                                styles.checkbox,
                                { backgroundColor: done ? colors.primary : 'transparent', borderColor: done ? colors.primary : c.borderStrong },
                              ]}>
                              {done && <IconCheck size={11} color={colors.textOnPrimary} />}
                            </Pressable>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.timeframe}>{m.timeframe}</Text>
                              <Text style={[styles.mTitle, done && { color: c.textDim, textDecorationLine: 'line-through' }]}>{m.title}</Text>
                              <Text style={styles.mDesc}>{m.description}</Text>
                              {m.actionItems?.length > 0 &&
                                m.actionItems.map((item: string, i: number) => (
                                  <View key={i} style={styles.bulletRow}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>{item}</Text>
                                  </View>
                                ))}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  h1: { fontFamily: fonts.display, fontSize: 44, letterSpacing: 2, color: c.text, marginBottom: 6 },
  goal: { color: c.textDim, fontSize: 14, marginBottom: 8, fontFamily: fonts.body },
  countdown: {
    backgroundColor: c.surfaceDeep,
    borderWidth: 1,
    borderColor: c.borderSoft,
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  countNum: { fontFamily: fonts.display, fontSize: 52, lineHeight: 54 },
  countLabel: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.textMuted },
  countSub: { fontSize: 13, color: c.textDim, lineHeight: 21, fontFamily: fonts.body },
  gradeHeader: { borderWidth: 1, borderRadius: 10, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gradeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  gradeDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  gradeTitle: { fontFamily: fonts.display, fontSize: 20, letterSpacing: 2 },
  currentChip: { borderWidth: 1, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  currentChipText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' },
  gradeRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  count: { fontFamily: fonts.mono, fontSize: 9, color: c.textMuted, letterSpacing: 1 },
  milestones: { gap: 8, marginTop: 8, marginLeft: 16 },
  milestone: { borderWidth: 1, borderRadius: 10, padding: 16, flexDirection: 'row', gap: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  timeframe: { fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: c.textMuted, marginBottom: 4 },
  mTitle: { fontFamily: fonts.semibold, fontSize: 14, color: c.text, marginBottom: 6 },
  mDesc: { fontSize: 13, color: c.textDim, lineHeight: 21, marginBottom: 10, fontFamily: fonts.body },
  bulletRow: { flexDirection: 'row', gap: 6, paddingRight: 4 },
  bullet: { fontSize: 12, color: c.textMuted, lineHeight: 20 },
  bulletText: { flex: 1, fontSize: 12, color: c.textMuted, lineHeight: 20, fontFamily: fonts.body },
}));
