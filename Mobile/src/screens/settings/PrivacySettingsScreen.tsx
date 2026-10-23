import { Linking, Pressable, StyleSheet, Switch, Text, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { SettingsScreenLayout } from '../../components/profile/SettingsScreenLayout';
import { SettingsSection } from '../../components/profile/SettingsSection';
import { MaterialIcon } from '../../components/profile/MaterialIcon';
import { useScanHistoryActions } from '../../hooks/useScanHistoryActions';
import type { RootStackParamList } from '../../navigation/types';
import { usePrivacyStore } from '../../stores/usePrivacyStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';

function PrivacyToggleRow({
  label,
  description,
  value,
  onValueChange,
  showDivider = true,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  showDivider?: boolean;
}) {
  return (
    <>
      <View style={styles.toggleRow}>
        <View style={styles.toggleCopy}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
          thumbColor={value ? colors.primary : colors.surfaceContainerLowest}
        />
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

export function PrivacySettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { totalCount, isClearingAll, requestClearAllScans } = useScanHistoryActions();

  const saveScanHistory = usePrivacyStore((s) => s.saveScanHistory);
  const analyticsEnabled = usePrivacyStore((s) => s.analyticsEnabled);
  const setSaveScanHistory = usePrivacyStore((s) => s.setSaveScanHistory);
  const setAnalyticsEnabled = usePrivacyStore((s) => s.setAnalyticsEnabled);

  const scanCount = totalCount;

  const openSystemSettings = () => {
    Linking.openSettings().catch(() => {
      Toast.show({ type: 'error', text1: 'Unable to open device settings' });
    });
  };

  return (
    <SettingsScreenLayout title="Privacy" onBack={() => navigation.goBack()}>
      <Text style={styles.intro}>
        Control how Captiq stores your data and uses device permissions.
      </Text>

      <SettingsSection title="Your data">
        <PrivacyToggleRow
          label="Save scan history"
          description="Keep past scans in your History tab on this device account"
          value={saveScanHistory}
          onValueChange={setSaveScanHistory}
        />
        <PrivacyToggleRow
          label="Product analytics"
          description="Help improve Captiq with anonymous usage insights"
          value={analyticsEnabled}
          onValueChange={setAnalyticsEnabled}
          showDivider={false}
        />
      </SettingsSection>

      <SettingsSection title="History">
        <Pressable
          accessibilityRole="button"
          disabled={isClearingAll || scanCount === 0}
          onPress={requestClearAllScans}
          style={({ pressed }) => [
            styles.actionRow,
            pressed && styles.actionRowPressed,
            (isClearingAll || scanCount === 0) && styles.actionRowDisabled,
          ]}>
          <View style={styles.actionIconBox}>
            {isClearingAll ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <MaterialIcon name="delete" size={22} color={colors.error} />
            )}
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionLabel}>Clear scan history</Text>
            <Text style={styles.actionDescription}>
              {scanCount === 0
                ? 'No scans stored'
                : `${scanCount} scan${scanCount === 1 ? '' : 's'} will be removed`}
            </Text>
          </View>
        </Pressable>
      </SettingsSection>

      <SettingsSection title="Permissions">
        <Pressable
          accessibilityRole="button"
          onPress={openSystemSettings}
          style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
          <View style={styles.actionIconBox}>
            <MaterialIcon name="settings" size={22} color={colors.primary} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionLabel}>Device permissions</Text>
            <Text style={styles.actionDescription}>
              Manage camera and notification access in system settings
            </Text>
          </View>
          <MaterialIcon name="chevron_right" size={22} color={colors.outlineVariant} />
        </Pressable>
      </SettingsSection>

      <SettingsSection title="Legal">
        <View style={styles.legalBlock}>
          <View style={styles.legalRow}>
            <MaterialIcon name="policy" size={20} color={colors.primary} />
            <Text style={styles.legalText}>
              Images you scan are processed by AI to generate descriptions. Scan data is
              associated with your account and stored according to our retention policy.
            </Text>
          </View>
          <View style={styles.legalDivider} />
          <View style={styles.legalRow}>
            <MaterialIcon name="gavel" size={20} color={colors.primary} />
            <Text style={styles.legalText}>
              By using Captiq you agree to responsible use of AI-generated content. Do not
              scan sensitive personal documents unless you accept the associated risks.
            </Text>
          </View>
        </View>
      </SettingsSection>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  toggleDescription: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  divider: {
    marginHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  actionRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionRowDisabled: {
    opacity: 0.55,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  actionDescription: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  legalBlock: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  legalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  legalText: {
    flex: 1,
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  legalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    opacity: 0.4,
  },
});
