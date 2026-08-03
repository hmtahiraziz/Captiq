import { create } from 'zustand';

interface ScanListMetaState {
  isOfflineFallback: boolean;
  setOfflineFallback: (value: boolean) => void;
}

export const useScanListMeta = create<ScanListMetaState>((set) => ({
  isOfflineFallback: false,
  setOfflineFallback: (value) => set({ isOfflineFallback: value }),
}));
