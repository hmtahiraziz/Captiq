import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanViewfinderWidget } from '../components/scan/ScanViewfinderWidget';
import { ScanHeroSection } from '../components/scan/ScanHeroSection';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { AppTopBar } from '../components/ui/AppTopBar';
import { TAB_BAR_BOTTOM_PADDING } from '../components/ui/GlassBottomNav';
import { useCameraViewModel } from '../viewmodels/useCameraViewModel';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, glass, radius, spacing, typography } from '../theme/tokens';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Camera'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function CameraScreen() {
  const navigation = useNavigation<Nav>();
  const { isBusy, capturePhoto, pickFromGallery } = useCameraViewModel();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#E3F2FD', colors.background, '#F3E5F5']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppTopBar
          title="Captiq AI"
          trailingIcon="settings"
          trailingAccessibilityLabel="Open settings"
          onTrailingPress={() => navigation.navigate('Profile')}
        />

        <View style={[styles.body, { paddingBottom: TAB_BAR_BOTTOM_PADDING }]}>
          <ScanHeroSection />

          <View style={styles.viewfinderSlot}>
            <View style={styles.viewfinderOuter}>
              <View style={styles.viewfinderFrame}>
                <ScanViewfinderWidget />
              </View>
            </View>
          </View>

          <View style={styles.bottomBlock}>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={capturePhoto}
                style={({ pressed }) => [
                  styles.primaryButtonWrap,
                  pressed && styles.pressed,
                  isBusy && styles.disabled,
                ]}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryButton}>
                  {isBusy ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <>
                      <MaterialIcon name="photo_camera" size={22} color={colors.onPrimary} />
                      <Text style={styles.primaryLabel}>Capture photo</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={pickFromGallery}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                  isBusy && styles.disabled,
                ]}>
                <MaterialIcon name="image" size={22} color={colors.secondary} />
                <Text style={styles.secondaryLabel}>Choose from gallery</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  viewfinderSlot: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  viewfinderOuter: {
    width: '100%',
    maxHeight: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 40,
    shadowColor: colors.secondaryContainer,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 10,
  },
  viewfinderFrame: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#0D1117',
  },
  bottomBlock: {
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  actions: {
    alignItems: 'center',
    gap: spacing.md,
  },
  primaryButtonWrap: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radius.pill,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  primaryLabel: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: glass.cardBackground,
    borderWidth: 1,
    borderColor: glass.cardBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    minHeight: 56,
  },
  secondaryLabel: {
    ...typography.labelLg,
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
