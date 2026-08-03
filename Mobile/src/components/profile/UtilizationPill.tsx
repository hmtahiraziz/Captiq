import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface UtilizationPillProps {
  label: string;
  percent: number;
  variant?: 'primary' | 'tertiary';
}

export function UtilizationPill({
  label,
  percent,
  variant = 'primary',
}: UtilizationPillProps) {
  const fillColors =
    variant === 'primary'
      ? [colors.primary, colors.secondaryContainer]
      : [colors.tertiaryContainer, colors.tertiaryFixedDim];

  const labelColor = variant === 'primary' ? colors.primary : colors.tertiary;
  const clamped = Math.min(100, Math.max(0, percent));
  const badgeTopPercent = Math.max(12, Math.min(58, 100 - clamped - 8));

  return (
    <View style={styles.card}>
      <View style={styles.track}>
        <View style={styles.stripes} />
        <LinearGradient
          colors={fillColors}
          style={[styles.fill, { height: `${clamped}%` }]}
        />
        <View style={[styles.percentBadge, { top: `${badgeTopPercent}%` as `${number}%` }]}>
          <Text style={[styles.percentText, { color: labelColor }]}>{clamped}%</Text>
          <View style={[styles.stem, { backgroundColor: labelColor }]} />
        </View>
        <View style={styles.labelWrap}>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    height: 224,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 216, 0.35)',
    padding: spacing.md,
    overflow: 'hidden',
  },
  track: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceContainer,
  },
  stripes: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
    backgroundColor: colors.surfaceVariant,
  },
  fill: {
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  percentBadge: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 216, 0.4)',
    zIndex: 1,
  },
  percentText: {
    ...typography.labelMd,
    fontWeight: '700',
  },
  stem: {
    width: 2,
    height: 10,
    marginTop: 2,
  },
  labelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    zIndex: 2,
  },
  label: {
    ...typography.labelLg,
    color: colors.onPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
