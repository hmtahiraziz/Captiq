import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { AuthCheckbox } from '../components/auth/AuthCheckbox';
import { AuthLogoHeader } from '../components/auth/AuthLogoHeader';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { AuthScreenShell } from '../components/auth/AuthScreenShell';
import {
  EmailLeadingIcon,
  GlassInput,
  LockLeadingIcon,
  PasswordVisibilityToggle,
} from '../components/auth/GlassInput';
import {
  PASSWORD_MAX_LENGTH,
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '../lib/auth/authSchemas';
import { getApiErrorMessage, useAuthStore } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

const LOGIN_COPY = {
  headline: 'Welcome back',
  subtitle: 'Sign in to access your saved scans, AI follow-ups, and cloud sync.',
  cta: 'Sign In',
  switchPrompt: "Don't have an account?",
  switchAction: 'Sign up',
} as const;

const REGISTER_COPY = {
  headline: 'Create account',
  subtitle: 'Join Captiq and turn what you see into clear AI insights.',
  cta: 'Create account',
  switchPrompt: 'Already have an account?',
  switchAction: 'Sign in',
} as const;

export function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const isCompact = height < 780 || width < 360;
  const contentTopPad = isCompact
    ? spacing.sm
    : Math.max(spacing.md, Math.min(spacing.xl, (height - 720) * 0.18));
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [keepSignedIn, setKeepSignedInChecked] = useState(true);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  const isLogin = mode === 'login';
  const copy = isLogin ? LOGIN_COPY : REGISTER_COPY;

  useEffect(() => {
    setPasswordVisible(false);
    setConfirmVisible(false);
  }, [mode]);

  const openLegal = (document: 'privacy' | 'terms') => {
    navigation.navigate('LegalDocument', { document });
  };

  const onLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password, keepSignedIn);
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await register(values.email, values.password, keepSignedIn);
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
    setConfirmVisible(false);
    if (next === 'register') {
      loginForm.reset();
    } else {
      registerForm.reset({
        email: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false,
      });
    }
    setMode(next);
  };

  return (
    <AuthScreenShell contentTopPad={contentTopPad}>
      <Animated.View entering={FadeInDown.duration(260).springify().damping(18)}>
        <AuthLogoHeader compact={isCompact} />
      </Animated.View>

      <Animated.View layout={LinearTransition.duration(200)} style={styles.panel}>
        {isLogin ? (
          <Animated.View
            key="login"
            entering={FadeIn.duration(160)}
            style={[styles.form, isCompact && styles.formCompact]}>
            <View style={styles.cardHeader}>
              <Text style={styles.headline}>{LOGIN_COPY.headline}</Text>
              <Text style={styles.subtitle}>{LOGIN_COPY.subtitle}</Text>
            </View>

            <Controller
              control={loginForm.control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput
                  label="Email address"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  leading={<EmailLeadingIcon />}
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
                  textContentType="password"
                  returnKeyType="done"
                  maxLength={PASSWORD_MAX_LENGTH}
                  leading={<LockLeadingIcon />}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  onSubmitEditing={onLogin}
                  error={loginForm.formState.errors.password?.message}
                  labelAccessory={
                    <Pressable
                      hitSlop={8}
                      onPress={() => navigation.navigate('ForgotPassword')}>
                      <Text style={styles.forgotLink}>Forgot password?</Text>
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

            <AuthCheckbox
              checked={keepSignedIn}
              onToggle={() => setKeepSignedInChecked((v) => !v)}
              accessibilityLabel="Keep me signed in on this device"
              label={
                <Text style={styles.checkLabel}>Keep me signed in on this device</Text>
              }
            />

            <AuthPrimaryButton
              label={LOGIN_COPY.cta}
              loading={submitting}
              showArrow
              onPress={onLogin}
            />
          </Animated.View>
        ) : (
          <Animated.View
            key="register"
            entering={FadeIn.duration(160)}
            style={[styles.form, isCompact && styles.formCompact]}>
            <View style={styles.cardHeader}>
              <Text style={styles.headline}>{REGISTER_COPY.headline}</Text>
              <Text style={styles.subtitle}>{REGISTER_COPY.subtitle}</Text>
            </View>

            <Controller
              control={registerForm.control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput
                  label="Email address"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  leading={<EmailLeadingIcon />}
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
                  textContentType="newPassword"
                  returnKeyType="next"
                  maxLength={PASSWORD_MAX_LENGTH}
                  leading={<LockLeadingIcon />}
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

            <Controller
              control={registerForm.control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput
                  label="Confirm password"
                  placeholder="Re-enter your password"
                  secureTextEntry={!confirmVisible}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  maxLength={PASSWORD_MAX_LENGTH}
                  leading={<LockLeadingIcon />}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  onSubmitEditing={onRegister}
                  error={registerForm.formState.errors.confirmPassword?.message}
                  trailing={
                    <PasswordVisibilityToggle
                      visible={confirmVisible}
                      onToggle={() => setConfirmVisible((v) => !v)}
                    />
                  }
                />
              )}
            />

            <AuthCheckbox
              checked={keepSignedIn}
              onToggle={() => setKeepSignedInChecked((v) => !v)}
              accessibilityLabel="Keep me signed in on this device"
              label={
                <Text style={styles.checkLabel}>Keep me signed in on this device</Text>
              }
            />

            <Controller
              control={registerForm.control}
              name="acceptedTerms"
              render={({ field: { onChange, value } }) => (
                <AuthCheckbox
                  checked={value}
                  onToggle={() => onChange(!value)}
                  toggleOnLabelPress={false}
                  accessibilityLabel="Agree to Privacy Policy and Terms of Use"
                  error={registerForm.formState.errors.acceptedTerms?.message}
                  label={
                    <Text style={styles.checkLabel}>
                      <Text onPress={() => onChange(!value)}>I agree to the </Text>
                      <Text
                        style={styles.legalLink}
                        onPress={() => openLegal('privacy')}>
                        Privacy Policy
                      </Text>
                      <Text onPress={() => onChange(!value)}> and </Text>
                      <Text
                        style={styles.legalLink}
                        onPress={() => openLegal('terms')}>
                        Terms of Use
                      </Text>
                      <Text onPress={() => onChange(!value)}>.</Text>
                    </Text>
                  }
                />
              )}
            />

            <AuthPrimaryButton
              label={REGISTER_COPY.cta}
              loading={submitting}
              showArrow
              onPress={onRegister}
            />
          </Animated.View>
        )}
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setAuthMode(isLogin ? 'register' : 'login')}
        style={({ pressed }) => [styles.switchRow, pressed && styles.switchPressed]}>
        <Text style={styles.switchPrompt}>{copy.switchPrompt} </Text>
        <Text style={styles.switchAction}>{copy.switchAction}</Text>
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
  },
  cardHeader: {
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  headline: {
    ...typography.headlineLgMobile,
    color: colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
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
    fontWeight: '700',
  },
  checkLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  legalLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 44,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
  },
  switchPressed: {
    opacity: 0.75,
  },
  switchPrompt: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  switchAction: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '700',
  },
});
