import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface AnalyzingStepRowProps {
  icon: 'visibility' | 'palette';
  title: string;
  subtitle: string;
  done: boolean;
}

export function AnalyzingStepRow({
  icon,
  title,
  subtitle,
  done,
}: AnalyzingStepRowProps) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepIcon, icon === 'palette' && styles.stepIconSecondary]}>
        <MaterialIcon
          name={icon}
          size={20}
          color={icon === 'palette' ? colors.secondary : colors.primary}
        />
      </View>
      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
      {done ? (
        <MaterialIcon name="check_circle" size={20} color={colors.tertiary} filled />
      ) : (
        <View style={styles.pendingDot} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconSecondary: {
    backgroundColor: colors.secondaryFixed,
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  stepSubtitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant,
  },
});
