import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AmbientGlow, SectionLabel, GhostButton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useEventCategories, COLOR_SWATCHES } from '@/context/EventCategories';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette, useThemeMode, type ThemeMode } from '@/context/ThemeMode';
import { SCHOOLS } from '@/shared-data/schools';
import { LACROSSE_POSITIONS, GRADES } from '@/shared-data/positions';
import { IconCheck, IconChevronRight, IconX } from '@/components/Icons';
import { fonts, mix } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

const MODE_OPTIONS: { key: ThemeMode; label: string; hint: string }[] = [
  { key: 'light', label: 'Light', hint: 'Always light background' },
  { key: 'dark', label: 'Dark', hint: 'Always dark background' },
  { key: 'auto', label: 'Auto', hint: 'Light by day, dark at night' },
];

// Academic year: after June we're in the next school year. Mirrors web Onboarding.
function calcGradYear(grade?: string | null): number | null {
  if (!grade) return null;
  const now = new Date();
  const academicYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const gradeNum = { '8th': 8, '9th': 9, '10th': 10, '11th': 11, '12th': 12 }[grade] ?? 12;
  return academicYear + (12 - gradeNum) + 1;
}

type Editing = 'name' | 'school' | 'position' | 'grade' | null;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile(user?.id);
  const { categories, setCategoryColor } = useEventCategories();
  const colors = useThemeColors();
  const c = usePalette();
  const { mode, setMode } = useThemeMode();
  const router = useRouter();
  const styles = useStyles();

  const [editing, setEditing] = useState<Editing>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [recolorKey, setRecolorKey] = useState<string | null>(null);

  const school = SCHOOLS.find((s: any) => s.id === profile?.dreamSchoolId);
  const schoolLabel = school && school.id !== 'undecided' ? school.name : school ? 'Undecided' : null;

  async function saveName() {
    if (!nameDraft.trim()) return;
    setSaving(true);
    await updateProfile({ name: nameDraft.trim() });
    setSaving(false);
    setEditing(null);
  }

  async function selectSchool(id: string) {
    await updateProfile({ dreamSchoolId: id });
    setEditing(null);
  }

  async function selectPosition(pos: string) {
    await updateProfile({ position: pos });
    setEditing(null);
  }

  async function selectGrade(g: string) {
    await updateProfile({ grade: g, gradYear: calcGradYear(g) });
    setEditing(null);
  }

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.primary} size={420} opacity={0.18} style={styles.glow} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profile</Text>

          <SectionLabel>Athlete</SectionLabel>
          <View style={styles.card}>
            <EditRow label="Name" value={profile?.name} onPress={() => { setNameDraft(profile?.name || ''); setEditing('name'); }} c={c} styles={styles} />
            <EditRow label="Dream School" value={schoolLabel} valueColor={school && school.id !== 'undecided' ? colors.primary : undefined} onPress={() => setEditing('school')} c={c} styles={styles} />
            <EditRow label="Position" value={profile?.position} onPress={() => setEditing('position')} c={c} styles={styles} />
            <EditRow label="Grade" value={profile?.grade} onPress={() => setEditing('grade')} last c={c} styles={styles} />
          </View>

          <SectionLabel>Account</SectionLabel>
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{user?.email}</Text>
            </View>
          </View>

          <SectionLabel>Appearance</SectionLabel>
          <View style={styles.card}>
            {MODE_OPTIONS.map((opt, i) => {
              const active = mode === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setMode(opt.key)}
                  style={[styles.modeRow, i < MODE_OPTIONS.length - 1 && styles.modeRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modeLabel}>{opt.label}</Text>
                    <Text style={styles.modeHint}>{opt.hint}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: active ? colors.primary : c.borderStrong, backgroundColor: active ? colors.primary : 'transparent' },
                    ]}>
                    {active && <IconCheck size={12} color={colors.textOnPrimary} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <SectionLabel>Event Colors</SectionLabel>
          <View style={styles.card}>
            {categories.map((cat, i) => (
              <Pressable
                key={cat.key}
                onPress={() => setRecolorKey(cat.key)}
                style={[styles.editRow, i < categories.length - 1 && styles.editRowBorder]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.catDot, { backgroundColor: cat.color, width: 14, height: 14, borderRadius: 7 }]} />
                  <Text style={styles.modeLabel}>{cat.label}</Text>
                </View>
                <Text style={[styles.dateFieldHint, { color: colors.primary }]}>Change</Text>
              </Pressable>
            ))}
          </View>

          <SectionLabel>Guide</SectionLabel>
          <View style={styles.card}>
            <Pressable onPress={() => router.push('/tutorial')} style={styles.editRow}>
              <Text style={styles.modeLabel}>How to Use Sirius Recruit</Text>
              <IconChevronRight size={16} color={c.textGhost} />
            </Pressable>
          </View>

          <GhostButton label="Sign Out" onPress={() => signOut()} style={styles.signOut} />
        </ScrollView>
      </SafeAreaView>

      {/* Name editor */}
      <Sheet visible={editing === 'name'} title="Edit Name" onClose={() => setEditing(null)} c={c} styles={styles}>
        <TextInput
          value={nameDraft}
          onChangeText={setNameDraft}
          autoFocus
          placeholder="Your first name"
          placeholderTextColor={c.textMuted}
          style={styles.input}
          onSubmitEditing={saveName}
        />
        <Pressable
          onPress={saveName}
          disabled={saving || !nameDraft.trim()}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: saving || !nameDraft.trim() ? 0.5 : pressed ? 0.9 : 1 }]}>
          <Text style={[styles.saveText, { color: colors.textOnPrimary }]}>{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
      </Sheet>

      {/* Dream school picker */}
      <Sheet visible={editing === 'school'} title="Change Dream School" onClose={() => setEditing(null)} c={c} styles={styles} scroll>
        {SCHOOLS.map((s: any) => {
          const selected = profile?.dreamSchoolId === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => selectSchool(s.id)}
              style={[
                styles.schoolRow,
                {
                  backgroundColor: selected ? mix(s.primaryColor, c.surfaceRaised, 0.15) : c.surfaceRaised,
                  borderColor: selected ? s.primaryColor : c.borderSoft,
                  borderLeftColor: s.primaryColor,
                  borderLeftWidth: 3,
                },
              ]}>
              <Text style={styles.schoolName}>{s.shortName}</Text>
              {!!s.conference && <Text style={styles.schoolMeta}>{s.conference}</Text>}
              {selected && <IconCheck size={14} color={s.primaryColor} />}
            </Pressable>
          );
        })}
      </Sheet>

      {/* Position picker */}
      <Sheet visible={editing === 'position'} title="Edit Position" onClose={() => setEditing(null)} c={c} styles={styles}>
        <View style={{ gap: 8 }}>
          {LACROSSE_POSITIONS.map((pos: string) => {
            const selected = profile?.position === pos;
            return (
              <Pressable
                key={pos}
                onPress={() => selectPosition(pos)}
                style={[styles.optionRow, { backgroundColor: selected ? colors.primary : c.surfaceRaised, borderColor: selected ? colors.primary : c.borderSoft }]}>
                <Text style={[styles.optionText, { color: selected ? colors.textOnPrimary : c.text }]}>{pos}</Text>
              </Pressable>
            );
          })}
        </View>
      </Sheet>

      {/* Grade picker */}
      <Sheet visible={editing === 'grade'} title="Edit Grade" onClose={() => setEditing(null)} c={c} styles={styles}>
        <View style={styles.gradeGrid}>
          {GRADES.map((g: string) => {
            const selected = profile?.grade === g;
            return (
              <Pressable
                key={g}
                onPress={() => selectGrade(g)}
                style={[styles.gradeCell, { backgroundColor: selected ? colors.primary : c.surfaceRaised, borderColor: selected ? colors.primary : c.borderSoft }]}>
                <Text style={[styles.gradeText, { color: selected ? colors.textOnPrimary : c.text }]}>{g}</Text>
                <Text style={[styles.gradeSub, { color: selected ? colors.textOnPrimary : c.textMuted }]}>Class of {calcGradYear(g)}</Text>
              </Pressable>
            );
          })}
        </View>
      </Sheet>

      {/* Recolor a category */}
      <Sheet
        visible={!!recolorKey}
        title={`${categories.find((x) => x.key === recolorKey)?.label || 'Category'} Color`}
        onClose={() => setRecolorKey(null)}
        c={c}
        styles={styles}>
        <View style={styles.swatchWrap}>
          {COLOR_SWATCHES.map((color) => {
            const current = categories.find((x) => x.key === recolorKey)?.color === color;
            return (
              <Pressable
                key={color}
                onPress={() => { if (recolorKey) setCategoryColor(recolorKey, color); setRecolorKey(null); }}
                style={[styles.swatch, { backgroundColor: color, borderColor: current ? c.text : 'transparent' }]}>
                {current && <IconCheck size={16} color="#fff" />}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

function EditRow({
  label,
  value,
  valueColor,
  onPress,
  last,
  c,
  styles,
}: {
  label: string;
  value?: string | null;
  valueColor?: string;
  onPress: () => void;
  last?: boolean;
  c: any;
  styles: any;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.editRow, !last && styles.editRowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={[styles.rowValue, valueColor && { color: valueColor, fontFamily: fonts.semibold }]}>{value || '—'}</Text>
        <IconChevronRight size={14} color={c.textGhost} />
      </View>
    </Pressable>
  );
}

function Sheet({
  visible,
  title,
  onClose,
  children,
  scroll,
  c,
  styles,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  scroll?: boolean;
  c: any;
  styles: any;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <IconX size={18} color={c.textMuted} />
              </Pressable>
            </View>
            {scroll ? (
              <ScrollView
                style={{ maxHeight: 420 }}
                contentContainerStyle={{ gap: 6 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            ) : (
              children
            )}
            <SafeAreaView edges={['bottom']} />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  glow: { position: 'absolute', top: -120, alignSelf: 'center' },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  title: { fontFamily: fonts.display, fontSize: 44, letterSpacing: 3, color: c.text, marginBottom: 24 },
  card: {
    marginBottom: 28,
    backgroundColor: c.surfaceHigh,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20 },
  editRowBorder: { borderBottomWidth: 1, borderBottomColor: c.borderSoft },
  accountRow: { paddingVertical: 16, paddingHorizontal: 20 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 20 },
  eventCatDot: { width: 10, height: 10, borderRadius: 5 },
  eventTitle: { fontFamily: fonts.medium, fontSize: 15, color: c.text },
  eventDate: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5, color: c.textMuted, marginTop: 3 },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  catDot: { width: 9, height: 9, borderRadius: 5 },
  catChipText: { fontFamily: fonts.medium, fontSize: 13 },
  swatchWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingVertical: 4 },
  swatch: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  addEventRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 20 },
  addEventBorder: { borderTopWidth: 1, borderTopColor: c.borderSoft },
  addEventText: { fontFamily: fonts.semibold, fontSize: 14 },
  dayEmpty: { fontFamily: fonts.body, fontSize: 13, color: c.textMuted, lineHeight: 19 },
  fieldLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: c.textMuted, marginBottom: 7 },
  rowLabel: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: c.textMuted },
  rowValue: { fontSize: 14, color: c.text, fontFamily: fonts.medium, marginTop: 4 },
  modeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  modeRowBorder: { borderBottomWidth: 1, borderBottomColor: c.borderSoft },
  modeLabel: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  modeHint: { fontFamily: fonts.body, fontSize: 12, color: c.textMuted, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  signOut: { alignSelf: 'flex-start' },
  // Sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surfaceDeep, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 2, color: c.text },
  input: { backgroundColor: c.surfaceRaised, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 16, color: c.text, fontSize: 16, fontFamily: fonts.body, marginBottom: 16 },
  dateField: { backgroundColor: c.surfaceRaised, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateFieldText: { color: c.text, fontSize: 16, fontFamily: fonts.body },
  dateFieldHint: { fontSize: 14, fontFamily: fonts.semibold },
  saveBtn: { borderRadius: 8, paddingVertical: 15, alignItems: 'center' },
  saveText: { fontFamily: fonts.semibold, fontSize: 16 },
  optionRow: { borderWidth: 1, borderRadius: 10, paddingVertical: 16, paddingHorizontal: 18 },
  optionText: { fontFamily: fonts.semibold, fontSize: 15 },
  schoolRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 14 },
  schoolName: { fontFamily: fonts.display, fontSize: 18, letterSpacing: 1, color: c.text },
  schoolMeta: { fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: c.textMuted },
  gradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gradeCell: { width: '47%', borderWidth: 1, borderRadius: 10, paddingVertical: 18, alignItems: 'center' },
  gradeText: { fontFamily: fonts.display, fontSize: 28, letterSpacing: 1 },
  gradeSub: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, marginTop: 2 },
}));
