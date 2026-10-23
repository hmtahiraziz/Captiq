import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar';
import { InfoRow } from '../../components/profile/InfoRow';
import { SettingsScreenLayout } from '../../components/profile/SettingsScreenLayout';
import { SettingsSection } from '../../components/profile/SettingsSection';
import { formatMemberSince } from '../../lib/format/date';
import type { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors, spacing, typography } from '../../theme/tokens';

export function AccountSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);

  const memberSince = user?.createdAt ? formatMemberSince(user.createdAt) : 'Recently joined';

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
        <InfoRow icon="email" label="Email address" value={user?.email ?? '—'} />
        <InfoRow
          icon="person"
          label="Account status"
          value="Active"
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title="Membership">
        <InfoRow icon="manage_accounts" label="Plan" value="Captiq Member" />
        <InfoRow
          icon="history"
          label="Member since"
          value={memberSince}
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title="Security">
        <InfoRow
          icon="lock"
          label="Password"
          value="Protected with secure sign-in"
          showDivider={false}
        />
      </SettingsSection>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Account changes such as password updates and email verification will be
          available in a future release. Your session is secured with encrypted tokens.
        </Text>
      </View>
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
  note: {
    paddingHorizontal: spacing.sm,
  },
  noteText: {
    ...typography.labelMd,
    color: colors.outline,
    lineHeight: 18,
    textAlign: 'center',
  },
});
