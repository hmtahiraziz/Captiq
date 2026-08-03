import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcon, type MaterialIconName } from '../profile/MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface StatusChipProps {
  icon: MaterialIconName;
  label: string;
  variant?: 'success' | 'secondary' | 'primary';
}

const VARIANTS = {
  success: {
    bg: 'rgba(31, 174, 122, 0.1)',
    text: colors.success,
    icon: colors.success,
  },
  secondary: {
    bg: 'rgba(71, 165, 255, 0.1)',
    text: colors.secondary,
    icon: colors.secondary,
  },
  primary: {
    bg: 'rgba(66, 44, 216, 0.1)',
    text: colors.primary,
    icon: colors.primary,
  },
};

export function StatusChip({ icon, label, variant = 'primary' }: StatusChipProps) {
  const palette = VARIANTS[variant];

  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <MaterialIcon name={icon} size={14} color={palette.icon} />
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.labelMd,
    fontWeight: '600',
  },
});
