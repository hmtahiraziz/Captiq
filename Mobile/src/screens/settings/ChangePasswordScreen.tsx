import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';
import {
  GlassInput,
  PasswordVisibilityToggle,
} from '../../components/auth/GlassInput';
import { SettingsScreenLayout } from '../../components/profile/SettingsScreenLayout';
import {
  PASSWORD_MAX_LENGTH,
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../../lib/auth/authSchemas';
import type { RootStackParamList } from '../../navigation/types';
import * as authService from '../../services/auth.service';
import { getApiErrorMessage, useAuthStore } from '../../stores/useAuthStore';
import { colors, spacing, typography } from '../../theme/tokens';

export function ChangePasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const invalidateSession = useAuthStore((s) => s.invalidateSession);
  const [submitting, setSubmitting] = useState(false);
  const [currentVisible, setCurrentVisible] = useState(false);
  const [newVisible, setNewVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);

    try {
      const result = await authService.changePassword(
        values.currentPassword,
        values.newPassword,
      );
      Toast.show({
        type: 'success',
        text1: 'Password updated',
        text2: result.message || 'Sign in again with your new password.',
      });
      // Backend revokes all refresh tokens on password change.
      await invalidateSession();
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <SettingsScreenLayout title="Change password" onBack={() => navigation.goBack()}>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Update your password</Text>
        <Text style={styles.introCopy}>
          Choose a new password of 8–72 characters. You will need to sign in again after
          saving.
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              label="Current password"
              placeholder="••••••••"
              secureTextEntry={!currentVisible}
              autoComplete="password"
              textContentType="password"
              maxLength={PASSWORD_MAX_LENGTH}
              editable={!submitting}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={form.formState.errors.currentPassword?.message}
              trailing={
                <PasswordVisibilityToggle
                  visible={currentVisible}
                  onToggle={() => setCurrentVisible((v) => !v)}
                />
              }
            />
          )}
        />

        <Controller
          control={form.control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <GlassInput
              label="New password"
              placeholder="At least 8 characters"
              secureTextEntry={!newVisible}
              autoComplete="new-password"
              textContentType="newPassword"
              maxLength={PASSWORD_MAX_LENGTH}
              editable={!submitting}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={form.formState.errors.newPassword?.message}
              trailing={
                <PasswordVisibilityToggle
                  visible={newVisible}
                  onToggle={() => setNewVisible((v) => !v)}
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
              label="Confirm new password"
              placeholder="Re-enter your new password"
              secureTextEntry={!confirmVisible}
              autoComplete="new-password"
              textContentType="newPassword"
              maxLength={PASSWORD_MAX_LENGTH}
              editable={!submitting}
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
          showArrow
          onPress={onSubmit}
        />
      </View>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: spacing.xs,
  },
  introTitle: {
    ...typography.headlineSm,
    color: colors.primary,
    fontWeight: '700',
  },
  introCopy: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: spacing.lg,
  },
});
