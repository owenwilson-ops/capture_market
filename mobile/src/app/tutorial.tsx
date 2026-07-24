// Click-through walkthrough. One step per tab/feature, opened from Profile >
// How to Use and from the first-run hint on Home. Copy is intentionally
// structural (what each tab is for), not button-by-button, so it ages with the
// app. Opening it marks the first-run hint as seen.
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette } from '@/context/ThemeMode';
import { TUTORIAL_HINT_KEY } from '@/lib/tutorial';
import {
  IconHome,
  IconTrain,
  IconSchools,
  IconRoadmap,
  IconProfile,
  IconCheck,
  IconFlame,
  IconChevronRight,
  IconX,
} from '@/components/Icons';
import { fonts, withAlpha } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

type Step = {
  icon: keyof typeof ICONS;
  title: string;
  body?: string;
  bullets?: string[];
  route?: string;
};

const ICONS = {
  star: IconFlame,
  home: IconHome,
  train: IconTrain,
  schools: IconSchools,
  academics: IconCheck,
  roadmap: IconRoadmap,
  profile: IconProfile,
  check: IconCheck,
};

const STEPS: Step[] = [
  {
    icon: 'star',
    title: 'Welcome to Sirius Recruit',
    body: 'Train with purpose, recruit with intent. Here is a quick tour of how the app works. Step through it, or jump straight to any tab with "Show me".',
  },
  {
    icon: 'home',
    title: 'Home',
    route: '/home',
    bullets: [
      'Check off your daily Non-Negotiables to build your streak.',
      "See today's position-based session and the wall-ball timer.",
      'Use the monthly calendar to add events and see what is coming up.',
      'Open Academic Fit to see where your GPA stands.',
    ],
  },
  {
    icon: 'train',
    title: 'Train',
    route: '/train',
    bullets: [
      'Workouts are tailored to your position. Set it in Profile.',
      'Skill Focus lists your plans, Week gives a 5-day mix, Calendar shows your week.',
      'Open a plan, start the session, and pause anytime for water or a drill switch.',
      'Finish a session to log it to your calendar.',
    ],
  },
  {
    icon: 'schools',
    title: 'My Schools',
    route: '/schools',
    bullets: [
      'Add up to five programs you are targeting.',
      'See coaching staff, roster depth by position, and scoring leaders.',
      'Log every contact with a coach so nothing slips.',
    ],
  },
  {
    icon: 'academics',
    title: 'Academics',
    route: '/academics',
    bullets: [
      'See the NCAA D1 and D2 eligibility bar and where your GPA lands.',
      "Check your dream school's acceptance rate and test ranges.",
      'Recruited-athlete admissions can differ, so always confirm with the coach.',
    ],
  },
  {
    icon: 'roadmap',
    title: 'Roadmap',
    route: '/roadmap',
    bullets: [
      'Follow your recruiting milestones from where you are now.',
      'Check off steps as you complete them to stay on track.',
    ],
  },
  {
    icon: 'profile',
    title: 'Profile',
    route: '/profile',
    bullets: [
      'Set your dream school. Its colors theme the whole app.',
      'Set your position to tailor your workouts.',
      'Switch light, dark, or auto, and recolor your event categories.',
      'Reopen this walkthrough anytime under How to Use.',
    ],
  },
  {
    icon: 'check',
    title: "You're set",
    body: 'That is the tour. Pick your dream school, set your position, and start training. You can reopen this anytime from Profile.',
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const c = usePalette();
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Step>>(null);
  const [step, setStep] = useState(0);

  // Opening the tour means they have seen the pointer — stop nagging.
  useEffect(() => {
    AsyncStorage.setItem(TUTORIAL_HINT_KEY, '1');
  }, []);

  const isLast = step === STEPS.length - 1;

  function close() {
    router.back();
  }

  // Drive the same paged list from the Back/Next buttons.
  function goTo(i: number) {
    const next = Math.max(0, Math.min(STEPS.length - 1, i));
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setStep(next);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={close} hitSlop={8} style={{ marginLeft: 'auto' }}>
            <IconX size={20} color={c.textMuted} />
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={STEPS}
          horizontal
          pagingEnabled
          style={{ flex: 1 }}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onScrollToIndexFailed={() => {}}
          onMomentumScrollEnd={(e) => setStep(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => {
            const Icon = ICONS[item.icon];
            return (
              <View style={{ width }}>
                <View style={styles.body}>
                  <View style={[styles.iconWrap, { backgroundColor: withAlpha(colors.primary, 0.14), borderColor: withAlpha(colors.primary, 0.35) }]}>
                    <Icon size={34} color={colors.primary} />
                  </View>
                  <Text style={styles.title}>{item.title}</Text>
                  {!!item.body && <Text style={styles.bodyText}>{item.body}</Text>}
                  {!!item.bullets && (
                    <View style={styles.bullets}>
                      {item.bullets.map((b, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                          <Text style={styles.bulletText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {!!item.route && (
                    <Pressable
                      onPress={() => router.push(item.route!)}
                      style={({ pressed }) => [styles.showMe, { borderColor: withAlpha(colors.primary, 0.4), opacity: pressed ? 0.85 : 1 }]}>
                      <Text style={[styles.showMeText, { color: colors.primary }]}>Show me</Text>
                      <IconChevronRight size={14} color={colors.primary} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />

        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === step ? colors.primary : c.borderStrong, width: i === step ? 20 : 6 },
              ]}
            />
          ))}
        </View>

        {/* Nav */}
        <View style={styles.nav}>
          {step > 0 ? (
            <Pressable onPress={() => goTo(step - 1)} style={styles.backBtn}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable
            onPress={() => (isLast ? close() : goTo(step + 1))}
            style={({ pressed }) => [styles.nextBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }]}>
            <Text style={[styles.nextText, { color: colors.textOnPrimary }]}>{isLast ? 'Done' : 'Next'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 8, height: 36 },
  body: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  iconWrap: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontFamily: fonts.display, fontSize: 40, letterSpacing: 2, color: c.text, lineHeight: 42, marginBottom: 14 },
  bodyText: { fontFamily: fonts.body, fontSize: 16, color: c.textDim, lineHeight: 24 },
  bullets: { gap: 14, marginTop: 4 },
  bulletRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  bulletText: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: c.textDim, lineHeight: 22 },
  showMe: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 24, borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  showMeText: { fontFamily: fonts.semibold, fontSize: 14 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 20 },
  dot: { height: 6, borderRadius: 3 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 8 },
  backBtn: { flex: 1, paddingVertical: 15, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: c.borderStrong },
  backText: { fontFamily: fonts.semibold, fontSize: 15, color: c.textDim },
  nextBtn: { flex: 2, paddingVertical: 15, alignItems: 'center', borderRadius: 10 },
  nextText: { fontFamily: fonts.semibold, fontSize: 16 },
}));
