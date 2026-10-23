import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';

const SPARKLES = [
  { topPct: 0.12, leftPct: 0.18, size: 3, delay: 0 },
  { topPct: 0.22, leftPct: 0.78, size: 2.5, delay: 400 },
  { topPct: 0.38, leftPct: 0.08, size: 2, delay: 800 },
  { topPct: 0.55, leftPct: 0.88, size: 3.5, delay: 200 },
  { topPct: 0.72, leftPct: 0.24, size: 2.5, delay: 600 },
  { topPct: 0.18, leftPct: 0.52, size: 2, delay: 1000 },
  { topPct: 0.64, leftPct: 0.68, size: 3, delay: 300 },
  { topPct: 0.82, leftPct: 0.42, size: 2, delay: 700 },
  { topPct: 0.07, leftPct: 0.34, size: 3.2, delay: 500 },
  { topPct: 0.47, leftPct: 0.26, size: 2.8, delay: 900 },
  { topPct: 0.89, leftPct: 0.67, size: 3.8, delay: 150 },
  { topPct: 0.91, leftPct: 0.10, size: 4.2, delay: 1100 },
  { topPct: 0.02, leftPct: 0.60, size: 2.2, delay: 450 },
  { topPct: 0.19, leftPct: 0.36, size: 4, delay: 850 },
  { topPct: 0.73, leftPct: 0.04, size: 3.4, delay: 250 },
] as const;

function Sparkle({
  topPct,
  leftPct,
  size,
  delay,
  screenWidth,
  screenHeight,
}: {
  topPct: number;
  leftPct: number;
  size: number;
  delay: number;
  screenWidth: number;
  screenHeight: number;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.85, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.sparkle,
        animatedStyle,
        {
          top: topPct * screenHeight,
          left: leftPct * screenWidth,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
}

/** Shared Stitch "Visionary Glass" background for splash + auth */
export function VisionaryGlassBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.base} />

      {/* Stitch splash: linear 135deg lavender → mint */}
      <LinearGradient
        colors={[colors.primaryFixed, colors.primaryFixedDim, colors.tertiaryFixed]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Stitch splash: radial lavender wash */}
      <LinearGradient
        colors={['rgba(227, 223, 255, 0.65)', 'rgba(245, 242, 255, 0.35)', 'rgba(252, 248, 255, 0)']}
        start={{ x: 0.1, y: 0.15 }}
        end={{ x: 0.7, y: 0.65 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Stitch auth: top-left lavender radial */}
      <LinearGradient
        colors={['#F5F2FF', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.55, y: 0.45 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Stitch auth: bottom-right mint radial */}
      <LinearGradient
        colors={['#E8FFF6', 'rgba(255, 255, 255, 0)']}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.45, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      {SPARKLES.map((sparkle, index) => (
        <Sparkle
          key={index}
          {...sparkle}
          screenWidth={width}
          screenHeight={height}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  sparkle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
