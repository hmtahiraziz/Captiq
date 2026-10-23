import { Platform, Share } from 'react-native';

/** Opens the system share sheet with plain text. */
export async function shareText(message: string, title = 'Captiq AI'): Promise<void> {
  const trimmed = message.trim();

  if (!trimmed) {
    return;
  }

  if (Platform.OS === 'ios') {
    await Share.share({ title, message: trimmed });
    return;
  }

  await Share.share({ message: trimmed, title });
}

/**
 * Best-effort copy: uses Clipboard when available (legacy RN), otherwise
 * opens the share sheet so the user can pick Copy.
 */
export async function copyText(message: string): Promise<'copied' | 'shared'> {
  const trimmed = message.trim();

  if (!trimmed) {
    return 'copied';
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rn = require('react-native') as {
      Clipboard?: { setString?: (value: string) => void };
    };

    if (typeof rn.Clipboard?.setString === 'function') {
      rn.Clipboard.setString(trimmed);
      return 'copied';
    }
  } catch {
    // Fall through to share sheet.
  }

  await shareText(trimmed, 'Copy from Captiq');
  return 'shared';
}
