import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
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
import { getApiErrorMessage, useAuthStore } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const LOGIN_COPY = {
  headline: 'Welcome back',
  subtitle: 'Access your vision-powered insights',
  cta: 'Sign in',
  footerPrefix: "Don't have an account?",
  footerAction: 'Sign up',
} as const;

const REGISTER_COPY = {
  headline: 'Create your account',
  subtitle: 'Start your journey with professional AI vision.',
  cta: 'Create account',
  footerPrefix: 'Already have an account?',
  footerAction: 'Sign in',
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
    defaultValues: { fullName: '', email: '', password: '' },
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

  const toggleMode = () => {
    setPasswordVisible(false);
    if (isLogin) {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
    setMode(isLogin ? 'register' : 'login');
  };

  const showForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[
              styles.container,
              isCompact && styles.containerCompact,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <AuthLogoHeader compact={isCompact} />

            <GlassCard compact={isCompact}>
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
                          <Pressable hitSlop={8} onPress={showForgotPassword}>
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
                    name="fullName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <GlassInput
                        label="Full Name"
                        placeholder="John Doe"
                        autoComplete="name"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={registerForm.formState.errors.fullName?.message}
                      />
                    )}
                  />
                  <Controller
                    control={registerForm.control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <GlassInput
                        label="Email address"
                        placeholder="name@company.com"
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
                        placeholder="••••••••"
                        secureTextEntry
                        autoComplete="new-password"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={registerForm.formState.errors.password?.message}
                      />
                    )}
                  />
                  <AuthPrimaryButton
                    label={copy.cta}
                    loading={submitting}
                    onPress={onRegister}
                  />
                </View>
              )}

            </GlassCard>

            <Pressable onPress={toggleMode} style={[styles.footerToggle, isCompact && styles.footerToggleCompact]}>
              <Text style={styles.footerText}>
                {copy.footerPrefix}{' '}
                <Text style={styles.footerLink}>{copy.footerAction}</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  containerCompact: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.marginMobile,
    justifyContent: 'flex-start',
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  cardHeaderCompact: {
    marginBottom: spacing.md,
  },
  headline: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginBottom: spacing.sm,
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
  },
  footerToggle: {
    marginTop: spacing.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  footerToggleCompact: {
    marginTop: spacing.md,
  },
  footerLink: {
    ...typography.labelLg,
    color: colors.primary,
  },
});
