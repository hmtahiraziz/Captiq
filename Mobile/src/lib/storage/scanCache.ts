import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScanListResponse } from '../../types/api';

const SCANS_CACHE_KEY = '@captiq/scans/v1';
const FAVORITES_KEY = '@captiq/favorites/v1';

export async function loadScanCache(): Promise<ScanListResponse | null> {
  try {
    const raw = await AsyncStorage.getItem(SCANS_CACHE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as ScanListResponse;
  } catch {
    return null;
  }
}

export async function saveScanCache(data: ScanListResponse): Promise<void> {
  try {
    await AsyncStorage.setItem(SCANS_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Best-effort local persistence
  }
}

export async function clearScanCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SCANS_CACHE_KEY);
  } catch {
    // ignore
  }
}

export async function loadFavoriteIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveFavoriteIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}
