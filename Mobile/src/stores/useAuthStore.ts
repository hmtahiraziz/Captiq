import { create } from 'zustand';
import * as authService from '../services/auth.service';
import { clearScanCache } from '../lib/storage/scanCache';
import { clearTokens, getTokens, saveTokens } from '../lib/storage/tokenStorage';
import { getApiErrorMessage } from '../services/api/client';
import type { User } from '../types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,

  bootstrap: async () => {
    try {
      const tokens = await getTokens();

      if (!tokens) {
        set({ user: null, isAuthenticated: false, isBootstrapping: false });
        return;
      }

      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isBootstrapping: false });
    } catch {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isBootstrapping: false });
    }
  },

  login: async (email, password) => {
    const tokens = await authService.login(email, password);
    await saveTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    set({ user: tokens.user, isAuthenticated: true });
  },

  register: async (email, password) => {
    const tokens = await authService.register(email, password);
    await saveTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    set({ user: tokens.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const tokens = await getTokens();
      if (tokens?.refreshToken) {
        await authService.logout(tokens.refreshToken);
      }
    } catch {
      // Still clear local session if remote logout fails
    } finally {
      await clearTokens();
      await clearScanCache();
      set({ user: null, isAuthenticated: false });
    }
  },
}));

export { getApiErrorMessage };
