import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { glass, radius, spacing } from '../../theme/tokens';

type GlassCardProps = {
  children: ReactNode;
  compact?: boolean;
  style?: ViewStyle;
};

export function GlassCard({ children, compact = false, style }: GlassCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: glass.cardBackground,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: glass.cardBorder,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  cardCompact: {
    padding: spacing.lg,
  },
});
