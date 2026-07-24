import { View, Text, Pressable, ScrollView, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAcademics } from '@/hooks/useAcademics';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette } from '@/context/ThemeMode';
import { SCHOOLS } from '@/shared-data/schools';
import { SCHOOL_ACADEMICS } from '@/shared-data/schoolAcademics';
import { NCAA_ELIGIBILITY, eligibilityStatus, type Division } from '@/lib/academics';
import { IconArrowLeft, IconCheck } from '@/components/Icons';
import { fonts, withAlpha } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

function parseGpa(v: string): number | null {
  const t = v.trim();
  if (t === '') return null;
  const n = parseFloat(t);
  return Number.isNaN(n) ? null : n;
}

export default function AcademicsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { academics, setField } = useAcademics();
  const colors = useThemeColors();
  const c = usePalette();
  const styles = useStyles();

  const gpa = parseGpa(academics.gpa);
  const school = SCHOOLS.find((s: any) => s.id === profile?.dreamSchoolId) as any;
  const dreamDivision: Division | null = school && school.id !== 'undecided' ? (school.division as Division) : null;
  const acad = school && school.id !== 'undecided' ? (SCHOOL_ACADEMICS as any)[school.id] : null;
  const satNum = parseInt(academics.sat, 10);
  const actNum = parseInt(academics.act, 10);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
            <IconArrowLeft size={18} color={c.textDim} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.title}>Academics</Text>
          <Text style={styles.sub}>Know the academic bar, not just the athletic one.</Text>

          {/* Athlete academic profile */}
          <Text style={styles.sectionLabel}>Your Academics</Text>
          <View style={styles.card}>
            <Field label="GPA" value={academics.gpa} onChangeText={(v) => setField('gpa', v)} placeholder="e.g. 3.6" c={c} styles={styles} keyboardType="decimal-pad" />
            <Field label="SAT (optional)" value={academics.sat} onChangeText={(v) => setField('sat', v)} placeholder="400–1600" c={c} styles={styles} keyboardType="number-pad" />
            <Field label="ACT (optional)" value={academics.act} onChangeText={(v) => setField('act', v)} placeholder="1–36" last c={c} styles={styles} keyboardType="number-pad" />
            <Text style={styles.fieldNote}>
              Your GPA is used as an estimate. The NCAA uses your core-course GPA (the 16 approved core classes), which can differ from your overall GPA.
            </Text>
          </View>

          {/* Dream school context */}
          {!!dreamDivision && (
            <View style={[styles.dreamBanner, { borderColor: withAlpha(colors.primary, 0.35), backgroundColor: withAlpha(colors.primary, 0.1) }]}>
              <Text style={styles.dreamText}>
                Your dream school <Text style={{ color: colors.primary, fontFamily: fonts.semibold }}>{school.shortName}</Text> competes in{' '}
                <Text style={{ color: colors.primary, fontFamily: fonts.semibold }}>{dreamDivision}</Text>.
                {dreamDivision === 'D3' ? ' Division III has no NCAA academic minimum; admission sets the bar.' : ' Here is the NCAA bar you must clear to be eligible.'}
              </Text>
            </View>
          )}

          {/* Dream school admissions (College Scorecard) */}
          {!!dreamDivision && (
            <>
              <Text style={styles.sectionLabel}>{school.shortName} Admissions</Text>
              {acad ? (
                <View style={[styles.card, { padding: 18 }]}>
                  <View style={styles.reqRow}>
                    <Text style={styles.reqLabel}>Acceptance rate</Text>
                    <Text style={styles.reqValue}>{acad.acceptanceRate != null ? `${Math.round(acad.acceptanceRate * 100)}%` : 'Not reported'}</Text>
                  </View>
                  <RangeRow label="SAT (mid 50%)" low={acad.satLow} high={acad.satHigh} value={Number.isNaN(satNum) ? null : satNum} colors={colors} c={c} styles={styles} />
                  <RangeRow label="ACT (mid 50%)" low={acad.actLow} high={acad.actHigh} value={Number.isNaN(actNum) ? null : actNum} colors={colors} c={c} styles={styles} />
                  <Text style={styles.reqNote}>Middle 50% of admitted students. Source: U.S. Dept. of Education College Scorecard. Recruited-athlete admissions may differ.</Text>
                </View>
              ) : (
                <View style={[styles.card, { padding: 18 }]}>
                  <Text style={styles.reqNote}>Admissions ranges for {school.shortName} are coming.</Text>
                </View>
              )}
            </>
          )}

          {/* NCAA eligibility */}
          <Text style={styles.sectionLabel}>NCAA Initial Eligibility</Text>
          {(['D1', 'D2'] as const).map((div) => {
            const std = NCAA_ELIGIBILITY.divisions[div];
            const res = eligibilityStatus(gpa, div);
            const highlight = dreamDivision === div;
            return (
              <View
                key={div}
                style={[
                  styles.card,
                  { padding: 18, marginBottom: 12 },
                  highlight && { borderColor: withAlpha(colors.primary, 0.4) },
                ]}>
                <View style={styles.divHead}>
                  <Text style={styles.divName}>Division {div === 'D1' ? 'I' : 'II'}</Text>
                  <StatusPill res={res} colors={colors} c={c} styles={styles} />
                </View>
                <View style={styles.reqRow}>
                  <Text style={styles.reqLabel}>Core-course GPA</Text>
                  <Text style={[styles.reqValue, { color: colors.primary }]}>{std.coreGpaMin.toFixed(1)} min</Text>
                </View>
                <View style={styles.reqRow}>
                  <Text style={styles.reqLabel}>Core courses</Text>
                  <Text style={styles.reqValue}>{std.coreCourses} required</Text>
                </View>
                <Text style={styles.reqNote}>{std.note}</Text>
                <Text style={styles.reqNote}>Standardized tests are not used for initial eligibility (as of {NCAA_ELIGIBILITY.asOf}).</Text>
              </View>
            );
          })}

          {/* D3 */}
          <View style={[styles.card, { padding: 18 }]}>
            <Text style={styles.divName}>Division III</Text>
            <Text style={[styles.reqNote, { marginTop: 8 }]}>
              No NCAA academic minimum. Eligibility is each school's admission and academic-progress standards. Per-school admitted GPA and test ranges are coming to the school pages.
            </Text>
          </View>

          {/* Disclaimer + source */}
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              Recruited athletes are often evaluated on a different academic track than the general applicant pool. Always confirm specifics with the coaching staff and your school counselor.
            </Text>
            <Pressable onPress={() => Linking.openURL(NCAA_ELIGIBILITY.eligibilityCenterUrl)} style={styles.linkBtn}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Open the NCAA Eligibility Center</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  last,
  c,
  styles,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  last?: boolean;
  c: any;
  styles: any;
  keyboardType?: 'decimal-pad' | 'number-pad';
}) {
  return (
    <View style={[styles.fieldRow, !last && styles.fieldRowBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textGhost}
        keyboardType={keyboardType}
        style={styles.fieldInput}
        maxLength={4}
      />
    </View>
  );
}

function RangeRow({ label, low, high, value, colors, c, styles }: any) {
  const has = low != null && high != null;
  const showYou = has && value != null;
  const good = showYou && value >= low;
  return (
    <View style={styles.reqRow}>
      <Text style={styles.reqLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={styles.reqValue}>{has ? `${low}–${high}` : 'Not reported'}</Text>
        {showYou && (
          <View
            style={[
              styles.pill,
              good
                ? { borderColor: withAlpha(colors.primary, 0.4), backgroundColor: withAlpha(colors.primary, 0.15) }
                : { borderColor: c.dangerBorder, backgroundColor: c.dangerBg },
            ]}>
            <Text style={[styles.pillText, { color: good ? colors.primary : c.danger }]}>You: {value}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function StatusPill({ res, colors, c, styles }: any) {
  if (res.status === 'unknown') {
    return (
      <View style={[styles.pill, { borderColor: c.borderStrong, backgroundColor: c.fieldBg }]}>
        <Text style={[styles.pillText, { color: c.textMuted }]}>Add your GPA</Text>
      </View>
    );
  }
  if (res.status === 'onTrack') {
    return (
      <View style={[styles.pill, { borderColor: withAlpha(colors.primary, 0.4), backgroundColor: withAlpha(colors.primary, 0.15) }]}>
        <IconCheck size={11} color={colors.primary} />
        <Text style={[styles.pillText, { color: colors.primary, marginLeft: 4 }]}>On track</Text>
      </View>
    );
  }
  return (
    <View style={[styles.pill, { borderColor: c.dangerBorder, backgroundColor: c.dangerBg }]}>
      <Text style={[styles.pillText, { color: c.danger }]}>{res.gap.toFixed(2)} below</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  backText: { fontSize: 14, color: c.textDim, fontFamily: fonts.body },
  title: { fontFamily: fonts.display, fontSize: 44, letterSpacing: 3, color: c.text },
  sub: { color: c.textMuted, fontSize: 13, marginTop: 4, marginBottom: 24, fontFamily: fonts.body },
  sectionLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.textMuted, marginBottom: 12 },
  card: { backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.border, borderRadius: 14, marginBottom: 24, overflow: 'hidden' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 18 },
  fieldRowBorder: { borderBottomWidth: 1, borderBottomColor: c.borderSoft },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 15, color: c.text },
  fieldInput: { minWidth: 110, textAlign: 'right', color: c.text, fontSize: 16, fontFamily: fonts.body, paddingVertical: 4 },
  fieldNote: { fontSize: 12, color: c.textMuted, lineHeight: 18, fontFamily: fonts.body, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 16 },
  dreamBanner: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 24 },
  dreamText: { fontSize: 13, color: c.textDim, lineHeight: 20, fontFamily: fonts.body },
  divHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  divName: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 1.5, color: c.text },
  reqRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  reqLabel: { fontFamily: fonts.body, fontSize: 13, color: c.textDim },
  reqValue: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  reqNote: { fontSize: 12, color: c.textMuted, lineHeight: 18, fontFamily: fonts.body, marginTop: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 10 },
  pillText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  disclaimerCard: { backgroundColor: c.fieldBg, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 12, padding: 16 },
  disclaimerText: { fontSize: 12, color: c.textDim, lineHeight: 19, fontFamily: fonts.body, marginBottom: 12 },
  linkBtn: { paddingVertical: 4 },
  linkText: { fontSize: 14, fontFamily: fonts.semibold },
}));
