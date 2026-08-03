import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcon, type MaterialIconName } from './MaterialIcon';
import { colors, spacing, typography } from '../../theme/tokens';

interface InfoRowProps {
  icon: MaterialIconName;
  label: string;
  value: string;
  showDivider?: boolean;
}

export function InfoRow({ icon, label, value, showDivider = true }: InfoRowProps) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <MaterialIcon name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  value: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  divider: {
    marginHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
});
