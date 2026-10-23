import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar';
import { InfoRow } from '../../components/profile/InfoRow';
import { SettingsScreenLayout } from '../../components/profile/SettingsScreenLayout';
import { SettingsSection } from '../../components/profile/SettingsSection';
import { formatMemberSince } from '../../lib/format/date';
import type { RootStackParamList } from '../../navigation/types';
import { useConfirmDialog } from '../../providers/ConfirmDialogProvider';
import { getApiErrorMessage, useAuthStore } from '../../stores/useAuthStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export function AccountSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const { confirm } = useConfirmDialog();
  const [deleting, setDeleting] = useState(false);

  const memberSince = user?.createdAt ? formatMemberSince(user.createdAt) : 'Recently joined';

  const confirmDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete account permanently?',
      message:
        'This removes your account, scans, messages, and cloud images. This cannot be undone.',
      confirmLabel: 'Delete forever',
      cancelLabel: 'Cancel',
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      await deleteAccount();
      Toast.show({ type: 'success', text1: 'Account deleted' });
    } catch (error) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SettingsScreenLayout title="Account" onBack={() => navigation.goBack()}>
      <View style={styles.hero}>
        <ProfileAvatar email={user?.email} />
        <Text style={styles.heroEmail} numberOfLines={1}>
          {user?.email ?? '—'}
        </Text>
        <Text style={styles.heroSubtitle}>Manage your Captiq account details</Text>
      </View>

      <SettingsSection title="Profile">
        <InfoRow
          icon="email"
          label="Email address"
          value={user?.email ?? '—'}
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title="Membership">
        <InfoRow
          icon="history"
          label="Member since"
          value={memberSince}
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title="Delete account">
        <View style={styles.deleteBlock}>
          <Text style={styles.deleteCopy}>
            Permanently remove your Captiq account, scans, and cloud images.
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={deleting}
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deletePressed,
              deleting && styles.deleteDisabled,
            ]}>
            {deleting ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={styles.deleteLabel}>Delete my account</Text>
            )}
          </Pressable>
        </View>
      </SettingsSection>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  heroEmail: {
    ...typography.headlineSm,
    color: colors.onSurface,
    maxWidth: '100%',
  },
  heroSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  deleteBlock: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  deleteCopy: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(186, 26, 26, 0.12)',
  },
  deletePressed: {
    opacity: 0.85,
  },
  deleteDisabled: {
    opacity: 0.6,
  },
  deleteLabel: {
    ...typography.labelLg,
    color: colors.error,
    fontWeight: '600',
  },
});
