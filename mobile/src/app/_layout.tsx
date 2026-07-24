import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProfileProvider } from '@/hooks/useProfile';
import { EventsProvider } from '@/hooks/useEvents';
import { AcademicsProvider } from '@/hooks/useAcademics';
import { JournalProvider } from '@/hooks/useJournal';
import { EventCategoriesProvider } from '@/context/EventCategories';
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemeModeProvider, usePalette } from '@/context/ThemeMode';

// Keep the native splash up until fonts are ready (called in global scope).
SplashScreen.preventAutoHideAsync();

function ThemedRoot() {
  const { user, loading } = useAuth();
  const palette = usePalette();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // The only public route is the auth screen at "/".
    const onAuthScreen = segments.length === 0 || segments[0] === 'index';
    if (!user && !onAuthScreen) {
      router.replace('/');
    } else if (user && onAuthScreen) {
      router.replace('/home');
    }
  }, [user, loading, segments, router]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <StatusBar style={palette.scheme === 'light' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bg },
          animation: 'fade',
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeModeProvider>
          <EventCategoriesProvider>
            <AuthProvider>
              <ProfileProvider>
                <EventsProvider>
                  <AcademicsProvider>
                    <JournalProvider>
                      <ThemeProvider>
                        <ThemedRoot />
                      </ThemeProvider>
                    </JournalProvider>
                  </AcademicsProvider>
                </EventsProvider>
              </ProfileProvider>
            </AuthProvider>
          </EventCategoriesProvider>
        </ThemeModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
