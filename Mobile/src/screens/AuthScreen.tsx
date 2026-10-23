import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthBackground } from '../components/auth/AuthBackground';
import { AuthLogoHeader } from '../components/auth/AuthLogoHeader';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { GlassCard } from '../components/auth/GlassCard';
import {
  GlassInput,
  PasswordVisibilityToggle,
} from '../components/auth/GlassInput';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { getApiErrorMessage, useAuthStore } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const LOGIN_COPY = {
  headline: 'Welcome back',
  subtitle: 'Sign in to scan, ask, and explore with Captiq AI.',
  cta: 'Sign in',
} as const;

const REGISTER_COPY = {
  headline: 'Create account',
  subtitle: 'Join Captiq and turn what you see into clear AI insights.',
  cta: 'Create account',
} as const;

export function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const isCompact = height < 780 || width < 360;
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const isLogin = mode === 'login';
  const copy = isLogin ? LOGIN_COPY : REGISTER_COPY;

  useEffect(() => {
    setPasswordVisible(false);
  }, [mode]);

  const onLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await register(values.email, values.password);
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  });

  const setAuthMode = (next: 'login' | 'register') => {
    if (next === mode) {
      return;
    }
    setPasswordVisible(false);
    if (next === 'register') {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
    setMode(next);
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <AuthBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.container,
            isCompact && styles.containerCompact,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={24}>
          <AuthLogoHeader compact={isCompact} />

          <GlassCard compact={isCompact}>
            <View style={styles.modeSwitch}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isLogin }}
                onPress={() => setAuthMode('login')}
                style={[styles.modeTab, isLogin && styles.modeTabActive]}>
                <Text style={[styles.modeTabLabel, isLogin && styles.modeTabLabelActive]}>
                  Sign in
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !isLogin }}
                onPress={() => setAuthMode('register')}
                style={[styles.modeTab, !isLogin && styles.modeTabActive]}>
                <Text style={[styles.modeTabLabel, !isLogin && styles.modeTabLabelActive]}>
                  Sign up
                </Text>
              </Pressable>
            </View>

            <View style={[styles.cardHeader, isCompact && styles.cardHeaderCompact]}>
              <Text style={styles.headline}>{copy.headline}</Text>
              <Text style={styles.subtitle}>{copy.subtitle}</Text>
            </View>

            {isLogin ? (
              <View style={[styles.form, isCompact && styles.formCompact]}>
                <Controller
                  control={loginForm.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <GlassInput
                      label="Email address"
                      placeholder="name@example.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={loginForm.formState.errors.email?.message}
                    />
                  )}
                />
                <Controller
                  control={loginForm.control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <GlassInput
                      label="Password"
                      placeholder="••••••••"
                      secureTextEntry={!passwordVisible}
                      autoComplete="password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={loginForm.formState.errors.password?.message}
                      labelAccessory={
                        <Pressable
                          hitSlop={8}
                          onPress={() => navigation.navigate('ForgotPassword')}>
                          <Text style={styles.forgotLink}>Forgot?</Text>
                        </Pressable>
                      }
                      trailing={
                        <PasswordVisibilityToggle
                          visible={passwordVisible}
                          onToggle={() => setPasswordVisible((v) => !v)}
                        />
                      }
                    />
                  )}
                />
                <AuthPrimaryButton
                  label={copy.cta}
                  loading={submitting}
                  showArrow
                  onPress={onLogin}
                />
              </View>
            ) : (
              <View style={[styles.form, isCompact && styles.formCompact]}>
                <Controller
                  control={registerForm.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <GlassInput
                      label="Email address"
                      placeholder="name@example.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={registerForm.formState.errors.email?.message}
                    />
                  )}
                />
                <Controller
                  control={registerForm.control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <GlassInput
                      label="Password"
                      placeholder="At least 8 characters"
                      secureTextEntry={!passwordVisible}
                      autoComplete="new-password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={registerForm.formState.errors.password?.message}
                      trailing={
                        <PasswordVisibilityToggle
                          visible={passwordVisible}
                          onToggle={() => setPasswordVisible((v) => !v)}
                        />
                      }
                    />
                  )}
                />
                <AuthPrimaryButton
                  label={copy.cta}
                  loading={submitting}
                  showArrow
                  onPress={onRegister}
                />
              </View>
            )}
          </GlassCard>

          <View style={styles.tipsRow}>
            <View style={styles.tipChip}>
              <MaterialIcon name="auto_awesome" size={14} color={colors.primary} filled />
              <Text style={styles.tipText}>Instant AI captions</Text>
            </View>
            <View style={styles.tipChip}>
              <MaterialIcon name="shield" size={14} color={colors.secondary} />
              <Text style={styles.tipText}>Secure account</Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.xl,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
  },
  containerCompact: {
    paddingVertical: spacing.md,
    justifyContent: 'flex-start',
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg,
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabLabel: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
  modeTabLabelActive: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  cardHeader: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  cardHeaderCompact: {
    marginBottom: spacing.md,
  },
  headline: {
    ...typography.headlineSm,
    color: colors.primary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: spacing.lg,
  },
  formCompact: {
    gap: spacing.md,
  },
  forgotLink: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  tipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  tipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  tipText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
});
