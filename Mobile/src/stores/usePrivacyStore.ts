import { create } from 'zustand';

interface PrivacyState {
  saveScanHistory: boolean;
  analyticsEnabled: boolean;
  setSaveScanHistory: (value: boolean) => void;
  setAnalyticsEnabled: (value: boolean) => void;
}

export const usePrivacyStore = create<PrivacyState>((set) => ({
  saveScanHistory: true,
  analyticsEnabled: false,
  setSaveScanHistory: (value) => set({ saveScanHistory: value }),
  setAnalyticsEnabled: (value) => set({ analyticsEnabled: value }),
}));
