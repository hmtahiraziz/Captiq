import { StyleSheet, Text, View } from 'react-native';
import { CaptiqLogo } from '../branding/CaptiqLogo';
import { colors, spacing, typography } from '../../theme/tokens';

type AuthLogoHeaderProps = {
  compact?: boolean;
};

export function AuthLogoHeader({ compact = false }: AuthLogoHeaderProps) {
  const logoSize = compact ? 44 : 52;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <CaptiqLogo size={logoSize} />
      <Text style={[styles.title, compact && styles.titleCompact]}>Captiq AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  wrapCompact: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
});
