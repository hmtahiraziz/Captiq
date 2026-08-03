import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { waitForUiReady } from './waitForUiReady';

const CAMERA_PERMISSION = PermissionsAndroid.PERMISSIONS.CAMERA;

const CAMERA_RATIONALE = {
  title: 'Camera access',
  message: 'Captiq needs camera access to capture photos for AI analysis.',
  buttonNeutral: 'Ask Me Later',
  buttonNegative: 'Cancel',
  buttonPositive: 'Allow',
};

export async function ensureCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  await waitForUiReady();

  try {
    const alreadyGranted = await PermissionsAndroid.check(CAMERA_PERMISSION);

    if (alreadyGranted) {
      return true;
    }

    const result = await PermissionsAndroid.request(CAMERA_PERMISSION, CAMERA_RATIONALE);

    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export function showCameraPermissionDeniedAlert(): void {
  Alert.alert(
    'Camera permission required',
    'Captiq needs camera access to take photos. Enable it in your device Settings.',
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
  );
}
