import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
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
import { getApiErrorMessage } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import * as authService from '../services/auth.service';
import { colors, spacing, typography } from '../theme/tokens';

const schema = z
  .object({
    code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
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
  const email = route.params.email.trim().toLowerCase();
  const { width, height } = useWindowDimensions();
  const isCompact = height < 780 || width < 360;
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Missing email',
        text2: 'Go back and request a new reset code.',
      });
      return;
    }

    setSubmitting(true);

    try {
      await authService.resetPassword(email, values.code, values.password);
      setCompleted(true);
      Toast.show({
        type: 'success',
        text1: 'Password updated',
        text2: 'Sign in with your new password.',
      });
      navigation.navigate('Auth');
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

          <View style={styles.stepRow}>
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
          </View>
          <Text style={styles.stepLabel}>Step 2 of 2 · New password</Text>

          <GlassCard compact={isCompact}>
            <View style={[styles.cardHeader, isCompact && styles.cardHeaderCompact]}>
              <Text style={styles.headline}>Enter reset code</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to {email}. It expires in 15 minutes.
              </Text>
            </View>

            <View style={[styles.form, isCompact && styles.formCompact]}>
              <Controller
                control={form.control}
                name="code"
                render={({ field: { onChange, onBlur, value } }) => (
                  <GlassInput
                    label="Reset code"
                    placeholder="000000"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    maxLength={6}
                    editable={!completed && !submitting}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
                    value={value}
                    error={form.formState.errors.code?.message}
                  />
                )}
              />

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
                showArrow={!completed}
                disabled={completed}
                onPress={onSubmit}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}>
              <MaterialIcon name="arrow_back" size={18} color={colors.primary} />
              <Text style={styles.backLabel}>Request a new code</Text>
            </Pressable>
          </GlassCard>
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
    gap: spacing.md,
  },
  containerCompact: {
    paddingVertical: spacing.md,
    justifyContent: 'flex-start',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceContainerHighest,
  },
  stepDotDone: {
    backgroundColor: colors.primaryFixed,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHighest,
  },
  stepLineActive: {
    backgroundColor: colors.primaryFixed,
  },
  stepLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardHeader: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  cardHeaderCompact: {
    marginBottom: spacing.lg,
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 48,
    marginTop: spacing.lg,
  },
  backLabel: {
    ...typography.labelLg,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.88,
  },
});
