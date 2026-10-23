import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcon, type MaterialIconName } from './MaterialIcon';
import { colors, spacing, typography } from '../../theme/tokens';

interface SettingsRowProps {
  icon: MaterialIconName;
  label: string;
  description?: string;
  onPress: () => void;
  showDivider?: boolean;
  destructive?: boolean;
  iconTone?: 'primary' | 'violet' | 'sky' | 'blue';
  standalone?: boolean;
}

const ICON_TONES = {
  primary: {
    bg: colors.primaryFixed,
    fg: colors.primary,
  },
  violet: {
    bg: '#F5F3FF',
    fg: '#7C3AED',
  },
  sky: {
    bg: '#F0F9FF',
    fg: colors.secondary,
  },
  blue: {
    bg: '#EFF6FF',
    fg: '#2563EB',
  },
} as const;

export function SettingsRow({
  icon,
  label,
  description,
  onPress,
  showDivider = true,
  destructive = false,
  iconTone = 'primary',
  standalone = false,
}: SettingsRowProps) {
  const labelColor = destructive ? colors.error : colors.onSurface;
  const tone = ICON_TONES[iconTone];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          standalone && styles.rowStandalone,
          pressed && styles.rowPressed,
        ]}>
        <View style={[styles.iconBox, { backgroundColor: tone.bg }]}>
          <MaterialIcon
            name={icon}
            size={22}
            color={destructive ? colors.error : tone.fg}
          />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        {!destructive ? (
          <MaterialIcon name="chevron_right" size={18} color={colors.outlineVariant} />
        ) : null}
      </Pressable>
      {showDivider && !standalone ? <View style={styles.divider} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    minHeight: 68,
  },
  rowStandalone: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  rowPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryFixed,
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
    fontWeight: '700',
    fontSize: 14,
  },
  description: {
    ...typography.labelMd,
    color: colors.outline,
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceContainer,
    marginLeft: 76,
    marginRight: spacing.lg,
  },
});
