import { StyleSheet, Text, View } from 'react-native';
import type { BaseToastProps, ToastConfig } from 'react-native-toast-message';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type ToastType = 'success' | 'error' | 'info';

const ACCENT: Record<ToastType, string> = {
  success: colors.success,
  error: colors.error,
  info: colors.primary,
};

function MinimalToast({
  text1,
  type,
}: BaseToastProps & { type: ToastType }) {
  if (!text1) {
    return null;
  }

  return (
    <View style={styles.toast}>
      <View style={[styles.accent, { backgroundColor: ACCENT[type] }]} />
      <Text style={styles.text} numberOfLines={2}>
        {text1}
      </Text>
    </View>
  );
}

export const appToastConfig: ToastConfig = {
  success: (props) => <MinimalToast {...props} type="success" />,
  error: (props) => <MinimalToast {...props} type="error" />,
  info: (props) => <MinimalToast {...props} type="info" />,
};

export const APP_TOAST_TOP_OFFSET = 72;

const styles = StyleSheet.create({
  toast: {
    width: '92%',
    maxWidth: 420,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inverseSurface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
    ...typography.labelLg,
    color: colors.inverseOnSurface,
    fontWeight: '500',
  },
});
