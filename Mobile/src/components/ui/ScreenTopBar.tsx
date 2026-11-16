import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';

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
    width: '100%',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    minHeight: 60,
  },
  title: {
    ...typography.headlineSm,
    color: colors.primary,
    fontWeight: '700',
    flex: 1,
  },
  trailing: {
    marginLeft: spacing.md,
  },
});
