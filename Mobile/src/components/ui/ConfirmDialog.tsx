import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export type ConfirmDialogVariant = 'confirm' | 'alert';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  detail,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  variant = 'confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isAlert = variant === 'alert';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={isAlert ? onConfirm : onCancel}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
        style={styles.backdrop}
        onPress={loading ? undefined : isAlert ? onConfirm : onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {detail ? (
            <View style={styles.detailBox}>
              <Text style={styles.detailText} numberOfLines={6}>
                {detail}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {!isAlert ? (
              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}>
                <Text style={styles.cancelLabel}>{cancelLabel}</Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                isAlert && styles.confirmButtonAlone,
                destructive && styles.confirmButtonDestructive,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={destructive ? colors.onError : colors.onPrimary}
                />
              ) : (
                <Text
                  style={[
                    styles.confirmLabel,
                    destructive && styles.confirmLabelDestructive,
                  ]}>
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 27, 38, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.marginMobile,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineSm,
    color: colors.primary,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailBox: {
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  detailText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.md,
  },
  confirmButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
  confirmButtonAlone: {
    flex: 1,
  },
  confirmButtonDestructive: {
    backgroundColor: colors.error,
  },
  cancelLabel: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
  confirmLabel: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
  confirmLabelDestructive: {
    color: colors.onError,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});
