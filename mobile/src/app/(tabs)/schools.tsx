import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette } from '@/context/ThemeMode';
import { SCHOOLS } from '@/shared-data/schools';
import { ROSTER_DATA, getPositionNeed } from '@/shared-data/rosterData';
import { getTeamLeaders, filmSearchUrl, getTeamSeason } from '@/shared-data/statsLeaders';
import { supabase } from '@/lib/supabase';
import { IconPlus, IconX, IconSearch, IconCheck } from '@/components/Icons';
import { fonts, withAlpha, mix, type Palette } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

const CLASS_COLORS: Record<string, number> = { SR: 1.0, JR: 0.7, SO: 0.45, FR: 0.25 };
const CLASS_ORDER = ['SR', 'JR', 'SO', 'FR'] as const;

function initialsOf(name: string) {
  return name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
}

function CoachPhoto({ src, name, size = 52 }: { src?: string; name: string; size?: number }) {
  const c = usePalette();
  const [errored, setErrored] = useState(false);
  if (src && !errored) {
    return (
      <Image
        source={{ uri: src }}
        onError={() => setErrored(true)}
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: c.border }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.fieldBg,
        borderWidth: 2,
        borderColor: c.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.35, letterSpacing: 1, color: c.textMuted }}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

export default function SchoolsScreen() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile(user?.id);
  const colors = useThemeColors();
  const c = usePalette();
  const styles = useStyles();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'staff' | 'roster' | 'leaders'>('staff');
  const [showAdd, setShowAdd] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactLogs, setContactLogs] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const mySchoolIds: string[] = profile?.mySchools || [];
  const activeId = selectedId || mySchoolIds[0];
  const school = SCHOOLS.find((s: any) => s.id === activeId) as any;
  const rosterData = activeId ? (ROSTER_DATA as any)[activeId] : null;
  // Identity-only schools may not have a brand color yet; fall back gracefully.
  const accent = (school && school.primaryColor) || c.textMuted;

  useEffect(() => {
    if (mySchoolIds.length && !selectedId) setSelectedId(mySchoolIds[0]);
  }, [mySchoolIds.length]);

  useEffect(() => {
    if (!user || !activeId) return;
    supabase
      .from('contactLogs')
      .select('*')
      .eq('userId', user.id)
      .eq('schoolId', activeId)
      .order('date', { ascending: false })
      .then(({ data }: { data: any[] | null }) => setContactLogs(data || []));
  }, [user, activeId]);

  async function removeSchool(id: string) {
    const updated = mySchoolIds.filter((s) => s !== id);
    await updateProfile({ mySchools: updated });
    if (selectedId === id) setSelectedId(updated[0] || null);
  }

  async function addSchool(id: string) {
    if (mySchoolIds.includes(id) || mySchoolIds.length >= 5) return;
    const updated = [...mySchoolIds, id];
    await updateProfile({ mySchools: updated });
    setSelectedId(id);
    setShowAdd(false);
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[withAlpha(colors.primary, 0.18), c.bg]} style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <Text style={styles.h1}>My Schools</Text>
            <Text style={styles.sub}>Track coaching staff, roster depth, and contact history.</Text>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          {/* School slots */}
          <View style={styles.slots}>
            {mySchoolIds.map((id) => {
              const s = SCHOOLS.find((sc: any) => sc.id === id);
              const isActive = id === activeId;
              return (
                <Pressable
                  key={id}
                  onPress={() => setSelectedId(id)}
                  style={[
                    styles.slot,
                    {
                      backgroundColor: isActive ? withAlpha(s?.primaryColor || '#888', 0.15) : c.fieldBg,
                      borderColor: isActive ? s?.primaryColor : c.border,
                    },
                  ]}>
                  <View style={[styles.slotDot, { backgroundColor: s?.primaryColor }]} />
                  <Text style={[styles.slotName, { color: isActive ? s?.primaryColor : c.textDim }]}>{s?.shortName}</Text>
                  <Pressable onPress={() => removeSchool(id)} hitSlop={8} style={{ marginLeft: 2 }}>
                    <IconX size={11} color={c.textGhost} />
                  </Pressable>
                </Pressable>
              );
            })}

            {mySchoolIds.length < 5 && (
              <Pressable onPress={() => setShowAdd(true)} style={[styles.addSlot, { borderColor: c.borderStrong }]}>
                <IconPlus size={14} color={c.textMuted} />
                <Text style={[styles.addSlotText, { color: c.textMuted }]}>Add School</Text>
              </Pressable>
            )}
          </View>

          {school ? (
            <View>
              {/* Identity card */}
              <LinearGradient
                colors={[mix(accent, c.surfaceHigh, 0.18), c.surfaceDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.identity, { borderColor: withAlpha(accent, 0.3) }]}>
                <Text style={[styles.watermark, { color: withAlpha(accent, 0.08) }]} numberOfLines={1}>
                  {school.shortName}
                </Text>
                <Text style={styles.identityName}>{school.name}</Text>
                <View style={styles.identityChips}>
                  {!!school.mascot && (
                    <View style={[styles.idChip, { backgroundColor: withAlpha(accent, 0.15), borderColor: withAlpha(accent, 0.3) }]}>
                      <Text style={[styles.idChipText, { color: accent }]}>{school.mascot}</Text>
                    </View>
                  )}
                  {!!school.conference && <SecondaryChip label={school.conference} c={c} />}
                  {!!school.division && <SecondaryChip label={school.division} c={c} />}
                </View>
              </LinearGradient>

              {rosterData ? (
                <>
              {/* Tabs */}
              <View style={styles.segment}>
                {([['staff', 'Coaching Staff'], ['roster', 'Roster Depth'], ['leaders', 'Stat Leaders']] as const).map(
                  ([key, label]) => {
                    const active = tab === key;
                    return (
                      <Pressable key={key} onPress={() => setTab(key)} style={[styles.segBtn, active && { backgroundColor: colors.primary }]}>
                        <Text style={[styles.segText, active && { color: colors.textOnPrimary }]} numberOfLines={1}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </View>

              {tab === 'staff' && (
                <View>
                  <View style={{ gap: 10, marginBottom: 16 }}>
                    {rosterData.coachingStaff.map((coach: any, i: number) => (
                      <View key={i} style={styles.coachCard}>
                        <CoachPhoto src={coach.photo} name={coach.name} size={52} />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.coachName}>{coach.name}</Text>
                          <Text style={styles.coachTitle}>{coach.title}</Text>
                          {!!coach.email && (
                            <Text
                              onPress={() => Linking.openURL(`mailto:${coach.email}`)}
                              style={[styles.coachLink, { color: school.primaryColor }]}
                              numberOfLines={1}>
                              {coach.email}
                            </Text>
                          )}
                          {!!coach.phone && (
                            <Text onPress={() => Linking.openURL(`tel:${coach.phone}`)} style={styles.coachPhone}>
                              {coach.phone}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>

                  <Pressable onPress={() => setShowContact(true)} style={[styles.fullBtn, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.fullBtnText, { color: colors.textOnPrimary }]}>Log Contact</Text>
                  </Pressable>

                  {contactLogs.length > 0 && (
                    <Pressable onPress={() => setShowHistory((s) => !s)} style={styles.historyToggle}>
                      <Text style={styles.historyToggleText}>
                        {showHistory ? 'Hide' : 'View'} Contact History ({contactLogs.length})
                      </Text>
                    </Pressable>
                  )}

                  {showHistory && (
                    <View style={{ gap: 8, marginTop: 8 }}>
                      {contactLogs.map((log: any) => (
                        <View key={log.id} style={styles.logCard}>
                          <View style={styles.logHead}>
                            <SecondaryChip label={log.method} c={c} />
                            <Text style={styles.logDate}>{log.date}</Text>
                          </View>
                          {!!log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {tab === 'roster' && <RosterDepth rosterData={rosterData} school={school} profile={profile} c={c} colors={colors} styles={styles} />}

              {tab === 'leaders' && <StatLeaders schoolId={activeId!} rosterData={rosterData} school={school} c={c} styles={styles} />}
                </>
              ) : (
                <View>
                  <View style={styles.noticeCard}>
                    <Text style={styles.noticeText}>
                      Roster, coaching staff, and stat leaders aren't tracked for {school.shortName} yet. You can still set it as your dream school, theme the app around it, and log your contact with the program.
                    </Text>
                  </View>
                  <Pressable onPress={() => setShowContact(true)} style={[styles.fullBtn, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.fullBtnText, { color: colors.textOnPrimary }]}>Log Contact</Text>
                  </Pressable>
                  {contactLogs.length > 0 && (
                    <Pressable onPress={() => setShowHistory((s) => !s)} style={styles.historyToggle}>
                      <Text style={styles.historyToggleText}>
                        {showHistory ? 'Hide' : 'View'} Contact History ({contactLogs.length})
                      </Text>
                    </Pressable>
                  )}
                  {showHistory && (
                    <View style={{ gap: 8, marginTop: 8 }}>
                      {contactLogs.map((log: any) => (
                        <View key={log.id} style={styles.logCard}>
                          <View style={styles.logHead}>
                            <SecondaryChip label={log.method} c={c} />
                            <Text style={styles.logDate}>{log.date}</Text>
                          </View>
                          {!!log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No Schools Added</Text>
              <Text style={styles.emptySub}>Add up to 5 programs to track coaching staff and roster depth.</Text>
              <Pressable onPress={() => setShowAdd(true)} style={[styles.fullBtn, { backgroundColor: colors.primary, alignSelf: 'center', paddingHorizontal: 24 }]}>
                <Text style={[styles.fullBtnText, { color: colors.textOnPrimary }]}>Add Your First School</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {showAdd && <AddSchoolModal current={mySchoolIds} onAdd={addSchool} onClose={() => setShowAdd(false)} c={c} styles={styles} />}
      {showContact && (
        <ContactLogModal
          userId={user?.id}
          schoolId={activeId!}
          onClose={() => setShowContact(false)}
          onSaved={(log: any) => {
            setContactLogs((prev) => [log, ...prev]);
            setShowContact(false);
          }}
          c={c}
          colors={colors}
          styles={styles}
        />
      )}
    </View>
  );
}

function SecondaryChip({ label, c }: { label: string; c: Palette }) {
  return (
    <View style={{ backgroundColor: c.fieldBg, borderWidth: 1, borderColor: c.border, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.textDim }}>{label}</Text>
    </View>
  );
}

function RosterDepth({ rosterData, school, profile, c, colors, styles }: any) {
  const positions = ['Attack', 'Midfielder', 'Defense', 'Goalie'];
  const userPosition = profile?.position;
  const userGradYear = profile?.gradYear || 2028;

  return (
    <View>
      <View style={{ gap: 10, marginBottom: 16 }}>
        {positions.map((pos) => {
          const need = getPositionNeed(school.id, pos, userGradYear) as 'high' | 'medium' | 'low';
          const isUserPos = pos === userPosition;
          const players = rosterData.roster.filter((p: any) => p.position === pos);
          const byCYear: Record<string, any[]> = { SR: [], JR: [], SO: [], FR: [] };
          players.forEach((p: any) => {
            if (byCYear[p.year]) byCYear[p.year].push(p);
          });
          const needText = {
            high: `${players.filter((p: any) => p.gradYear <= userGradYear).length} players graduating before your entry — strong opportunity`,
            medium: '1 player graduating before your entry — some roster need',
            low: 'Stacked with underclassmen through your entry year — limited need',
          }[need];
          const needChipColor = need === 'high' ? colors.primary : c.textMuted;

          return (
            <View
              key={pos}
              style={[
                styles.posCard,
                {
                  backgroundColor: isUserPos ? mix(school.primaryColor, c.surfaceHigh, 0.08) : c.surfaceHigh,
                  borderColor: isUserPos ? withAlpha(school.primaryColor, 0.25) : c.borderSoft,
                },
              ]}>
              <View style={styles.posHead}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.posName}>{pos}</Text>
                  {isUserPos && (
                    <View style={[styles.idChip, { backgroundColor: withAlpha(colors.primary, 0.18), borderColor: withAlpha(colors.primary, 0.35) }]}>
                      <Text style={[styles.idChipText, { color: colors.primary }]}>Your Position</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.needChip, { borderColor: withAlpha(needChipColor, 0.35), backgroundColor: withAlpha(needChipColor, 0.15) }]}>
                  <Text style={[styles.needChipText, { color: needChipColor }]}>{need} need</Text>
                </View>
              </View>
              <View style={styles.dotsRow}>
                {CLASS_ORDER.map((year) =>
                  byCYear[year].map((_: any, i: number) => (
                    <View key={`${year}-${i}`} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: school.primaryColor, opacity: CLASS_COLORS[year] }} />
                  ))
                )}
              </View>
              <View style={styles.legendRow}>
                {CLASS_ORDER.map((year) => (
                  <View key={year} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 1, backgroundColor: school.primaryColor, opacity: CLASS_COLORS[year] }} />
                    <Text style={styles.legendText}>
                      {year} {byCYear[year].length}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.needText}>{needText}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.disclaimer}>Roster data is updated periodically. Always verify directly with the coaching staff.</Text>
    </View>
  );
}

function FilmLink({ name, schoolName, color }: { name: string; schoolName: string; color: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(filmSearchUrl(name, schoolName))}
      style={{ borderWidth: 1, borderColor: withAlpha(color, 0.35), backgroundColor: withAlpha(color, 0.12), paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 }}>
      <Text style={{ fontSize: 11, fontFamily: fonts.semibold, color }}>Watch film</Text>
    </Pressable>
  );
}

function StatLeaders({ schoolId, rosterData, school, c, styles }: any) {
  const leaders = getTeamLeaders(schoolId);

  // Join leaders/players to their roster headshot by name (schools whose roster
  // carries player photos show a real headshot; others fall back to initials).
  const photoByName: Record<string, string> = {};
  (rosterData?.roster || []).forEach((p: any) => {
    if (p.name && p.photo) photoByName[p.name.toLowerCase()] = p.photo;
  });
  const photoFor = (name: string) => photoByName[name?.toLowerCase()];

  if (leaders.length > 0) {
    return (
      <View>
        <View style={styles.leaderHead}>
          <Text style={styles.leaderTitle}>Scoring Leaders</Text>
          <Text style={styles.leaderSeason}>{getTeamSeason(schoolId)} SEASON</Text>
        </View>
        <View style={{ gap: 10 }}>
          {leaders.map((p: any, i: number) => (
            <View key={`${p.name}-${i}`} style={styles.leaderCard}>
              <Text style={[styles.leaderRank, { color: school.primaryColor }]}>{i + 1}</Text>
              <CoachPhoto src={photoFor(p.name)} name={p.name} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.leaderName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.leaderMeta}>
                  {[p.position, `${p.points} PTS`, `${p.goals}G`, `${p.assists}A`].filter(Boolean).join('  ·  ')}
                </Text>
              </View>
              <FilmLink name={p.name} schoolName={school.name} color={school.primaryColor} />
            </View>
          ))}
        </View>
        <Text style={styles.disclaimer}>Season stats from the program's official athletics site. Film links open a YouTube search.</Text>
      </View>
    );
  }

  const classRank: Record<string, number> = { SR: 0, JR: 1, SO: 2, FR: 3 };
  const watchable = rosterData.roster
    .filter((p: any) => p.name)
    .slice()
    .sort((a: any, b: any) => (classRank[a.year] ?? 9) - (classRank[b.year] ?? 9) || a.name.localeCompare(b.name));

  return (
    <View>
      <View style={styles.noticeCard}>
        <Text style={styles.noticeText}>
          Scoring leaders aren't available for this program yet. Here is the full roster so you can watch film on any player.
        </Text>
      </View>
      {watchable.length > 0 ? (
        <View style={{ gap: 8 }}>
          {watchable.map((p: any, i: number) => (
            <View key={`${p.name}-${i}`} style={styles.rosterCard}>
              <CoachPhoto src={photoFor(p.name)} name={p.name} size={36} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.leaderName}>{p.name}</Text>
                <Text style={styles.leaderMeta}>{[p.position, p.year].filter(Boolean).join('  ·  ')}</Text>
              </View>
              <FilmLink name={p.name} schoolName={school.name} color={school.primaryColor} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.disclaimer, { paddingVertical: 20 }]}>No roster data available for this program yet.</Text>
      )}
    </View>
  );
}

function AddSchoolModal({ current, onAdd, onClose, c, styles }: any) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const filtered = SCHOOLS.filter(
    (s: any) =>
      s.id !== 'undecided' &&
      !current.includes(s.id) &&
      (s.name.toLowerCase().includes(query.toLowerCase()) || s.shortName.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Add a School</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <IconX size={20} color={c.textMuted} />
            </Pressable>
          </View>
          <View style={styles.searchWrap}>
            <IconSearch size={15} color={c.textGhost} />
            <TextInput
              autoFocus
              placeholder="Search schools…"
              placeholderTextColor={c.textGhost}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </View>
          <ScrollView style={{ maxHeight: 380 }} keyboardShouldPersistTaps="handled">
            {filtered.map((s: any) => (
              <Pressable key={s.id} onPress={() => onAdd(s.id)} style={styles.searchRow}>
                <View style={{ width: 4, height: 40, borderRadius: 2, backgroundColor: s.primaryColor }} />
                <View>
                  <Text style={styles.searchName}>{s.name}</Text>
                  <Text style={styles.searchMeta}>
                    {s.mascot} · {s.conference}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ContactLogModal({ userId, schoolId, onClose, onSaved, c, colors, styles }: any) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('Email');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const methods = ['Email', 'Phone', 'Camp', 'Official Visit', 'Unofficial Visit'];

  async function save() {
    setSaving(true);
    const { data, error } = await supabase
      .from('contactLogs')
      .insert({ userId, schoolId, date, method, notes, createdAt: new Date().toISOString() })
      .select()
      .single();
    setSaving(false);
    if (!error) onSaved(data);
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalScrim}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Log Contact</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <IconX size={20} color={c.textMuted} />
            </Pressable>
          </View>
          <View style={{ gap: 16 }}>
            <View>
              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={c.textGhost} style={styles.fieldInput} />
            </View>
            <View>
              <Text style={styles.fieldLabel}>Method</Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {methods.map((m) => {
                  const active = method === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMethod(m)}
                      style={[
                        styles.methodChip,
                        { backgroundColor: active ? colors.primary : c.fieldBg, borderColor: active ? colors.primary : c.border },
                      ]}>
                      <Text style={{ fontSize: 13, color: active ? colors.textOnPrimary : c.textDim, fontFamily: fonts.medium }}>{m}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="What was discussed?"
                placeholderTextColor={c.textGhost}
                multiline
                numberOfLines={3}
                style={[styles.fieldInput, { minHeight: 80, textAlignVertical: 'top' }]}
              />
            </View>
            <Pressable onPress={save} disabled={saving} style={[styles.fullBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}>
              <Text style={[styles.fullBtnText, { color: colors.textOnPrimary }]}>{saving ? 'Saving…' : 'Save Contact Log'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  hero: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  h1: { fontFamily: fonts.display, fontSize: 48, letterSpacing: 3, color: c.text, lineHeight: 50 },
  sub: { color: c.textMuted, fontSize: 13, marginTop: 6, fontFamily: fonts.body },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  slots: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  slotDot: { width: 6, height: 6, borderRadius: 3 },
  slotName: { fontFamily: fonts.display, fontSize: 16, letterSpacing: 1 },
  addSlot: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  addSlotText: { fontSize: 13, fontFamily: fonts.medium },
  identity: { borderWidth: 1, borderRadius: 16, padding: 22, marginBottom: 16, overflow: 'hidden' },
  watermark: { position: 'absolute', right: -10, bottom: -24, fontFamily: fonts.display, fontSize: 80, letterSpacing: 4 },
  identityName: { fontFamily: fonts.display, fontSize: 32, letterSpacing: 2, color: c.text, lineHeight: 34 },
  identityChips: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  idChip: { borderWidth: 1, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  idChipText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' },
  segment: { flexDirection: 'row', gap: 4, marginBottom: 20, backgroundColor: c.fieldBg, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 12, padding: 4 },
  segBtn: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  segText: { fontFamily: fonts.semibold, fontSize: 12.5, color: c.textMuted },
  coachCard: { backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  coachName: { fontFamily: fonts.semibold, fontSize: 15, color: c.text, marginBottom: 2 },
  coachTitle: { fontSize: 12, color: c.textMuted, marginBottom: 10, fontFamily: fonts.body },
  coachLink: { fontSize: 12, fontFamily: fonts.medium, marginBottom: 2 },
  coachPhone: { fontSize: 12, color: c.textMuted, fontFamily: fonts.body },
  fullBtn: { borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  fullBtnText: { fontFamily: fonts.semibold, fontSize: 15 },
  historyToggle: { paddingVertical: 8, alignItems: 'center' },
  historyToggleText: { color: c.textMuted, fontSize: 13, fontFamily: fonts.body },
  logCard: { backgroundColor: c.fieldBg, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 10, padding: 14 },
  logHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logDate: { fontFamily: fonts.mono, fontSize: 9, color: c.textFaint },
  logNotes: { fontSize: 13, color: c.textDim, lineHeight: 21, fontFamily: fonts.body },
  posCard: { borderWidth: 1, borderRadius: 12, padding: 16 },
  posHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  posName: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  needChip: { borderWidth: 1, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  needChipText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' },
  dotsRow: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', marginBottom: 10 },
  legendRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  legendText: { fontFamily: fonts.mono, fontSize: 8, color: c.textMuted, letterSpacing: 1 },
  needText: { fontSize: 12, color: c.textMuted, lineHeight: 19, fontFamily: fonts.body },
  disclaimer: { fontSize: 11, color: c.textFaint, textAlign: 'center', lineHeight: 18, marginTop: 8, fontFamily: fonts.body },
  leaderHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  leaderTitle: { fontFamily: fonts.display, fontSize: 18, letterSpacing: 1.5, color: c.text },
  leaderSeason: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: c.textFaint },
  leaderCard: { backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  leaderRank: { fontFamily: fonts.display, fontSize: 22, width: 24, textAlign: 'center' },
  leaderName: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  leaderMeta: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5, color: c.textMuted, marginTop: 3 },
  noticeCard: { backgroundColor: c.fieldBg, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 12, padding: 14, marginBottom: 14 },
  noticeText: { fontSize: 12, color: c.textDim, lineHeight: 19, fontFamily: fonts.body },
  rosterCard: { backgroundColor: c.surfaceHigh, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 28, color: c.textGhost, marginBottom: 8 },
  emptySub: { color: c.textMuted, fontSize: 14, marginBottom: 24, textAlign: 'center', fontFamily: fonts.body },
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surfaceHigh, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderWidth: 1, borderColor: c.border },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 2, color: c.text },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.fieldBg, borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 13, marginBottom: 14 },
  searchInput: { flex: 1, paddingVertical: 12, color: c.text, fontSize: 15, fontFamily: fonts.body },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.borderSoft },
  searchName: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  searchMeta: { fontSize: 11, color: c.textMuted, fontFamily: fonts.mono, letterSpacing: 1, marginTop: 2 },
  fieldLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: c.textMuted, marginBottom: 7 },
  fieldInput: { backgroundColor: c.fieldBg, borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 16, color: c.text, fontSize: 15, fontFamily: fonts.body },
  methodChip: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
}));
