import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  IconHome,
  IconTrain,
  IconSchools,
  IconRoadmap,
  IconProfile,
} from '@/components/Icons';
import { useThemeColors } from '@/context/ThemeContext';
import { usePalette } from '@/context/ThemeMode';
import { fonts } from '@/theme';

const TABS = [
  { name: 'home', label: 'Home', Icon: IconHome },
  { name: 'train', label: 'Train', Icon: IconTrain },
  { name: 'schools', label: 'Schools', Icon: IconSchools },
  { name: 'roadmap', label: 'Roadmap', Icon: IconRoadmap },
  { name: 'profile', label: 'Profile', Icon: IconProfile },
] as const;

function TabBar({ state, navigation }: any) {
  const colors = useThemeColors();
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: palette.navBg,
          borderTopColor: palette.border,
        },
      ]}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? colors.primary : palette.textGhost;
        const Icon = tab.Icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item} hitSlop={8}>
            <View>
              <Icon size={22} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="train" />
      <Tabs.Screen name="schools" />
      <Tabs.Screen name="roadmap" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  dot: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
