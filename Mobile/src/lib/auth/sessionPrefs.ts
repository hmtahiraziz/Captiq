import AsyncStorage from '@react-native-async-storage/async-storage';

const KEEP_SIGNED_IN_KEY = 'captiq.auth.keepSignedIn';

/** Defaults to true so existing sessions stay signed in. */
export async function getKeepSignedIn(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEEP_SIGNED_IN_KEY);
  if (raw == null) {
    return true;
  }
  return raw === '1' || raw === 'true';
}

export async function setKeepSignedIn(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEEP_SIGNED_IN_KEY, value ? '1' : '0');
}
