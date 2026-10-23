import { Linking, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { SettingsScreenLayout } from '../../components/profile/SettingsScreenLayout';
import { SettingsSection } from '../../components/profile/SettingsSection';
import { MaterialIcon } from '../../components/profile/MaterialIcon';
import { useScanHistoryActions } from '../../hooks/useScanHistoryActions';
import type { RootStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export function PrivacySettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { totalCount, isClearingAll, requestClearAllScans } = useScanHistoryActions();
  const scanCount = totalCount;

  const openSystemSettings = () => {
    Linking.openSettings().catch(() => {
      Toast.show({ type: 'error', text1: 'Unable to open device settings' });
    });
  };

  return (
    <SettingsScreenLayout title="Privacy" onBack={() => navigation.goBack()}>
      <Text style={styles.intro}>
        Captiq stores scans on your account, hosts images on Cloudinary, and processes them with
        OpenAI. You can clear history or delete your account at any time.
      </Text>

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
              Manage camera and photo library access in system settings
            </Text>
          </View>
          <MaterialIcon name="chevron_right" size={22} color={colors.outlineVariant} />
        </Pressable>
      </SettingsSection>

      <SettingsSection title="Legal">
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('LegalDocument', { document: 'privacy' })}
          style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
          <View style={styles.actionIconBox}>
            <MaterialIcon name="policy" size={22} color={colors.primary} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionLabel}>Privacy policy</Text>
            <Text style={styles.actionDescription}>How Captiq handles your data</Text>
          </View>
          <MaterialIcon name="chevron_right" size={22} color={colors.outlineVariant} />
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('LegalDocument', { document: 'terms' })}
          style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
          <View style={styles.actionIconBox}>
            <MaterialIcon name="gavel" size={22} color={colors.primary} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionLabel}>Terms of use</Text>
            <Text style={styles.actionDescription}>Rules for using Captiq AI</Text>
          </View>
          <MaterialIcon name="chevron_right" size={22} color={colors.outlineVariant} />
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('LegalDocument', { document: 'accountDeletion' })}
          style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
          <View style={styles.actionIconBox}>
            <MaterialIcon name="delete" size={22} color={colors.primary} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.actionLabel}>Account deletion help</Text>
            <Text style={styles.actionDescription}>How to permanently remove your account</Text>
          </View>
          <MaterialIcon name="chevron_right" size={22} color={colors.outlineVariant} />
        </Pressable>
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
  divider: {
    height: spacing.xs,
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
});
