import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable as RNPressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcon } from '../profile/MaterialIcon';
import { formatAiText } from '../../lib/format/aiText';
import { formatScanDate } from '../../lib/format/date';
import { formatModelLabel } from '../../lib/format/model';
import type { Scan } from '../../types/api';
import { colors, glass, radius, spacing, typography } from '../../theme/tokens';

const DELETE_ACTION_WIDTH = 80;

interface HistoryCardProps {
  item: Scan;
  index: number;
  isDeleting?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPress: () => void;
  onDelete: () => Promise<void>;
  onSwipeOpen?: (scanId: string) => void;
  onSwipeClose?: (scanId: string) => void;
}

export function HistoryCard({
  item,
  index,
  isDeleting = false,
  isFavorite = false,
  onToggleFavorite,
  onPress,
  onDelete,
  onSwipeOpen,
  onSwipeClose,
}: HistoryCardProps) {
  const swipeRef = useRef<SwipeableMethods>(null);
  const showPill = index % 2 === 1;
  const matchPercent = 75 + (item.id.charCodeAt(0) % 24);
  const modelLabel = formatModelLabel(item.model);

  const handleDeletePress = useCallback(() => {
    void onDelete().finally(() => {
      swipeRef.current?.close();
    });
  }, [onDelete]);

  const renderRightActions = useCallback(
    () => (
      <View style={styles.deleteActionTrack}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete scan"
          disabled={isDeleting}
          onPress={handleDeletePress}
          style={({ pressed }) => [
            styles.deleteAction,
            pressed && styles.deleteActionPressed,
            isDeleting && styles.deleteActionDisabled,
          ]}>
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.onError} />
          ) : (
            <>
              <MaterialIcon name="delete" size={22} color={colors.onError} />
              <Text style={styles.deleteActionLabel}>Delete</Text>
            </>
          )}
        </Pressable>
      </View>
    ),
    [handleDeletePress, isDeleting],
  );

  return (
    <Swipeable
      ref={swipeRef}
      enabled={!isDeleting}
      overshootRight={false}
      friction={2}
      rightThreshold={DELETE_ACTION_WIDTH / 2}
      containerStyle={styles.swipeContainer}
      childrenContainerStyle={styles.swipeForeground}
      onSwipeableOpen={() => onSwipeOpen?.(item.id)}
      onSwipeableClose={() => onSwipeClose?.(item.id)}
      renderRightActions={renderRightActions}>
      <Pressable
        accessibilityRole="button"
        disabled={isDeleting}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && !isDeleting && styles.cardPressed,
          isDeleting && styles.cardDeleting,
        ]}>
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: item.thumbnailUrl || item.imageUrl }}
            style={styles.thumb}
            resizeMode="cover"
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardMeta}>
            <View style={styles.scannedBadge}>
              <Text style={styles.scannedText}>Scanned</Text>
            </View>
            <Text style={styles.date} numberOfLines={1}>
              {formatScanDate(item.createdAt)}
            </Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={1}>
            {formatAiText(item.caption)}
          </Text>

          <View style={styles.cardFooter}>
            <MaterialIcon name="memory" size={16} color={colors.primary} />
            <Text style={styles.footerText} numberOfLines={1}>
              {modelLabel}
            </Text>
          </View>
        </View>

        <View style={styles.cardTrailing}>
          {onToggleFavorite ? (
            <RNPressable
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              hitSlop={8}
              onPress={onToggleFavorite}
              style={({ pressed }) => [styles.favoriteButton, pressed && styles.favoritePressed]}>
              <MaterialIcon
                name="star"
                size={22}
                color={isFavorite ? colors.tertiary : colors.outlineVariant}
                filled={isFavorite}
              />
            </RNPressable>
          ) : null}
          {showPill ? (
            <View style={styles.miniPill}>
              <LinearGradient
                colors={[colors.primary, colors.secondaryContainer]}
                style={[styles.miniPillFill, { height: `${matchPercent}%` }]}
              />
            </View>
          ) : null}
          <MaterialIcon name="chevron_right" size={22} color={colors.outlineVariant} />
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.error,
  },
  swipeForeground: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
  },
  deleteActionTrack: {
    width: DELETE_ACTION_WIDTH,
    height: '100%',
  },
  deleteAction: {
    width: DELETE_ACTION_WIDTH,
    flex: 1,
    minHeight: 72,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  deleteActionPressed: {
    backgroundColor: '#A31515',
  },
  deleteActionDisabled: {
    opacity: 0.85,
  },
  deleteActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.onError,
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: glass.cardBorder,
    borderRadius: radius.card,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
  cardDeleting: {
    opacity: 0.65,
  },
  thumbWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.thumbnail,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    flexShrink: 0,
  },
  thumb: { width: '100%', height: '100%' },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 2,
  },
  scannedBadge: {
    backgroundColor: 'rgba(123, 250, 192, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  scannedText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.tertiary,
  },
  date: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
    opacity: 0.7,
    flexShrink: 1,
    textAlign: 'right',
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.onSurface,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
  cardTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  favoritePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
  miniPill: {
    width: 10,
    height: 40,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 216, 0.35)',
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'flex-end',
  },
  miniPillFill: {
    width: '100%',
  },
});
