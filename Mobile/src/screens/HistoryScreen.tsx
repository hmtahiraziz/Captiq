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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryCard } from '../components/history/HistoryCard';
import { AppTopBar } from '../components/ui/AppTopBar';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { TAB_BAR_BOTTOM_PADDING } from '../components/ui/GlassBottomNav';
import { VisionaryPatternBackground } from '../components/ui/VisionaryPatternBackground';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { useScanHistoryActions } from '../hooks/useScanHistoryActions';
import { useScans } from '../hooks/useScans';
import type { RootStackParamList } from '../navigation/types';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import { useScanListMeta } from '../stores/useScanListMeta';
import type { Scan } from '../types/api';
import { colors, glass, radius, spacing, typography } from '../theme/tokens';

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

  return (
    scan.caption.toLowerCase().includes(normalized) ||
    scan.model.toLowerCase().includes(normalized)
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
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
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

export function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<Filter>('all');
  const [searchOpen, setSearchOpen] = useState(false);
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

  const items = useMemo(() => {
    const all = data?.items ?? [];

    let filtered = all;

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
  }, [data?.items, favoriteIds, filter, searchQuery]);

  const subtitle = useMemo(() => {
    if (totalCount === 0) {
      return 'No scans recorded';
    }

    if (searchQuery.trim()) {
      return `${items.length} result${items.length === 1 ? '' : 's'} for "${searchQuery.trim()}"`;
    }

    if (filter === 'today') {
      return `${items.length} scan${items.length === 1 ? '' : 's'} today · ${totalCount} total`;
    }

    if (filter === 'favorites') {
      return `${items.length} favorite${items.length === 1 ? '' : 's'} · ${totalCount} total`;
    }

    return `${totalCount} scan${totalCount === 1 ? '' : 's'} recorded`;
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

        {searchOpen ? (
          <View style={styles.searchField}>
            <MaterialIcon name="search" size={20} color={colors.onSurfaceVariant} />
            <TextInput
              accessibilityLabel="Search scans"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              clearButtonMode="while-editing"
              placeholder="Search captions or model…"
              placeholderTextColor={colors.outlineVariant}
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
                <MaterialIcon name="close" size={18} color={colors.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.pageTitle}>History</Text>
        <Text style={styles.pageSubtitle}>{subtitle}</Text>

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
                <MaterialIcon name="clear_all" size={18} color={colors.error} />
                <Text style={styles.clearAllLabel}>Clear All</Text>
              </>
            )}
          </Pressable>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterChip
            label="Today"
            active={filter === 'today'}
            onPress={() => setFilter('today')}
          />
          <FilterChip
            label="Favorites"
            active={filter === 'favorites'}
            onPress={() => setFilter('favorites')}
          />
        </ScrollView>
      </View>
    ),
    [
      filter,
      isBusy,
      isClearingAll,
      isOfflineFallback,
      requestClearAllScans,
      searchOpen,
      searchQuery,
      subtitle,
      totalCount,
    ],
  );

  if ((isLoading && !data) || !favoritesHydrated) {
    return <LoadingOverlay message="Loading scans..." />;
  }

  return (
    <View style={styles.root}>
      <VisionaryPatternBackground />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppTopBar
          title="Captiq AI"
          trailingIcon={searchOpen ? 'close' : 'search'}
          trailingAccessibilityLabel={searchOpen ? 'Close search' : 'Search scans'}
          onTrailingPress={() => {
            setSearchOpen((open) => {
              if (open) {
                setSearchQuery('');
              }
              return !open;
            });
          }}
        />

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={ListSeparator}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
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
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: TAB_BAR_BOTTOM_PADDING,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
  pageHeader: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  offlineBannerText: {
    ...typography.labelMd,
    flex: 1,
    color: colors.onSecondaryContainer,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: glass.cardBackground,
    borderWidth: 1,
    borderColor: glass.cardBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    paddingVertical: spacing.sm,
  },
  searchClear: {
    padding: spacing.xs,
  },
  pageTitle: {
    ...typography.headlineLgMobile,
    color: colors.onSurface,
  },
  pageSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearAllButtonDisabled: {
    opacity: 0.6,
  },
  clearAllLabel: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingRight: spacing.marginMobile,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: glass.cardBackground,
    borderWidth: 1,
    borderColor: glass.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.inverseSurface,
    borderColor: colors.inverseSurface,
  },
  filterLabel: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
  filterLabelActive: {
    color: colors.inverseOnSurface,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
