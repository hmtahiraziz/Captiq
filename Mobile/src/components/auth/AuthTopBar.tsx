import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaptiqLogo } from '../branding/CaptiqLogo';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type AuthTopBarProps = {
  title: string;
  onBack: () => void;
};

/** Transparent auth chrome — no white header strip. */
export function AuthTopBar({ title, onBack }: AuthTopBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <MaterialIcon name="arrow_back" size={22} color={colors.primary} />
      </Pressable>

      <View style={styles.center}>
        <CaptiqLogo size={28} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.sm,
    minHeight: 48,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  pressed: {
    backgroundColor: colors.primaryFixed,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontWeight: '700',
  },
  spacer: {
    width: 40,
  },
});
