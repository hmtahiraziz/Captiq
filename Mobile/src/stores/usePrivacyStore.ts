import { create } from 'zustand';

/**
 * Privacy preferences that actually affect the app.
 * Analytics SDKs are not shipped — there is no analytics toggle.
 * Scan history is always stored server-side while the account exists;
 * users clear it via Privacy → Clear scan history or account deletion.
 */
interface PrivacyState {
  /** Reserved for future client-only history caching preference. */
  saveScanHistory: boolean;
}

export const usePrivacyStore = create<PrivacyState>(() => ({
  saveScanHistory: true,
}));
