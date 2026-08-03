import {
  ActivityIndicator,
  Platform,
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
        d="M13.025 17l-1.425-1.425L16.175 11H4v-2h12.175l-4.575-4.575L13.025 3 20 9.975 13.025 17z"
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
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    ...(Platform.OS === 'android'
      ? { elevation: 2 }
      : {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
        }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.92,
    backgroundColor: colors.primaryContainer,
  },
  disabled: {
    opacity: 0.5,
  },
  success: {
    backgroundColor: colors.tertiaryContainer,
    ...(Platform.OS === 'android'
      ? { elevation: 2 }
      : {
          shadowColor: colors.tertiaryContainer,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
        }),
  },
});
