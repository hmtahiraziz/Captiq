import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcon, type MaterialIconName } from '../profile/MaterialIcon';
import type { MainTabParamList } from '../../navigation/types';
import { colors, glass, radius, spacing, typography } from '../../theme/tokens';

const TAB_META: Record<
  keyof MainTabParamList,
  { icon: MaterialIconName; label: string }
> = {
  Camera: { icon: 'camera_outdoor', label: 'Scan' },
  History: { icon: 'history', label: 'History' },
  Profile: { icon: 'person', label: 'Profile' },
};

/** Space reserved above the floating tab bar (nav height + bottom inset + margin). */
export const TAB_BAR_BOTTOM_PADDING = 132;

export function GlassBottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const barWidth = Math.min(width * 0.9, 448);
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomInset + 8 }]}>
      <View style={[styles.bar, { width: barWidth }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const meta = TAB_META[route.name as keyof MainTabParamList];
          const label = descriptors[route.key].options.title ?? meta.label;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          if (isFocused) {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={{ selected: true }}
                accessibilityLabel={label}
                onPress={onPress}
                style={({ pressed }) => [styles.activeTab, pressed && styles.pressed]}>
                <LinearGradient
                  colors={[colors.secondaryContainer, colors.primary]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.activeGradient}>
                  <MaterialIcon name={meta.icon} size={22} color={colors.onPrimary} filled />
                  <Text style={styles.activeLabel}>{label}</Text>
                </LinearGradient>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: false }}
              accessibilityLabel={label}
              onPress={onPress}
              style={({ pressed }) => [styles.inactiveTab, pressed && styles.inactivePressed]}>
              <MaterialIcon name={meta.icon} size={24} color={colors.onSurfaceVariant} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: glass.cardBackground,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: glass.cardBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    shadowColor: colors.surfaceTint,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
  activeTab: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  activeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  activeLabel: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  inactiveTab: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  inactivePressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ scale: 0.96 }],
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
});
