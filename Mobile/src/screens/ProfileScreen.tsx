import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { SettingsRow } from '../components/profile/SettingsRow';
import { UtilizationPill } from '../components/profile/UtilizationPill';
import { AppTopBar } from '../components/ui/AppTopBar';
import { TAB_BAR_BOTTOM_PADDING } from '../components/ui/GlassBottomNav';
import { useScans } from '../hooks/useScans';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../stores/useAuthStore';
import { colors, radius, spacing, typography } from '../theme/tokens';

const APP_VERSION = '0.0.1';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data } = useScans();

  const scanCount = data?.items.length ?? 0;
  const storagePercent = Math.min(95, Math.max(10, Math.round((scanCount / 20) * 100) || 65));
  const apiPercent = Math.min(
    90,
    Math.max(8, scanCount === 0 ? 40 : scanCount * 8 + 12),
  );

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          logout().catch(() => undefined);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F5F2FF', '#E3DFFF', colors.background]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.ambientTop} />
      <View style={styles.ambientBottom} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppTopBar
          title="Profile"
          trailingIcon="notifications"
          trailingAccessibilityLabel="Notifications"
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.accountCard}>
              <View style={styles.accountRow}>
                <View style={styles.avatarSlot}>
                  <ProfileAvatar email={user?.email} />
                </View>
                <View style={styles.accountCopy}>
                  <Text style={styles.signedInLabel}>Signed in as</Text>
                  <Text style={styles.email} numberOfLines={1}>
                    {user?.email ?? '—'}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Premium Member</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.utilSection}>
              <Text style={styles.sectionTitle}>App Utilization</Text>
              <View style={styles.utilRow}>
                <UtilizationPill label="Storage" percent={storagePercent} variant="primary" />
                <UtilizationPill label="API Usage" percent={apiPercent} variant="tertiary" />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.menuCard}>
              <SettingsRow
                icon="manage_accounts"
                label="Account"
                onPress={() => navigation.navigate('AccountSettings')}
              />
              <SettingsRow
                icon="shield"
                label="Privacy"
                onPress={() => navigation.navigate('PrivacySettings')}
              />
              <SettingsRow
                icon="info"
                label="About Captiq"
                onPress={() => navigation.navigate('AboutCaptiq')}
                showDivider={false}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              onPress={confirmLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}>
              <MaterialIcon name="logout" size={20} color={colors.error} />
              <Text style={styles.logoutLabel}>Logout</Text>
            </Pressable>
            <Text style={styles.version}>Version {APP_VERSION}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const cardBase = {
  borderRadius: 32,
  backgroundColor: colors.surfaceContainerLowest,
  borderWidth: 1,
  borderColor: 'rgba(200, 196, 216, 0.35)',
} as const;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  ambientTop: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(66, 44, 216, 0.08)',
  },
  ambientBottom: {
    position: 'absolute',
    bottom: 80,
    left: -120,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(71, 165, 255, 0.08)',
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    paddingBottom: TAB_BAR_BOTTOM_PADDING,
    maxWidth: 512,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  accountCard: {
    ...cardBase,
    padding: spacing.xl,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarSlot: {
    paddingRight: spacing.xs,
    paddingBottom: spacing.xs,
  },
  accountCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  signedInLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  email: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(31, 174, 122, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: {
    ...typography.labelMd,
    color: colors.success,
    fontWeight: '600',
  },
  utilSection: {
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.sm,
  },
  utilRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  menuCard: {
    ...cardBase,
    overflow: 'hidden',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  logoutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(186, 26, 26, 0.2)',
  },
  logoutPressed: {
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
    transform: [{ scale: 0.98 }],
  },
  logoutLabel: {
    ...typography.labelLg,
    color: colors.error,
  },
  version: {
    ...typography.labelMd,
    color: colors.outline,
  },
});
