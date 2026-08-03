import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface MetricBarProps {
  label: string;
  percent: number;
  variant: 'primary' | 'tertiary' | 'neutral';
}

const FILL_COLORS = {
  primary: colors.primary,
  tertiary: colors.tertiary,
  neutral: colors.onSurfaceVariant,
};

const PERCENT_COLORS = {
  primary: colors.primary,
  tertiary: colors.tertiary,
  neutral: colors.onSurfaceVariant,
};

function MetricBar({ label, percent, variant }: MetricBarProps) {
  const progress = useSharedValue(0);
  const clamped = Math.min(100, Math.max(0, percent));

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 1000 });
  }, [clamped, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.barWrap}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: FILL_COLORS[variant] },
            fillStyle,
          ]}
        />
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <Text style={[styles.percent, { color: PERCENT_COLORS[variant] }]}>
          {clamped}%
        </Text>
      </View>
    </View>
  );
}

function deriveMetrics(caption: string) {
  const len = caption.length;
  const clarity = Math.min(98, Math.max(45, 60 + Math.floor(len / 40)));
  const confidence = Math.min(95, Math.max(40, 55 + Math.floor(len / 55)));
  const density = Math.min(90, Math.max(30, 35 + Math.floor(len / 25)));
  return { clarity, confidence, density };
}

interface VisionMetricBarsProps {
  caption: string;
}

export function VisionMetricBars({ caption }: VisionMetricBarsProps) {
  const metrics = useRef(deriveMetrics(caption)).current;

  return (
    <View style={styles.row}>
      <MetricBar label="Clarity" percent={metrics.clarity} variant="primary" />
      <MetricBar label="Confidence" percent={metrics.confidence} variant="tertiary" />
      <MetricBar label="Density" percent={metrics.density} variant="neutral" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.gutter,
    marginTop: spacing.xl,
  },
  barWrap: {
    flex: 1,
    gap: spacing.sm,
  },
  track: {
    height: 6,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
    marginRight: spacing.xs,
  },
  percent: {
    ...typography.labelMd,
    fontWeight: '700',
    flexShrink: 0,
  },
});
