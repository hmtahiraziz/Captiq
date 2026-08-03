import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, touchTarget, typography } from '../../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.onPrimary} />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
  label: typography.button,
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryContainer },
  secondary: { backgroundColor: colors.secondary },
  outline: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
});

const labelStyles = StyleSheet.create<Record<ButtonVariant, TextStyle>>({
  primary: { color: colors.onPrimary },
  secondary: { color: colors.onSecondary },
  outline: { color: colors.primary },
});
