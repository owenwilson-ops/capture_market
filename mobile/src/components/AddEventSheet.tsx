// Bottom-sheet form for adding a calendar event. Used by the Home calendar.
// Keyboard-aware and scrollable so inputs stay visible; the date is chosen from
// an inline month calendar (no typing), like Apple/Google event scheduling.
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePalette } from '@/context/ThemeMode';
import { useThemeColors } from '@/context/ThemeContext';
import { useEvents } from '@/hooks/useEvents';
import { useEventCategories, DEFAULT_CATEGORY } from '@/context/EventCategories';
import { MonthCalendar } from '@/components/MonthCalendar';
import { IconX } from '@/components/Icons';
import { fonts, withAlpha } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

const EMPTY_COLORS: Record<string, string[]> = {};
const EMPTY_DAYS = new Set<string>();

function formatDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function AddEventSheet({
  visible,
  onClose,
  initialDate,
}: {
  visible: boolean;
  onClose: () => void;
  initialDate: string;
}) {
  const c = usePalette();
  const colors = useThemeColors();
  const styles = useStyles();
  const { addEvent } = useEvents();
  const { categories } = useEventCategories();

  const [title, setTitle] = useState('');
  const [type, setType] = useState(DEFAULT_CATEGORY);
  const [date, setDate] = useState(initialDate);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset the form each time the sheet opens, defaulting to the tapped day.
  useEffect(() => {
    if (visible) {
      setTitle('');
      setType(DEFAULT_CATEGORY);
      setDate(initialDate);
      setNotes('');
      setShowDatePicker(false);
    }
  }, [visible, initialDate]);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await addEvent({ title: title.trim(), date, type, notes: notes.trim() || undefined });
    setSaving(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.head}>
              <Text style={styles.title}>Add Event</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <IconX size={18} color={c.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 440 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Event</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Club tournament, official visit"
                placeholderTextColor={c.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.catWrap}>
                {categories.map((cat) => {
                  const selected = type === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => setType(cat.key)}
                      style={[styles.catChip, { borderColor: selected ? cat.color : c.borderStrong, backgroundColor: selected ? withAlpha(cat.color, 0.15) : c.surfaceRaised }]}>
                      <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.catChipText, { color: selected ? c.text : c.textDim }]}>{cat.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Date</Text>
              <Pressable onPress={() => setShowDatePicker((v) => !v)} style={styles.dateField}>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <Text style={[styles.dateHint, { color: colors.primary }]}>{showDatePicker ? 'Done' : 'Change'}</Text>
              </Pressable>
              {showDatePicker && (
                <View style={{ marginBottom: 16 }}>
                  <MonthCalendar
                    eventColorsByDay={EMPTY_COLORS}
                    sessionDays={EMPTY_DAYS}
                    selectedKey={date}
                    onSelectDay={(k) => { setDate(k); setShowDatePicker(false); }}
                    primary={colors.primary}
                    showLegend={false}
                  />
                </View>
              )}

              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Location, time, details"
                placeholderTextColor={c.textMuted}
                style={styles.input}
              />
            </ScrollView>

            <Pressable
              onPress={save}
              disabled={saving || !title.trim()}
              style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: saving || !title.trim() ? 0.5 : pressed ? 0.9 : 1 }]}>
              <Text style={[styles.saveText, { color: colors.textOnPrimary }]}>{saving ? 'Saving…' : 'Add Event'}</Text>
            </Pressable>
            <SafeAreaView edges={['bottom']} />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surfaceDeep, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 2, color: c.text },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: c.textMuted, marginBottom: 7 },
  input: { backgroundColor: c.surfaceRaised, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 16, color: c.text, fontSize: 16, fontFamily: fonts.body, marginBottom: 16 },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  catDot: { width: 9, height: 9, borderRadius: 5 },
  catChipText: { fontFamily: fonts.medium, fontSize: 13 },
  dateField: { backgroundColor: c.surfaceRaised, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { color: c.text, fontSize: 16, fontFamily: fonts.body },
  dateHint: { fontSize: 14, fontFamily: fonts.semibold },
  saveBtn: { borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  saveText: { fontFamily: fonts.semibold, fontSize: 16 },
}));
