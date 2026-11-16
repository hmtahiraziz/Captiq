import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface AuthPrimaryButtonProps extends PressableProps {
  label: string;
  loading?: boolean;
  success?: boolean;
  successLabel?: string;
  showArrow?: boolean;
}

function ArrowForwardIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
        fill={colors.onPrimary}
      />
    </Svg>
  );
}

function CheckCircleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        fill={colors.onPrimary}
      />
    </Svg>
  );
}

export function AuthPrimaryButton({
  label,
  loading = false,
  success = false,
  successLabel = 'Done',
  showArrow = false,
  disabled,
  style,
  ...props
}: AuthPrimaryButtonProps) {
  const isDisabled = disabled || loading || success;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        success && styles.success,
        pressed && !isDisabled && styles.pressed,
        isDisabled && !success && styles.disabled,
        style as ViewStyle | undefined,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : success ? (
        <View style={styles.content}>
          <Text style={styles.label}>{successLabel}</Text>
          <CheckCircleIcon />
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          {showArrow ? <ArrowForwardIcon /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.labelLg,
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.94,
    backgroundColor: colors.primaryContainer,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  success: {
    backgroundColor: colors.tertiaryContainer,
    shadowColor: colors.tertiary,
  },
});
