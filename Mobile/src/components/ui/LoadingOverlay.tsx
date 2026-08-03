import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme/tokens';

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  message: { ...typography.body, color: colors.textSecondary },
});
