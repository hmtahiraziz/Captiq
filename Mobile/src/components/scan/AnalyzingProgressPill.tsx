import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, glass, radius, spacing, typography } from '../../theme/tokens';

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
          size={22}
          color={icon === 'palette' ? colors.secondary : colors.primary}
        />
      </View>
      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
      {done ? (
        <MaterialIcon name="check_circle" size={22} color={colors.tertiary} />
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
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(245, 242, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 216, 0.2)',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(66, 44, 216, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconSecondary: {
    backgroundColor: 'rgba(71, 165, 255, 0.05)',
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

export const analyzingGlassSheet = StyleSheet.create({
  sheet: {
    backgroundColor: glass.cardBackground,
    borderTopWidth: 1,
    borderTopColor: glass.cardBorder,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(119, 117, 135, 0.2)',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
});
