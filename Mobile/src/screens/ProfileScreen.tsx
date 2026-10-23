import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { QuotaMeter } from '../components/profile/QuotaMeter';
import { SettingsRow } from '../components/profile/SettingsRow';
import { APP_HEADER_VERSION, AppTopBar } from '../components/ui/AppTopBar';
import { TAB_BAR_BOTTOM_PADDING } from '../components/ui/GlassBottomNav';
import { useQuota } from '../hooks/useQuota';
import { useScans } from '../hooks/useScans';
import type { RootStackParamList } from '../navigation/types';
import { useConfirmDialog } from '../providers/ConfirmDialogProvider';
import { useAuthStore } from '../stores/useAuthStore';
import { colors, spacing, typography } from '../theme/tokens';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { confirm } = useConfirmDialog();
  const { data, refetch: refetchScans } = useScans();
  const { data: quota, refetch: refetchQuota, isFetching: quotaFetching } = useQuota();

  const scanCount = data?.items.length ?? 0;
  const isVerified = Boolean(user?.consentedAt || user?.consentVersion);

  useFocusEffect(
    useCallback(() => {
      void refetchQuota();
      void refetchScans();
    }, [refetchQuota, refetchScans]),
  );

  const confirmLogout = async () => {
    const confirmed = await confirm({
      title: 'Log out',
      message: 'Are you sure you want to log out?',
      confirmLabel: 'Log out',
      cancelLabel: 'Cancel',
      destructive: true,
    });

    if (confirmed) {
      logout().catch(() => undefined);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#EEF2FF', colors.surfaceContainerLow, '#E8F0FE']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppTopBar showTrailing={false} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <ProfileAvatar email={user?.email} size={64} verified={isVerified} />
            <View style={styles.accountCopy}>
              <Text style={styles.signedInLabel}>Signed in as</Text>
              <Text style={styles.email} numberOfLines={1}>
                {user?.email ?? '—'}
              </Text>
              <View style={styles.scanMetaRow}>
                <MaterialIcon name="history" size={14} color={colors.primary} />
                <Text style={styles.scanMeta}>
                  {scanCount} scan{scanCount === 1 ? '' : 's'} in history
                </Text>
              </View>
            </View>
          </View>

          <QuotaMeter quota={quota} refreshing={quotaFetching} />

          <View style={styles.menuCard}>
            <SettingsRow
              icon="manage_accounts"
              iconTone="primary"
              label="Account"
              description="Email and account deletion"
              onPress={() => navigation.navigate('AccountSettings')}
            />
            <SettingsRow
              icon="shield"
              iconTone="violet"
              label="Privacy"
              description="History, permissions, and legal"
              onPress={() => navigation.navigate('PrivacySettings')}
            />
            <SettingsRow
              icon="info"
              iconTone="blue"
              label="About Captiq"
              description="App info and support"
              onPress={() => navigation.navigate('AboutCaptiq')}
              showDivider={false}
            />
          </View>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              onPress={confirmLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}>
              <MaterialIcon name="logout" size={18} color={colors.error} />
              <Text style={styles.logoutLabel}>Log out</Text>
            </Pressable>
            <Text style={styles.version}>Version {APP_HEADER_VERSION}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_BOTTOM_PADDING,
    maxWidth: 512,
    alignSelf: 'center',
    width: '100%',
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.lg,
  },
  accountCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  signedInLabel: {
    ...typography.labelMd,
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    fontSize: 11,
  },
  email: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 15,
  },
  scanMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  scanMeta: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  logoutPressed: {
    backgroundColor: 'rgba(186, 26, 26, 0.08)',
  },
  logoutLabel: {
    ...typography.labelLg,
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
  version: {
    ...typography.labelMd,
    color: colors.outline,
  },
});
