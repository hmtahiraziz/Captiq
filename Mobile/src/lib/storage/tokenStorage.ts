import * as Keychain from 'react-native-keychain';

const SERVICE = 'aisscan-auth';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Keychain.setGenericPassword(
    tokens.accessToken,
    tokens.refreshToken,
    { service: SERVICE, accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED },
  );
}

export async function getTokens(): Promise<StoredTokens | null> {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });

  if (!credentials) {
    return null;
  }

  return {
    accessToken: credentials.username,
    refreshToken: credentials.password,
  };
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
