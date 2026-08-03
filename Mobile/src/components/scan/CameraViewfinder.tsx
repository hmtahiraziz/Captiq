import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { spacing } from '../../theme/tokens';

export function CameraViewfinder() {
  const scanLine = useSharedValue(0.12);

  useEffect(() => {
    scanLine.value = withRepeat(
      withTiming(0.32, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scanLine]);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLine.value * 100}%`,
    opacity: 0.85,
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <LinearGradient
        colors={['rgba(0,0,0,0.28)', 'transparent', 'rgba(0,0,0,0.35)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.scanLine, scanLineStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(71,165,255,0.9)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.scanLineGradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
  scanLine: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    height: 2,
    zIndex: 3,
  },
  scanLineGradient: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
});
