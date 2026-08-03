import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
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
import { getApiErrorMessage } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import * as authService from '../services/auth.service';
import { colors, spacing, typography } from '../theme/tokens';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof schema>;

export function ResetPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
  const { width, height } = useWindowDimensions();
  const isCompact = height < 780 || width < 360;
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const token = route.params?.token?.trim();

    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Invalid reset link',
        text2: 'Request a new password reset email and try again.',
      });
      return;
    }

    setSubmitting(true);

    try {
      await authService.resetPassword(token, values.password);
      setCompleted(true);
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
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

            <GlassCard compact={isCompact} style={styles.card}>
              <View style={[styles.cardHeader, isCompact && styles.cardHeaderCompact]}>
                <Text style={styles.headline}>Set new password</Text>
                <Text style={styles.subtitle}>
                  Choose a strong password for your Captiq AI account.
                </Text>
              </View>

              <View style={[styles.form, isCompact && styles.formCompact]}>
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <GlassInput
                      label="New password"
                      placeholder="••••••••"
                      secureTextEntry={!passwordVisible}
                      autoComplete="new-password"
                      editable={!completed && !submitting}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={form.formState.errors.password?.message}
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
                  control={form.control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <GlassInput
                      label="Confirm password"
                      placeholder="••••••••"
                      secureTextEntry={!confirmVisible}
                      autoComplete="new-password"
                      editable={!completed && !submitting}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={form.formState.errors.confirmPassword?.message}
                      trailing={
                        <PasswordVisibilityToggle
                          visible={confirmVisible}
                          onToggle={() => setConfirmVisible((v) => !v)}
                        />
                      }
                    />
                  )}
                />

                <AuthPrimaryButton
                  label="Update password"
                  loading={submitting}
                  success={completed}
                  successLabel="Password updated"
                  disabled={completed}
                  onPress={
                    completed
                      ? () => navigation.navigate('Auth')
                      : onSubmit
                  }
                />
              </View>

              <View style={styles.footerDivider} />

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Auth')}
                style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}>
                <MaterialIcon name="arrow_back" size={18} color={colors.primary} />
                <Text style={styles.backLabel}>Back to Login</Text>
              </Pressable>
            </GlassCard>

            {!isCompact ? (
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, styles.progressFillWide]} />
                </View>
                <Text style={styles.progressLabel}>Reset Security Protocol 3/3</Text>
              </View>
            ) : null}
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
    justifyContent: 'flex-start',
  },
  card: {
    borderRadius: 32,
  },
  cardHeader: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  cardHeaderCompact: {
    marginBottom: spacing.lg,
  },
  headline: {
    ...typography.headlineLg,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  formCompact: {
    gap: spacing.md,
  },
  footerDivider: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: `${colors.outlineVariant}4D`,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
  },
  backLabel: {
    ...typography.labelLg,
    color: colors.primary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
    opacity: 0.4,
  },
  progressTrack: {
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: `${colors.outlineVariant}4D`,
    overflow: 'hidden',
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  progressFillWide: {
    width: '100%',
  },
  progressLabel: {
    ...typography.labelMd,
    color: colors.outline,
  },
  pressed: {
    opacity: 0.88,
  },
});
