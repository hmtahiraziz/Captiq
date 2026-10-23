import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { CaptiqLogo } from '../../components/branding/CaptiqLogo';
import { MaterialIcon } from '../../components/profile/MaterialIcon';
import { SettingsScreenLayout } from '../../components/profile/SettingsScreenLayout';
import { SettingsSection } from '../../components/profile/SettingsSection';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

const APP_VERSION = '0.0.1';
const SUPPORT_EMAIL = 'support@captiq.ai';

function Bullet({ children }: { children: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: 'support' | 'forum' | 'email';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}>
      <View style={styles.linkIconBox}>
        <MaterialIcon name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.linkLabel}>{label}</Text>
      <MaterialIcon name="chevron_right" size={20} color={colors.outlineVariant} />
    </Pressable>
  );
}

export function AboutCaptiqScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Captiq%20Support`).catch(() => {
      Toast.show({ type: 'error', text1: 'Unable to open email app' });
    });
  };

  return (
    <SettingsScreenLayout title="About Captiq" onBack={() => navigation.goBack()}>
      <View style={styles.brandHero}>
        <View style={styles.logoShell}>
          <CaptiqLogo size={56} />
        </View>
        <Text style={styles.brandName}>Captiq AI</Text>
        <Text style={styles.tagline}>AI vision for everything you see</Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </View>

      <SettingsSection title="What Captiq does">
        <View style={styles.copyBlock}>
          <Bullet>Point your camera at any scene, object, or environment</Bullet>
          <Bullet>Receive rich AI-generated image descriptions in seconds</Bullet>
          <Bullet>Ask follow-up questions to explore details and context</Bullet>
        </View>
      </SettingsSection>

      <SettingsSection title="Technology">
        <View style={styles.copyBlock}>
          <View style={styles.techRow}>
            <MaterialIcon name="auto_awesome" size={20} color={colors.primary} filled />
            <Text style={styles.techText}>
              Powered by advanced vision models including GPT-4o mini for fast, accurate
              visual understanding.
            </Text>
          </View>
          <View style={styles.techRow}>
            <MaterialIcon name="shield" size={20} color={colors.primary} />
            <Text style={styles.techText}>
              Secure cloud processing with encrypted authentication and account-scoped scan
              storage.
            </Text>
          </View>
        </View>
      </SettingsSection>

      <SettingsSection title="Support">
        <LinkRow icon="email" label={`Email ${SUPPORT_EMAIL}`} onPress={openEmail} />
        <View style={styles.linkDivider} />
        <LinkRow
          icon="support"
          label="Help & feedback"
          onPress={openEmail}
        />
      </SettingsSection>

      <Text style={styles.footer}>
        Captiq AI · Vision System{'\n'}
        © {new Date().getFullYear()} Captiq. All rights reserved.
      </Text>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  brandHero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  logoShell: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: '700',
  },
  tagline: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  version: {
    ...typography.labelMd,
    color: colors.outline,
    marginTop: spacing.xs,
  },
  copyBlock: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  techRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  techText: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  linkRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    flex: 1,
    ...typography.labelLg,
    color: colors.onSurface,
  },
  linkDivider: {
    marginHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  footer: {
    ...typography.labelMd,
    color: colors.outline,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
