import { create } from 'zustand';
import { loadFavoriteIds, saveFavoriteIds } from '../lib/storage/scanCache';

interface FavoritesState {
  ids: Set<string>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: (scanId: string) => Promise<void>;
  isFavorite: (scanId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set<string>(),
  hydrated: false,

  hydrate: async () => {
    const stored = await loadFavoriteIds();
    set({ ids: new Set(stored), hydrated: true });
  },

  toggle: async (scanId) => {
    const next = new Set(get().ids);
    if (next.has(scanId)) {
      next.delete(scanId);
    } else {
      next.add(scanId);
    }

    set({ ids: next });
    await saveFavoriteIds([...next]);
  },

  isFavorite: (scanId) => get().ids.has(scanId),
}));
