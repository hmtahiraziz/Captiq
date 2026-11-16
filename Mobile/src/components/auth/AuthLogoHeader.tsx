import { StyleSheet, Text, View } from 'react-native';
import { CaptiqLogo } from '../branding/CaptiqLogo';
import { APP_HEADER_VERSION } from '../ui/AppTopBar';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type AuthLogoHeaderProps = {
  compact?: boolean;
  showTagline?: boolean;
};

export function AuthLogoHeader({
  compact = false,
  showTagline = false,
}: AuthLogoHeaderProps) {
  const logoSize = compact ? 72 : 88;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={[styles.logoGlow, compact && styles.logoGlowCompact]}>
        <CaptiqLogo size={logoSize} />
      </View>

      <View style={styles.brandRow}>
        <Text style={[styles.title, compact && styles.titleCompact]}>Captiq AI</Text>
        <View style={styles.versionPill}>
          <Text style={styles.versionText}>V{APP_HEADER_VERSION}</Text>
        </View>
      </View>

      {showTagline ? (
        <Text style={styles.tagline}>AI vision for everything you see</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  wrapCompact: {
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  logoGlow: {
    width: 104,
    height: 104,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(227, 223, 255, 0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(66, 44, 216, 0.12)',
    shadowColor: colors.primary,
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  logoGlowCompact: {
    width: 88,
    height: 88,
    borderRadius: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  versionPill: {
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  versionText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  tagline: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
