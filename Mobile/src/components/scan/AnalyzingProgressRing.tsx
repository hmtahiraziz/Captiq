import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 192;
const STROKE_WIDTH = 6;
const TRACK_STROKE = 4;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface AnalyzingProgressRingProps {
  percent: number;
}

export function AnalyzingProgressRing({ percent }: AnalyzingProgressRingProps) {
  const progress = useSharedValue(0);
  const clamped = Math.min(99, Math.max(0, percent));

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 800 });
  }, [clamped, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value / 100),
  }));

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.surfaceContainerHigh}
          strokeWidth={TRACK_STROKE}
          fill="transparent"
        />
        <AnimatedCircle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.primaryContainer}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={styles.percent}>{Math.floor(clamped)}%</Text>
        <Text style={styles.caption}>PROCESSING</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  labelWrap: {
    alignItems: 'center',
    gap: 2,
  },
  percent: {
    ...typography.displayLg,
    color: colors.primary,
    fontSize: 48,
    lineHeight: 56,
  },
  caption: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
});
