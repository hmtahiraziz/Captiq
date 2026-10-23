import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { QuotaUsage } from '../../types/api';
import { MaterialIcon, type MaterialIconName } from './MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type QuotaMeterProps = {
  quota?: QuotaUsage | null;
  compact?: boolean;
  refreshing?: boolean;
};

function normalizeQuota(quota: QuotaUsage) {
  const scansUsed = Math.max(0, Number(quota.scansUsed) || 0);
  const scansLimit = Math.max(1, Number(quota.scansLimit) || 1);
  const messagesUsed = Math.max(0, Number(quota.messagesUsed) || 0);
  const messagesLimit = Math.max(1, Number(quota.messagesLimit) || 1);

  return {
    scansUsed,
    scansLimit,
    scansRemaining: Math.max(0, scansLimit - scansUsed),
    messagesUsed,
    messagesLimit,
    messagesRemaining: Math.max(0, messagesLimit - messagesUsed),
  };
}

function MeterRow({
  label,
  icon,
  used,
  limit,
  remaining,
  accent,
  trackAccent,
}: {
  label: string;
  icon: MaterialIconName;
  used: number;
  limit: number;
  remaining: number;
  accent: string;
  trackAccent: string;
}) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={styles.rowLabelWrap}>
          <MaterialIcon name={icon} size={14} color={accent} />
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Text style={styles.rowValue}>
          <Text style={styles.rowValueStrong}>{remaining} left</Text>
          {` · ${used}/${limit}`}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percent}%`, backgroundColor: trackAccent },
          ]}
        />
      </View>
    </View>
  );
}

export function QuotaMeter({
  quota,
  compact = false,
  refreshing = false,
}: QuotaMeterProps) {
  if (!quota) {
    return null;
  }

  const normalized = normalizeQuota(quota);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Daily AI usage</Text>
            <View style={styles.liveDot} />
            {refreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : null}
          </View>
          <Text style={styles.subtitle}>Resets at midnight UTC</Text>
        </View>
      </View>

      <MeterRow
        label="Scans"
        icon="photo_camera"
        used={normalized.scansUsed}
        limit={normalized.scansLimit}
        remaining={normalized.scansRemaining}
        accent={colors.primary}
        trackAccent={colors.primary}
      />
      <MeterRow
        label="Follow-ups"
        icon="forum"
        used={normalized.messagesUsed}
        limit={normalized.messagesLimit}
        remaining={normalized.messagesRemaining}
        accent={colors.tertiary}
        trackAccent={colors.success}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardCompact: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontWeight: '700',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  subtitle: {
    ...typography.labelMd,
    color: colors.outline,
    fontSize: 12,
  },
  row: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 12,
  },
  rowValue: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  rowValueStrong: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
    padding: 1,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
