import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryCard } from '../components/history/HistoryCard';
import { AppTopBar } from '../components/ui/AppTopBar';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { TAB_BAR_BOTTOM_PADDING } from '../components/ui/GlassBottomNav';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { captionTitle, formatAiText } from '../lib/format/aiText';
import { useScanHistoryActions } from '../hooks/useScanHistoryActions';
import { useScans } from '../hooks/useScans';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useScanListMeta } from '../stores/useScanListMeta';
import type { Scan } from '../types/api';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'History'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Filter = 'all' | 'today' | 'favorites';

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function matchesSearch(scan: Scan, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const raw = scan.caption.toLowerCase();
  const display = formatAiText(scan.caption).toLowerCase();
  const title = captionTitle(scan.caption).toLowerCase();

  return (
    raw.includes(normalized) ||
    display.includes(normalized) ||
    title.includes(normalized)
  );
}

function FilterChip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.filterChipActive,
        pressed && styles.pressed,
      ]}>
      {icon ? (
        <MaterialIcon
          name="star"
          size={14}
          color={active ? colors.onPrimary : '#F59E0B'}
          filled
        />
      ) : null}
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const openRowIdRef = useRef<string | null>(null);
  const { data, isLoading, isRefetching, refetch, error } = useScans();
  const isOfflineFallback = useScanListMeta((s) => s.isOfflineFallback);
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const favoritesHydrated = useFavoritesStore((s) => s.hydrated);
  const {
    totalCount,
    deletingScanId,
    isClearingAll,
    isBusy,
    requestDeleteScan,
    requestClearAllScans,
  } = useScanHistoryActions();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const allItems = data?.items ?? [];
  const todayCount = useMemo(
    () => allItems.filter((item) => isToday(item.createdAt)).length,
    [allItems],
  );
  const favoriteCount = useMemo(
    () => allItems.filter((item) => favoriteIds.has(item.id)).length,
    [allItems, favoriteIds],
  );

  const items = useMemo(() => {
    let filtered = allItems;

    if (filter === 'today') {
      filtered = filtered.filter((item) => isToday(item.createdAt));
    }

    if (filter === 'favorites') {
      filtered = filtered.filter((item) => favoriteIds.has(item.id));
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((item) => matchesSearch(item, searchQuery));
    }

    return filtered;
  }, [allItems, favoriteIds, filter, searchQuery]);

  const subtitle = useMemo(() => {
    if (totalCount === 0) {
      return 'No scans recorded yet';
    }

    if (searchQuery.trim()) {
      return `${items.length} result${items.length === 1 ? '' : 's'} for “${searchQuery.trim()}”`;
    }

    if (filter === 'today') {
      return `${items.length} today · ${totalCount} total`;
    }

    if (filter === 'favorites') {
      return `${items.length} favorite${items.length === 1 ? '' : 's'} · ${totalCount} total`;
    }

    return `${totalCount} total visual scan${totalCount === 1 ? '' : 's'} saved`;
  }, [filter, items.length, searchQuery, totalCount]);

  const renderItem = useCallback(
    ({ item, index }: { item: Scan; index: number }) => (
      <HistoryCard
        item={item}
        index={index}
        isDeleting={deletingScanId === item.id}
        isFavorite={favoriteIds.has(item.id)}
        onToggleFavorite={() => toggleFavorite(item.id)}
        onPress={() =>
          navigation.navigate('ScanDetail', {
            scanId: item.id,
            caption: item.caption,
          })
        }
        onDelete={() => requestDeleteScan(item)}
        onSwipeOpen={(scanId) => {
          openRowIdRef.current = scanId;
        }}
        onSwipeClose={(scanId) => {
          if (openRowIdRef.current === scanId) {
            openRowIdRef.current = null;
          }
        }}
      />
    ),
    [deletingScanId, favoriteIds, navigation, requestDeleteScan, toggleFavorite],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.pageHeader}>
        {isOfflineFallback ? (
          <View style={styles.offlineBanner}>
            <MaterialIcon name="info" size={18} color={colors.onSecondaryContainer} />
            <Text style={styles.offlineBannerText}>
              Showing saved scans — connect to refresh from the cloud
            </Text>
          </View>
        ) : null}

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <View style={styles.heroTitleRow}>
              <Text style={styles.pageTitle}>History</Text>
              <View
                style={[
                  styles.syncPill,
                  isOfflineFallback ? styles.syncPillOffline : styles.syncPillLive,
                ]}>
                <View
                  style={[
                    styles.syncDot,
                    isOfflineFallback ? styles.syncDotOffline : styles.syncDotLive,
                  ]}
                />
                <Text
                  style={[
                    styles.syncLabel,
                    isOfflineFallback ? styles.syncLabelOffline : styles.syncLabelLive,
                  ]}>
                  {isOfflineFallback ? 'Offline' : 'Live Sync'}
                </Text>
              </View>
            </View>
            <Text style={styles.pageSubtitle}>{subtitle}</Text>
          </View>
          {totalCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={requestClearAllScans}
              style={({ pressed }) => [
                styles.clearAllButton,
                pressed && styles.pressed,
                isBusy && styles.clearAllButtonDisabled,
              ]}>
              {isClearingAll ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <>
                  <MaterialIcon name="delete" size={14} color={colors.error} />
                  <Text style={styles.clearAllLabel}>Clear</Text>
                </>
              )}
            </Pressable>
          ) : null}
        </View>

        <View style={styles.searchField}>
          <MaterialIcon name="search" size={18} color={colors.outline} />
          <TextInput
            accessibilityLabel="Search scans"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Search scans, keywords, notes..."
            placeholderTextColor={colors.outline}
            returnKeyType="search"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => setSearchQuery('')}
              style={styles.searchClear}>
              <MaterialIcon name="close" size={16} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          keyboardShouldPersistTaps="handled">
          <FilterChip
            label={`All (${totalCount})`}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label={todayCount > 0 ? `Today (${todayCount})` : 'Today'}
            active={filter === 'today'}
            onPress={() => setFilter('today')}
          />
          <FilterChip
            label={`Favorites (${favoriteCount})`}
            active={filter === 'favorites'}
            onPress={() => setFilter('favorites')}
            icon
          />
        </ScrollView>

        <View style={styles.listMetaRow}>
          <Text style={styles.listMetaLabel}>Recent captures</Text>
          <Text style={styles.listMetaSort}>Newest first</Text>
        </View>
      </View>
    ),
    [
      favoriteCount,
      filter,
      isBusy,
      isClearingAll,
      isOfflineFallback,
      requestClearAllScans,
      searchQuery,
      subtitle,
      todayCount,
      totalCount,
    ],
  );

  if ((isLoading && !data) || !favoritesHydrated) {
    return <LoadingOverlay message="Loading scans..." />;
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F8FAFC', colors.surfaceContainerLowest, '#EEF2FF']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppTopBar
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh library"
              onPress={() => {
                void refetch();
              }}
              style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}>
              {isRefetching ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MaterialIcon name="refresh" size={18} color={colors.onSurfaceVariant} />
              )}
            </Pressable>
          }
        />

        <FlatList
          style={styles.list}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={ListSeparator}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            error && !data ? (
              <EmptyState
                title="Could not load scans"
                description="Pull to refresh or check your connection"
              />
            ) : filter === 'favorites' ? (
              <EmptyState
                title="No favorites yet"
                description="Tap the star on any scan to save it here for quick access"
              />
            ) : searchQuery.trim() ? (
              <EmptyState
                title="No matching scans"
                description="Try a different keyword or clear your search"
              />
            ) : filter === 'today' && totalCount > 0 ? (
              <EmptyState
                title="No scans today"
                description="Scans from earlier days are still in the All filter"
              />
            ) : (
              <EmptyState
                title="No scans yet"
                description="Capture your first photo to build your scan history"
              />
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_BOTTOM_PADDING,
    maxWidth: 512,
    width: '100%',
    alignSelf: 'center',
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: 16,
  },
  pageHeader: {
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondaryFixed,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  offlineBannerText: {
    ...typography.labelMd,
    flex: 1,
    color: colors.onSecondaryFixedVariant,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceContainer,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pageTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  syncPillLive: {
    backgroundColor: 'rgba(31, 174, 122, 0.08)',
    borderColor: 'rgba(31, 174, 122, 0.2)',
  },
  syncPillOffline: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncDotLive: {
    backgroundColor: colors.success,
  },
  syncDotOffline: {
    backgroundColor: colors.outline,
  },
  syncLabel: {
    ...typography.labelMd,
    fontWeight: '700',
    fontSize: 11,
  },
  syncLabelLive: {
    color: colors.success,
  },
  syncLabelOffline: {
    color: colors.onSurfaceVariant,
  },
  pageSubtitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(186, 26, 26, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(186, 26, 26, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  clearAllButtonDisabled: {
    opacity: 0.6,
  },
  clearAllLabel: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: '700',
    fontSize: 12,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200, 196, 216, 0.9)',
  },
  searchInput: {
    flex: 1,
    ...typography.labelMd,
    color: colors.onSurface,
    paddingVertical: 10,
    minWidth: 0,
    fontSize: 13,
  },
  searchClear: {
    padding: spacing.xs,
  },
  filters: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    fontSize: 12,
  },
  filterLabelActive: {
    color: colors.onPrimary,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  listMetaLabel: {
    ...typography.labelMd,
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    fontSize: 11,
  },
  listMetaSort: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
