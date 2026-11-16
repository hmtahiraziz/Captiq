import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { AuthLogoHeader } from '../components/auth/AuthLogoHeader';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { AuthScreenShell } from '../components/auth/AuthScreenShell';
import { AuthTopBar } from '../components/auth/AuthTopBar';
import {
  GlassInput,
  LockLeadingIcon,
  PasswordVisibilityToggle,
} from '../components/auth/GlassInput';
import {
  PASSWORD_MAX_LENGTH,
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../lib/auth/authSchemas';
import { getApiErrorMessage } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import * as authService from '../services/auth.service';
import { colors, spacing, typography } from '../theme/tokens';

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

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
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
    <AuthScreenShell
      topBar={
        <AuthTopBar
          title="New password"
          onBack={() => navigation.navigate('ForgotPassword')}
        />
      }>
      <Animated.View entering={FadeInDown.duration(260).springify().damping(18)}>
        <AuthLogoHeader compact />
      </Animated.View>

      <View style={styles.stepCard}>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepLine, styles.stepLineActive]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
        </View>
        <Text style={styles.stepLabel}>Step 2 of 2 · Choose a new password</Text>
      </View>

      <View style={[styles.form, isCompact && styles.formCompact]}>
        <View style={styles.cardHeader}>
          <Text style={styles.headline}>Enter reset code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>. It expires in 15
            minutes.
          </Text>
        </View>

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
              leading={<LockLeadingIcon />}
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
              placeholder="At least 8 characters"
              secureTextEntry={!passwordVisible}
              autoComplete="new-password"
              textContentType="newPassword"
              maxLength={PASSWORD_MAX_LENGTH}
              editable={!completed && !submitting}
              leading={<LockLeadingIcon />}
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
              placeholder="Re-enter your password"
              secureTextEntry={!confirmVisible}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              maxLength={PASSWORD_MAX_LENGTH}
              editable={!completed && !submitting}
              leading={<LockLeadingIcon />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              onSubmitEditing={onSubmit}
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
        style={({ pressed }) => [styles.switchRow, pressed && styles.switchPressed]}>
        <Text style={styles.switchPrompt}>Didn&apos;t get a code? </Text>
        <Text style={styles.switchAction}>Request a new one</Text>
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    alignItems: 'center',
    gap: spacing.sm,
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
    fontWeight: '600',
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
  emailHighlight: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  form: {
    gap: spacing.lg,
  },
  formCompact: {
    gap: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 44,
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
