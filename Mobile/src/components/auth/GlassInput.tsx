import { useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface GlassInputProps extends TextInputProps {
  label: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  labelAccessory?: ReactNode;
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
          fill={colors.outline}
        />
      </Svg>
    );
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
        fill={colors.outline}
      />
    </Svg>
  );
}

export function EmailLeadingIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
        fill={colors.outline}
      />
    </Svg>
  );
}

export function LockLeadingIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
        fill={colors.outline}
      />
    </Svg>
  );
}

export function GlassInput({
  label,
  error,
  leading,
  trailing,
  labelAccessory,
  style,
  onFocus,
  onBlur,
  ...props
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, focused && !error && styles.labelFocused]}>
          {label}
        </Text>
        {labelAccessory}
      </View>

      <View
        style={[
          styles.field,
          focused && !error && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}>
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <TextInput
          placeholderTextColor={colors.outlineVariant}
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          style={[styles.input, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function PasswordVisibilityToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      hitSlop={8}
      onPress={onToggle}
      style={styles.visibilityButton}>
      <EyeIcon visible={visible} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  labelFocused: {
    color: colors.primary,
  },
  field: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  fieldError: {
    borderColor: colors.error,
  },
  leading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    backgroundColor: 'transparent',
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: 0,
    margin: 0,
    minHeight: 52,
    borderWidth: 0,
    ...(Platform.OS === 'android'
      ? {
          includeFontPadding: false,
          textAlignVertical: 'center',
        }
      : null),
  },
  trailing: {
    justifyContent: 'center',
  },
  visibilityButton: {
    padding: 4,
  },
  error: {
    ...typography.labelMd,
    color: colors.error,
    marginTop: 6,
  },
});
