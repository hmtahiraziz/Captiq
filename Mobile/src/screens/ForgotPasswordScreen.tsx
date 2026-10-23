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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthBackground } from '../components/auth/AuthBackground';
import { AuthLogoHeader } from '../components/auth/AuthLogoHeader';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { GlassCard } from '../components/auth/GlassCard';
import { GlassInput } from '../components/auth/GlassInput';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { getApiErrorMessage } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import * as authService from '../services/auth.service';
import { colors, radius, spacing, typography } from '../theme/tokens';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();
  const isCompact = height < 780 || width < 360;
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
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
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>
          <Text style={styles.stepLabel}>Step 1 of 2 · Send code</Text>

          <GlassCard compact={isCompact}>
            <View style={[styles.cardHeader, isCompact && styles.cardHeaderCompact]}>
              <Text style={styles.headline}>Forgot password?</Text>
              <Text style={styles.subtitle}>
                Enter your email and we&apos;ll send a 6-digit reset code.
              </Text>
            </View>

            <View style={[styles.form, isCompact && styles.formCompact]}>
              <Controller
                control={form.control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <GlassInput
                    label="Email address"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    editable={!sent && !submitting}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
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
              style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}>
              <MaterialIcon name="arrow_back" size={18} color={colors.primary} />
              <Text style={styles.backLabel}>Back to sign in</Text>
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
  successHint: {
    ...typography.labelMd,
    color: colors.tertiary,
    textAlign: 'center',
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
