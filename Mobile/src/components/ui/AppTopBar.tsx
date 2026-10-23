import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaptiqLogo } from '../branding/CaptiqLogo';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface AppTopBarProps {
  title?: string;
  trailing?: ReactNode;
  onTrailingPress?: () => void;
  trailingIcon?: 'search' | 'settings' | 'notifications' | 'close';
  trailingAccessibilityLabel?: string;
}

const SIDE_SLOT_WIDTH = 48;

export function AppTopBar({
  title = 'Captiq AI',
  trailing,
  onTrailingPress,
  trailingIcon = 'search',
  trailingAccessibilityLabel = 'Open action',
}: AppTopBarProps) {
  const trailingContent =
    trailing ??
    (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={trailingAccessibilityLabel}
        disabled={!onTrailingPress}
        hitSlop={8}
        onPress={onTrailingPress}
        style={({ pressed }) => [
          styles.trailingButton,
          pressed && onTrailingPress && styles.trailingPressed,
          !onTrailingPress && styles.trailingStatic,
        ]}>
        <MaterialIcon name={trailingIcon} size={24} color={colors.onSurfaceVariant} />
      </Pressable>
    );

  return (
    <View style={styles.bar}>
      <View style={styles.sideSlot}>
        <CaptiqLogo size={32} />
      </View>

      <View style={styles.centerSlot}>
        <Text style={styles.centerLabel} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.sideSlot}>{trailingContent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    height: 64,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 196, 216, 0.35)',
  },
  sideSlot: {
    width: SIDE_SLOT_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  centerLabel: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  trailingButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  trailingPressed: {
    backgroundColor: 'rgba(66, 44, 216, 0.08)',
    transform: [{ scale: 0.95 }],
  },
  trailingStatic: {
    opacity: 0.85,
  },
});
