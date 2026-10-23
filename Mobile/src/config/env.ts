import { Platform } from 'react-native';

const API_PORT = 3001;

/** Override for physical device on Wi‑Fi (e.g. `http://192.168.1.42`). Leave empty to auto-detect. */
const ANDROID_PHYSICAL_HOST = '';

const PROD_HOST = 'https://your-api.example.com';

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
      return (ANDROID_PHYSICAL_HOST as string)?.replace(/\/$/, '') ?? '';
    }

    // Emulator: 10.0.2.2 → host machine localhost
    // Physical + USB: run `adb reverse tcp:3001 tcp:3001`, then localhost works
    return isAndroidEmulator()
      ? `http://10.0.2.2:${API_PORT}`
      : `http://localhost:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

const host = (__DEV__ ? getDevHost() : PROD_HOST).replace(/\/$/, '');

export const API_BASE_URL = `${host}/api`;
