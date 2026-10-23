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
import { colors, typography } from '../../theme/tokens';

interface GlassInputProps extends TextInputProps {
  label: string;
  error?: string;
  trailing?: ReactNode;
  labelAccessory?: ReactNode;
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
          fill={colors.onSurfaceVariant}
        />
      </Svg>
    );
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
        fill={colors.onSurfaceVariant}
      />
    </Svg>
  );
}

export function GlassInput({
  label,
  error,
  trailing,
  labelAccessory,
  style,
  onFocus,
  onBlur,
  ...props
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);
  const underlineColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.outlineVariant;

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, focused && !error && styles.labelFocused]}>
          {label}
        </Text>
        {labelAccessory}
      </View>

      <View style={styles.field}>
        <View style={styles.inputRow}>
          <TextInput
            placeholderTextColor={colors.outlineVariant}
            underlineColorAndroid="transparent"
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            style={[
              styles.input,
              trailing ? styles.inputWithTrailing : null,
              style,
            ]}
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
        <View
          style={[
            styles.underline,
            { backgroundColor: underlineColor },
            focused && !error && styles.underlineFocused,
            error && styles.underlineError,
          ]}
        />
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
    marginBottom: 4,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  labelFocused: {
    color: colors.primary,
  },
  field: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 0,
    margin: 0,
    minHeight: 48,
    borderWidth: 0,
    ...(Platform.OS === 'android'
      ? {
          includeFontPadding: false,
          textAlignVertical: 'center',
          elevation: 0,
          shadowOpacity: 0,
        }
      : {
          shadowOpacity: 0,
          shadowRadius: 0,
        }),
  },
  inputWithTrailing: {
    paddingRight: 8,
  },
  underline: {
    height: 1,
    width: '100%',
  },
  underlineFocused: {
    height: 2,
  },
  underlineError: {
    height: 2,
  },
  trailing: {
    paddingRight: 4,
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
