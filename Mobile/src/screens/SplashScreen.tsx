import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CaptiqLogo } from '../components/branding/CaptiqLogo';
import { VisionaryGlassBackground } from '../components/ui/VisionaryGlassBackground';
import { colors, spacing } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const APP_VERSION = '2.4.0';

function PulseRing({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.4, {
        duration: delay === 0 ? 4000 : 6000,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0, {
        duration: delay === 0 ? 4000 : 6000,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false,
    );
  }, [delay, opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.pulseRing, ringStyle, { borderColor: color }]}
    />
  );
}

function BoltIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08 7-13.34 1.11-1.23 2.04-.76 1.66.57L13 12h3.5c.49 0 .56.33.47.51l-.7 1.43c-.1.2-.3.06-.3-.06L11 21z"
        fill={colors.tertiary}
      />
    </Svg>
  );
}

export function SplashScreen() {
  const floatY = useSharedValue(0);
  const revealScale = useSharedValue(0.96);
  const pillOpacity = useSharedValue(0.8);

  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(-10, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    revealScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.bezier(0.2, 0, 0.2, 1),
    });
    pillOpacity.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [floatY, pillOpacity, revealScale]);

  const logoFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const revealStyle = useAnimatedStyle(() => ({
    transform: [{ scale: revealScale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
  }));

  return (
    <View style={styles.root}>
      <VisionaryGlassBackground />

      <View style={styles.pulseContainer} pointerEvents="none">
        <PulseRing delay={0} color="rgba(66, 44, 216, 0.1)" />
        <PulseRing delay={1000} color="rgba(0, 97, 164, 0.05)" />
      </View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Animated.View style={[styles.logoCluster, revealStyle]}>
            <Animated.View style={[styles.logoFloatWrap, logoFloatStyle]}>
              <View style={styles.logoGlow} />
              <View style={styles.logoShell}>
                <View style={styles.logoShine} pointerEvents="none" />
                <View style={styles.logoInnerRing} pointerEvents="none" />
                <CaptiqLogo size={128} />
              </View>
            </Animated.View>

            <View style={styles.wordmark}>
              <Text style={styles.title}>Captiq</Text>
              <Text style={styles.tagline}>Advanced AI Vision</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Animated.View style={[styles.poweredPill, pillStyle]}>
            <BoltIcon />
            <Text style={styles.poweredText}>Powered by Intelligence</Text>
          </Animated.View>
          <Text style={styles.version}>
            Version {APP_VERSION} • © 2024 Captiq Labs
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const LOGO_SIZE = 128;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pulseContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: Math.min(400, SCREEN_WIDTH),
    height: Math.min(400, SCREEN_WIDTH),
    marginLeft: -Math.min(400, SCREEN_WIDTH) / 2,
    marginTop: -Math.min(400, SCREEN_WIDTH) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 1,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoCluster: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  logoFloatWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: LOGO_SIZE + 48,
    height: LOGO_SIZE + 48,
    borderRadius: (LOGO_SIZE + 48) / 2,
    backgroundColor: colors.primary,
    opacity: 0.12,
  },
  logoShell: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  logoInnerRing: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(66, 44, 216, 0.05)',
  },
  wordmark: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    letterSpacing: -0.96,
    color: colors.primary,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 2.8,
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  poweredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    backgroundColor: 'rgba(245, 242, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  poweredText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  version: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.outline,
    opacity: 0.5,
  },
});
