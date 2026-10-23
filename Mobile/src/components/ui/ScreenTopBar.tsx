import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, glass, spacing, typography } from '../../theme/tokens';

interface ScreenTopBarProps {
  title: string;
  trailing?: ReactNode;
}

export function ScreenTopBar({ title, trailing }: ScreenTopBarProps) {
  return (
    <View style={styles.bar}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    height: 56,
    backgroundColor: glass.cardBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.35)',
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: '700',
    flex: 1,
  },
  trailing: {
    marginLeft: spacing.md,
  },
});
