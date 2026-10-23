import { Platform } from 'react-native';
import { releaseApiHost } from './releaseHost';

const API_PORT = 3001;

/** Override for physical device on Wi‑Fi (e.g. `http://192.168.1.42`). Leave empty to auto-detect. */
const ANDROID_PHYSICAL_HOST: string = '';

function isAndroidEmulator(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }

  const constants = Platform.constants as unknown as Record<string, string | undefined>;
  const model = constants.Model ?? '';
  const brand = constants.Brand ?? '';
  const fingerprint = constants.Fingerprint ?? '';

  return (
    fingerprint.includes('generic') ||
    fingerprint.includes('sdk') ||
    fingerprint.includes('google_sdk') ||
    model.includes('Emulator') ||
    model.includes('Android SDK built for x86') ||
    brand.includes('generic')
  );
}

function getDevHost(): string {
  if (Platform.OS === 'android') {
    if (ANDROID_PHYSICAL_HOST) {
      return ANDROID_PHYSICAL_HOST.replace(/\/$/, '');
    }

    // Emulator: 10.0.2.2 → host machine localhost
    // Physical + USB: run `adb reverse tcp:3001 tcp:3001`, then localhost works
    return isAndroidEmulator()
      ? `http://10.0.2.2:${API_PORT}`
      : `http://localhost:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

function getProdHost(): string {
  const host = releaseApiHost.trim().replace(/\/$/, '');

  if (!host || host.includes('example.com') || host.includes('your-api')) {
    throw new Error(
      'Production API host is not configured. Set releaseApiHost in src/config/releaseHost.ts',
    );
  }

  if (!host.startsWith('https://')) {
    throw new Error('Production API host must use https://');
  }

  return host;
}

const host = (__DEV__ ? getDevHost() : getProdHost()).replace(/\/$/, '');

export const API_BASE_URL = `${host}/api`;
