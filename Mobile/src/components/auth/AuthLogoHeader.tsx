import { StyleSheet, Text, View } from 'react-native';
import { CaptiqLogo } from '../branding/CaptiqLogo';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type AuthLogoHeaderProps = {
  compact?: boolean;
};

export function AuthLogoHeader({ compact = false }: AuthLogoHeaderProps) {
  const logoSize = compact ? 36 : 44;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={[styles.logoChip, compact && styles.logoChipCompact]}>
        <CaptiqLogo size={logoSize} />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]}>Captiq AI</Text>
      <Text style={styles.tagline}>AI vision for everything you see</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  wrapCompact: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  logoChip: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  logoChipCompact: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  title: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  tagline: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
