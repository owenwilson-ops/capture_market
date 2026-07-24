import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientGlow } from '@/components/ui';
import { useThemeColors } from '@/context/ThemeContext';
import { fonts } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

// Temporary screen for routes not yet ported from the web app.
export function Placeholder({ title }: { title: string }) {
  const colors = useThemeColors();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.primary} size={420} opacity={0.18} style={styles.glow} />
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>Coming soon</Text>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  glow: { position: 'absolute', top: -120, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontFamily: fonts.display, fontSize: 44, letterSpacing: 3, color: c.text },
  sub: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: c.textMuted,
  },
}));
