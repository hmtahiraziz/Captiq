import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../auth/GlassCard';
import { colors, spacing, typography } from '../../theme/tokens';

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
  compact?: boolean;
}

export function SettingsSection({ title, children, compact = true }: SettingsSectionProps) {
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <GlassCard compact={compact} style={styles.card}>
        {children}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.sm,
  },
  card: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
});
