import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, spacing, typography } from '../../theme/tokens';

const CORNER_ARM = 26;
const CORNER_INSET = 22;
const CORNER_STROKE = 2.5;
const BRACKET_COLOR = 'rgba(71, 165, 255, 0.9)';

type CornerPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

function CornerBracket({ position }: { position: CornerPosition }) {
  const horizontalStyle =
    position === 'topLeft' || position === 'bottomLeft'
      ? { left: 0 }
      : { right: 0 };

  const verticalStyle =
    position === 'topLeft' || position === 'topRight'
      ? { top: 0 }
      : { bottom: 0 };

  const horizontalPosition =
    position === 'topLeft' || position === 'topRight'
      ? { top: 0 }
      : { bottom: 0 };

  return (
    <View
      style={[
        styles.corner,
        position === 'topLeft' && styles.cornerTopLeft,
        position === 'topRight' && styles.cornerTopRight,
        position === 'bottomLeft' && styles.cornerBottomLeft,
        position === 'bottomRight' && styles.cornerBottomRight,
      ]}>
      <View style={[styles.cornerHorizontal, horizontalStyle, horizontalPosition]} />
      <View style={[styles.cornerVertical, verticalStyle]} />
    </View>
  );
}

export function ScanViewfinderWidget() {
  const isFocused = useIsFocused();
  const fadeIn = useSharedValue(0);
  const scanLine = useSharedValue(0.08);
  const cornerPulse = useSharedValue(0.55);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    fadeIn.value = withTiming(isFocused ? 1 : 0, { duration: 400 });
  }, [fadeIn, isFocused]);

  useEffect(() => {
    scanLine.value = withRepeat(
      withTiming(0.88, { duration: 3500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    cornerPulse.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    iconScale.value = withRepeat(
      withTiming(1.05, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [cornerPulse, iconScale, scanLine]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLine.value * 100}%`,
  }));

  const bracketStyle = useAnimatedStyle(() => ({
    opacity: cornerPulse.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Animated.View style={[styles.root, containerStyle]} pointerEvents="none">
      <LinearGradient
        colors={['#0D1117', '#141824', '#1a1f35']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={['rgba(91, 76, 240, 0.18)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={styles.accentBlobTop}
      />
      <LinearGradient
        colors={['transparent', 'rgba(71, 165, 255, 0.12)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.accentBlobBottom}
      />

      <View style={styles.grid}>
        {[0.25, 0.5, 0.75].map((top) => (
          <View key={top} style={[styles.gridLine, { top: `${top * 100}%` }]} />
        ))}
      </View>

      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.45)']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glassRim} />

      <Animated.View style={[styles.brackets, bracketStyle]}>
        <CornerBracket position="topLeft" />
        <CornerBracket position="topRight" />
        <CornerBracket position="bottomLeft" />
        <CornerBracket position="bottomRight" />
      </Animated.View>

      <Animated.View style={[styles.scanLineWrap, scanLineStyle]}>
        <View style={styles.scanGlow} />
        <LinearGradient
          colors={[
            'transparent',
            'rgba(71, 165, 255, 0.35)',
            'rgba(71, 165, 255, 0.95)',
            'rgba(66, 44, 216, 0.85)',
            'rgba(71, 165, 255, 0.95)',
            'rgba(71, 165, 255, 0.35)',
            'transparent',
          ]}
          locations={[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.scanLine}
        />
      </Animated.View>

      <View style={styles.centerHint}>
        <Animated.View style={[styles.iconRing, iconStyle]}>
          <LinearGradient
            colors={['rgba(71, 165, 255, 0.25)', 'rgba(66, 44, 216, 0.15)']}
            style={styles.iconRingGradient}>
            <MaterialIcon name="auto_awesome" size={32} color={colors.secondaryContainer} />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.hintTitle}>Ready to scan</Text>
        <Text style={styles.hintSubtitle}>Capture or pick a photo below</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  accentBlobTop: {
    position: 'absolute',
    top: -40,
    left: -20,
    width: '70%',
    height: '45%',
    borderRadius: 999,
  },
  accentBlobBottom: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    width: '60%',
    height: '40%',
    borderRadius: 999,
  },
  grid: {
    ...StyleSheet.absoluteFill,
    opacity: 0.06,
  },
  gridLine: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  glassRim: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 40,
  },
  brackets: {
    ...StyleSheet.absoluteFill,
  },
  corner: {
    position: 'absolute',
    width: CORNER_ARM,
    height: CORNER_ARM,
  },
  cornerTopLeft: {
    top: CORNER_INSET,
    left: CORNER_INSET,
  },
  cornerTopRight: {
    top: CORNER_INSET,
    right: CORNER_INSET,
  },
  cornerBottomLeft: {
    bottom: CORNER_INSET,
    left: CORNER_INSET,
  },
  cornerBottomRight: {
    bottom: CORNER_INSET,
    right: CORNER_INSET,
  },
  cornerHorizontal: {
    position: 'absolute',
    height: CORNER_STROKE,
    width: CORNER_ARM,
    backgroundColor: BRACKET_COLOR,
    borderRadius: 1,
  },
  cornerVertical: {
    position: 'absolute',
    width: CORNER_STROKE,
    height: CORNER_ARM,
    backgroundColor: BRACKET_COLOR,
    borderRadius: 1,
  },
  scanLineWrap: {
    position: 'absolute',
    left: spacing.lg + 4,
    right: spacing.lg + 4,
    height: 12,
    marginTop: -6,
    zIndex: 4,
    justifyContent: 'center',
  },
  scanGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'rgba(71, 165, 255, 0.2)',
    borderRadius: 5,
    top: 1,
  },
  scanLine: {
    height: 3,
    borderRadius: 2,
  },
  centerHint: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  iconRing: {
    marginBottom: spacing.xs,
  },
  iconRingGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 165, 255, 0.35)',
  },
  hintTitle: {
    ...typography.labelLg,
    color: 'rgba(255, 255, 255, 0.92)',
    letterSpacing: 0.2,
  },
  hintSubtitle: {
    ...typography.labelMd,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});
