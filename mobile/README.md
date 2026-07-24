# Sirius Recruit — Mobile (Expo / React Native)

The **player-facing** app for iOS and Android. The web app in `../` stays the
**parent-facing** product. This app is Expo SDK 56 + expo-router.

## Run it

```bash
cd mobile
npx expo start
```

Then scan the QR code with **Expo Go** (iOS: Camera app; Android: Expo Go's
"scan" button). Phone and Mac must be on the same network.

## Environment

`mobile/.env` holds `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`,
pointing at the **same Supabase project** as the web app. (Mirror of the web
`VITE_SUPABASE_*` vars.)

## Shared data layer

The pure data files (`schools`, `trainingData`, etc.) live in the web app at
`../src/data` and are **vendored** into `src/shared-data/` as a copy. Metro's
project-boundary rules make importing across the repo root unreliable, so we
copy instead of alias. After changing data in the web app, resync:

```bash
npm run sync-data
```

(Imports use `@/shared-data/<file>`.) A proper shared workspace package can
replace this later if the data starts changing often.

## What's ported so far (foundation)

- Auth (Supabase email/password) with session persistence via AsyncStorage
- School-themed color system (`ThemeContext`, replaces the web CSS variables)
- Tab navigation (Home / Train / Schools / Roadmap / Profile)
- **Home** screen (streak, sessions, days-left, non-negotiables, today's
  session, wall-ball timer) and **Profile** (sign out)
- Stubs: Train, Schools, Roadmap, Onboarding, Session detail

Design system (`src/theme`, `src/components/ui.tsx`) recreates the web look with
RN primitives: `expo-linear-gradient` for cards, `react-native-svg` for icons
and the ambient radial glow, `@expo-google-fonts` for Bebas Neue / DM Sans /
Space Mono.
