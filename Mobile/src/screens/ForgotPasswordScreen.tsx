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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthBackground } from '../components/auth/AuthBackground';
import { AuthLogoHeader } from '../components/auth/AuthLogoHeader';
import { AuthPrimaryButton } from '../components/auth/AuthPrimaryButton';
import { AuthRoundedInput, MailLeadingIcon } from '../components/auth/AuthRoundedInput';
import { GlassCard } from '../components/auth/GlassCard';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { getApiErrorMessage } from '../stores/useAuthStore';
import type { RootStackParamList } from '../navigation/types';
import * as authService from '../services/auth.service';
import { colors, spacing, typography } from '../theme/tokens';

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
  const [emailFocused, setEmailFocused] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);

    try {
      await authService.forgotPassword(values.email);
      setSent(true);
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
                <Text style={styles.headline}>Forgot Password?</Text>
                <Text style={styles.subtitle}>Enter your email to reset your password.</Text>
              </View>

              <View style={[styles.form, isCompact && styles.formCompact]}>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AuthRoundedInput
                      label="Email address"
                      placeholder="name@company.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!sent && !submitting}
                      onBlur={() => {
                        setEmailFocused(false);
                        onBlur();
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onChangeText={onChange}
                      value={value}
                      error={form.formState.errors.email?.message}
                      leadingIcon={<MailLeadingIcon focused={emailFocused} />}
                    />
                  )}
                />

                {sent ? (
                  <Text style={styles.successHint}>
                    Check your inbox for a secure reset link. It expires in 1 hour.
                  </Text>
                ) : null}

                <AuthPrimaryButton
                  label="Send Link"
                  loading={submitting}
                  success={sent}
                  successLabel="Link Sent!"
                  showArrow={!sent}
                  disabled={sent}
                  onPress={onSubmit}
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
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.progressLabel}>Reset Security Protocol 1/3</Text>
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
  successHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: -spacing.sm,
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
  progressLabel: {
    ...typography.labelMd,
    color: colors.outline,
  },
  pressed: {
    opacity: 0.88,
  },
});
