import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcon } from './MaterialIcon';
import { colors, radius, typography } from '../../theme/tokens';

const AVATAR_SIZE = 80;

function getInitials(email?: string | null): string {
  if (!email) {
    return '?';
  }

  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  if (local.length >= 2) {
    return local.slice(0, 2).toUpperCase();
  }

  return local.slice(0, 1).toUpperCase() || '?';
}

interface ProfileAvatarProps {
  email?: string | null;
  size?: number;
  verified?: boolean;
}

export function ProfileAvatar({
  email,
  size = AVATAR_SIZE,
  verified = true,
}: ProfileAvatarProps) {
  const initials = getInitials(email);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: radius.thumbnail,
          },
        ]}>
        <LinearGradient
          colors={[colors.secondaryFixed, colors.secondaryFixedDim]}
          style={[
            styles.avatarFill,
            { width: size, height: size, borderRadius: radius.thumbnail },
          ]}>
          <Text style={styles.initials}>{initials}</Text>
        </LinearGradient>
      </View>
      {verified ? (
        <View style={styles.verifiedBadge}>
          <MaterialIcon name="check" size={14} color={colors.onTertiaryFixed} filled />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  avatarFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.headlineSm,
    color: colors.onSecondaryFixed,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.tertiaryFixedDim,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
