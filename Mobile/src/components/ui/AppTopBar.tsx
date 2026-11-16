import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaptiqLogo } from '../branding/CaptiqLogo';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export const APP_HEADER_VERSION = '1.0.0';

interface AppTopBarProps {
  /** @deprecated Brand is fixed to Captiq AI; kept for call-site compatibility. */
  title?: string;
  trailing?: ReactNode;
  onTrailingPress?: () => void;
  trailingIcon?: 'search' | 'settings' | 'notifications' | 'close' | 'refresh';
  trailingAccessibilityLabel?: string;
  /** When false, keeps layout balanced with an empty side slot (no icon). */
  showTrailing?: boolean;
}

export function AppTopBar({
  trailing,
  onTrailingPress,
  trailingIcon = 'settings',
  trailingAccessibilityLabel = 'Open settings',
  showTrailing = true,
}: AppTopBarProps) {
  const trailingContent = !showTrailing ? null : (
    trailing ?? (
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
        <MaterialIcon name={trailingIcon} size={22} color={colors.onSurface} />
      </Pressable>
    )
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <View style={styles.brandRow}>
          <CaptiqLogo size={40} />

          <View style={styles.brandCopy}>
            <Text style={styles.brandCaptiq}>Captiq</Text>
            <Text style={styles.brandAi}> AI</Text>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>v{APP_HEADER_VERSION}</Text>
            </View>
          </View>
        </View>

        {trailingContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.sm,
    minHeight: 56,
    gap: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
    minWidth: 0,
  },
  brandCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  brandCaptiq: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontSize: 22,
    lineHeight: 28,
  },
  brandAi: {
    ...typography.headlineSm,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontSize: 22,
    lineHeight: 28,
  },
  versionPill: {
    marginLeft: 6,
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  versionText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  trailingButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  trailingPressed: {
    backgroundColor: colors.surfaceContainerLow,
    transform: [{ scale: 0.95 }],
  },
  trailingStatic: {
    opacity: 0.9,
  },
});
