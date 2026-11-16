import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, spacing, typography } from '../../theme/tokens';

type AuthCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  label: ReactNode;
  error?: string;
  accessibilityLabel: string;
  /** When false, only the box toggles (use for labels with nested links). */
  toggleOnLabelPress?: boolean;
};

export function AuthCheckbox({
  checked,
  onToggle,
  label,
  error,
  accessibilityLabel,
  toggleOnLabelPress = true,
}: AuthCheckboxProps) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 160 });
  }, [checked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.surfaceContainerLowest, colors.primary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [error ? colors.error : colors.outlineVariant, colors.primary],
    ),
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ checked }}
          hitSlop={8}
          onPress={onToggle}
          style={({ pressed }) => [styles.boxHit, pressed && styles.pressed]}>
          <Animated.View style={[styles.box, error ? styles.boxError : null, boxStyle]}>
            {checked ? (
              <MaterialIcon name="check" size={14} color={colors.onPrimary} />
            ) : null}
          </Animated.View>
        </Pressable>

        {toggleOnLabelPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={onToggle}
            style={styles.labelWrap}>
            {label}
          </Pressable>
        ) : (
          <View style={styles.labelWrap}>{label}</View>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: 44,
  },
  boxHit: {
    paddingTop: 2,
  },
  pressed: {
    opacity: 0.88,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxError: {
    borderColor: colors.error,
  },
  labelWrap: {
    flex: 1,
    paddingTop: 1,
  },
  error: {
    ...typography.labelMd,
    color: colors.error,
    marginLeft: 30,
  },
});
