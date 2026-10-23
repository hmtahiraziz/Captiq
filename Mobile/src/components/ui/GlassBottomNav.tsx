import { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcon, type MaterialIconName } from '../profile/MaterialIcon';
import type { MainTabParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme/tokens';

const TAB_META: Record<
  keyof MainTabParamList,
  { icon: MaterialIconName; label: string }
> = {
  Home: { icon: 'home', label: 'Home' },
  History: { icon: 'history', label: 'History' },
  Profile: { icon: 'person', label: 'Profile' },
};

const BAR_PADDING_H = 6;
const PILL_SPRING = { damping: 18, stiffness: 220, mass: 0.75 };

/** Space reserved above the floating tab bar (bar + gap + system nav). */
export const TAB_BAR_BOTTOM_PADDING = 128;

export function GlassBottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const barWidth = Math.min(width - 40, 380);
  const bottomInset = Math.max(insets.bottom, 10) + 12;
  const tabCount = Math.max(state.routes.length, 1);
  const innerWidth = barWidth - BAR_PADDING_H * 2;
  const tabWidth = innerWidth / tabCount;

  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, PILL_SPRING);
  }, [activeIndex, state.index]);

  const pillStyle = useAnimatedStyle(() => ({
    width: tabWidth,
    transform: [{ translateX: activeIndex.value * tabWidth }],
  }));

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomInset }]}>
      <View style={[styles.barShadow, { width: barWidth }]}>
        <View style={[styles.bar, { width: barWidth }]}>
          <Animated.View style={[styles.pillTrack, pillStyle]}>
            <View style={styles.pill} />
          </Animated.View>

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

            return (
              <TabItem
                key={route.key}
                label={label}
                icon={meta.icon}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabItem({
  label,
  icon,
  isFocused,
  onPress,
}: {
  label: string;
  icon: MaterialIconName;
  isFocused: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, PILL_SPRING);
  }, [isFocused, progress]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [1, 1.04], Extrapolation.CLAMP),
      },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [colors.outline, colors.primary],
    ),
    opacity: interpolate(progress.value, [0, 1], [0.75, 1], Extrapolation.CLAMP),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}>
      <Animated.View style={[styles.tabInner, contentStyle]}>
        <MaterialIcon
          name={icon}
          size={22}
          color={isFocused ? colors.primary : colors.outline}
          filled={isFocused}
        />
        <Animated.Text style={[styles.tabLabel, labelStyle]} numberOfLines={1}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
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
  barShadow: {
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 28,
    paddingHorizontal: BAR_PADDING_H,
    paddingVertical: 6,
    minHeight: 64,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200, 196, 216, 0.85)',
  },
  pillTrack: {
    position: 'absolute',
    left: BAR_PADDING_H,
    top: 6,
    bottom: 6,
    paddingHorizontal: 2,
  },
  pill: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryFixed,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingVertical: 6,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabPressed: {
    opacity: 0.88,
  },
  tabLabel: {
    ...typography.labelMd,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
});
