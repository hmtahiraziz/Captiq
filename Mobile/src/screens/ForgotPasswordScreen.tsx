import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { AuthLogoHeader } from '../components/auth/AuthLogoHeader';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { AuthScreenShell } from '../components/auth/AuthScreenShell';
import { AuthTopBar } from '../components/auth/AuthTopBar';
import { EmailLeadingIcon, GlassInput } from '../components/auth/GlassInput';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../lib/auth/authSchemas';
import { getApiErrorMessage } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import * as authService from '../services/auth.service';
import { colors, spacing, typography } from '../theme/tokens';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);

    try {
      await authService.forgotPassword(values.email);
      setSent(true);
      navigation.navigate('ResetPassword', { email: values.email.trim().toLowerCase() });
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthScreenShell
      topBar={
        <AuthTopBar title="Forgot password" onBack={() => navigation.navigate('Auth')} />
      }>
      <Animated.View entering={FadeInDown.duration(260).springify().damping(18)}>
        <AuthLogoHeader compact />
      </Animated.View>

      <View style={styles.stepCard}>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>
        <Text style={styles.stepLabel}>Step 1 of 2 · Send reset code</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.cardHeader}>
          <Text style={styles.headline}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter the email for your Captiq account and we&apos;ll send a 6-digit code.
          </Text>
        </View>

        <Controller
          control={form.control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              label="Email address"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
              editable={!sent && !submitting}
              leading={<EmailLeadingIcon />}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              onSubmitEditing={onSubmit}
              error={form.formState.errors.email?.message}
            />
          )}
        />

        {sent ? (
          <Text style={styles.successHint}>
            Check your inbox for a 6-digit code. It expires in 15 minutes.
          </Text>
        ) : null}

        <AuthPrimaryButton
          label="Send code"
          loading={submitting}
          success={sent}
          successLabel="Code sent"
          showArrow={!sent}
          disabled={sent}
          onPress={onSubmit}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('Auth')}
        style={({ pressed }) => [styles.switchRow, pressed && styles.switchPressed]}>
        <Text style={styles.switchPrompt}>Remembered it? </Text>
        <Text style={styles.switchAction}>Back to sign in</Text>
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
  form: {
    gap: spacing.lg,
  },
  successHint: {
    ...typography.labelMd,
    color: colors.tertiary,
    textAlign: 'center',
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
