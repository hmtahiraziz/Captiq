import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcon, type MaterialIconName } from './MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface SettingsRowProps {
  icon: MaterialIconName;
  label: string;
  description?: string;
  onPress: () => void;
  showDivider?: boolean;
  destructive?: boolean;
}

export function SettingsRow({
  icon,
  label,
  description,
  onPress,
  showDivider = true,
  destructive = false,
}: SettingsRowProps) {
  const labelColor = destructive ? colors.error : colors.onSurface;
  const iconColor = destructive ? colors.error : colors.primary;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <View style={styles.iconBox}>
          <MaterialIcon name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        {!destructive ? (
          <MaterialIcon name="chevron_right" size={22} color={colors.outlineVariant} />
        ) : null}
      </Pressable>
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
    minHeight: 72,
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  description: {
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
});
