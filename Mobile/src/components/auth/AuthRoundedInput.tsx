import { useState, type ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, radius, typography } from '../../theme/tokens';

interface AuthRoundedInputProps extends TextInputProps {
  label: string;
  error?: string;
  leadingIcon?: ReactNode;
}

export function AuthRoundedInput({
  label,
  error,
  leadingIcon,
  style,
  onFocus,
  onBlur,
  ...props
}: AuthRoundedInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, focused && !error && styles.labelFocused]}>{label}</Text>

      <View
        style={[
          styles.field,
          focused && !error && styles.fieldFocused,
          error && styles.fieldError,
        ]}>
        {leadingIcon ? <View style={styles.leading}>{leadingIcon}</View> : null}
        <TextInput
          placeholderTextColor={`${colors.outline}99`}
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
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function MailLeadingIcon({ focused }: { focused?: boolean }) {
  return (
    <MaterialIcon
      name="email"
      size={22}
      color={focused ? colors.primary : colors.outline}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 4,
  },
  label: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    paddingHorizontal: 4,
  },
  labelFocused: {
    color: colors.primary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    gap: 8,
  },
  fieldFocused: {
    borderColor: colors.primary,
    ...(Platform.OS === 'android'
      ? { elevation: 0 }
      : {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }),
  },
  fieldError: {
    borderColor: colors.error,
  },
  leading: {
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    paddingVertical: Platform.OS === 'android' ? 8 : 12,
    minHeight: 48,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : {}),
  },
  error: {
    ...typography.labelMd,
    color: colors.error,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
