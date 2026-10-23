import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';

export function ScanHeroSection() {
  return (
    <View style={styles.hero}>
      <Text style={styles.title}>What do you see?</Text>
      <Text style={styles.subtitle}>
        Snap anything. Captiq describes it instantly with AI.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors.onSurface,
    textAlign: 'center',
    letterSpacing: -0.28,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 320,
    paddingHorizontal: spacing.sm,
  },
});
