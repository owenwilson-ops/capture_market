import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientGlow } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/ThemeMode';
import { fonts, withAlpha } from '@/theme';
import { makeStyles } from '@/theme/makeStyles';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const c = usePalette();
  const styles = useStyles();

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const { error } = mode === 'signup' ? await signUp(email, password) : await signIn(email, password);
      if (error) throw error;
      // The auth gate in _layout.tsx redirects to /home once the session is set.
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <AmbientGlow color="#7A5AC8" size={500} opacity={0.28} style={styles.glowTop} />
      <AmbientGlow color="#5A3CA0" size={400} opacity={0.18} style={styles.glowBottom} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}>
          {/* Wordmark */}
          <View style={styles.wordmark}>
            <Text style={styles.kicker}>Women's Lacrosse Recruiting</Text>
            <Text style={styles.brand}>RECRUIT READY</Text>
            <View style={styles.rule} />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={c.textGhost}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={c.textGhost}
              secureTextEntry
              style={styles.input}
            />

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [styles.submit, { opacity: loading ? 0.6 : pressed ? 0.9 : 1 }]}>
              <Text style={styles.submitText}>
                {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <Pressable
                onPress={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}>
                <Text style={styles.switchLink}>{mode === 'signin' ? 'Sign up' : 'Sign in'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  glowTop: { position: 'absolute', top: -100, alignSelf: 'center' },
  glowBottom: { position: 'absolute', bottom: -100, right: -100 },
  safe: { flex: 1 },
  kav: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  wordmark: { alignItems: 'center', marginBottom: 48 },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: c.textFaint,
    marginBottom: 10,
  },
  brand: { fontFamily: fonts.display, fontSize: 52, letterSpacing: 6, color: c.text, lineHeight: 54 },
  rule: { width: 40, height: 2, backgroundColor: c.borderStrong, marginTop: 14, borderRadius: 1 },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: c.surfaceHigh,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 18,
    padding: 32,
  },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 19, color: c.text, marginBottom: 24 },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: c.textMuted,
    marginBottom: 7,
  },
  input: {
    width: '100%',
    backgroundColor: c.fieldBg,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    color: c.text,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  errorBox: {
    marginTop: 16,
    backgroundColor: c.dangerBg,
    borderWidth: 1,
    borderColor: c.dangerBorder,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorText: { color: c.danger, fontSize: 13, fontFamily: fonts.body },
  submit: {
    marginTop: 20,
    width: '100%',
    backgroundColor: c.accentBtn,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' },
  switchText: { color: c.textMuted, fontSize: 13, fontFamily: fonts.body },
  switchLink: { color: withAlpha('#8A5CFF', 0.95), fontSize: 13, fontFamily: fonts.semibold },
}));
