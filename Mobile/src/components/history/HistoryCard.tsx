import { useCallback, useMemo, useRef } from 'react';
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
import { MaterialIcon } from '../profile/MaterialIcon';
import { captionTitle, formatAiText } from '../../lib/format/aiText';
import { formatRelativeScanDate } from '../../lib/format/date';
import type { Scan } from '../../types/api';
import { colors, radius, spacing, typography } from '../../theme/tokens';

const DELETE_ACTION_WIDTH = 80;

interface HistoryCardProps {
  item: Scan;
  index?: number;
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
  isDeleting = false,
  isFavorite = false,
  onToggleFavorite,
  onPress,
  onDelete,
  onSwipeOpen,
  onSwipeClose,
}: HistoryCardProps) {
  const swipeRef = useRef<SwipeableMethods>(null);
  const caption = useMemo(() => formatAiText(item.caption), [item.caption]);
  const title = useMemo(() => captionTitle(item.caption), [item.caption]);
  const dateLabel = formatRelativeScanDate(item.createdAt);

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
    <View style={styles.shadowWrap}>
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
          <View style={styles.cardTop}>
            <View style={styles.thumbWrap}>
              <Image
                source={{ uri: item.thumbnailUrl || item.imageUrl }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <View style={styles.thumbBadge}>
                <Text style={styles.thumbBadgeText}>AI</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.metaRow}>
                <Text style={styles.date} numberOfLines={1}>
                  {dateLabel}
                </Text>
                {onToggleFavorite ? (
                  <RNPressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isFavorite ? 'Remove from favorites' : 'Add to favorites'
                    }
                    hitSlop={8}
                    onPress={onToggleFavorite}
                    style={({ pressed }) => [
                      styles.favoriteButton,
                      isFavorite && styles.favoriteButtonActive,
                      pressed && styles.favoritePressed,
                    ]}>
                    <MaterialIcon
                      name="star"
                      size={14}
                      color={isFavorite ? colors.primary : colors.outline}
                      filled={isFavorite}
                    />
                  </RNPressable>
                ) : null}
              </View>

              <Text style={styles.cardTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.cardCaption} numberOfLines={2}>
                {caption || 'No caption available'}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerTags}>
              <View style={styles.tagSuccess}>
                <MaterialIcon name="check" size={10} color={colors.success} />
                <Text style={styles.tagSuccessText}>AI caption</Text>
              </View>
            </View>

            <View style={styles.followRow}>
              <Text style={styles.followLabel}>Ask follow-up</Text>
              <MaterialIcon name="chevron_right" size={14} color={colors.outline} />
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLowest,
  },
  swipeContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.error,
  },
  swipeForeground: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
  },
  deleteActionTrack: {
    width: DELETE_ACTION_WIDTH,
    height: '100%',
  },
  deleteAction: {
    width: DELETE_ACTION_WIDTH,
    flex: 1,
    minHeight: 120,
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
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    gap: spacing.md,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  cardDeleting: {
    opacity: 0.65,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  thumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    flexShrink: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  thumbBadgeText: {
    color: colors.onPrimary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  date: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 11,
    backgroundColor: colors.primaryFixed,
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 1,
  },
  cardTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontWeight: '700',
    marginTop: 2,
  },
  cardCaption: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
  },
  favoriteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: colors.primaryFixed,
  },
  favoritePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceContainer,
    paddingTop: spacing.md,
  },
  footerTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  tagSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(31, 174, 122, 0.1)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagSuccessText: {
    ...typography.labelMd,
    color: colors.success,
    fontWeight: '700',
    fontSize: 10,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  followLabel: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
