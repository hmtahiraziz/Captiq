import { useCallback, useState } from 'react';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ensureAiConsent } from '../lib/consent/ensureAiConsent';
import { appAlert } from '../lib/dialog/appDialog';
import { waitForUiReady } from '../lib/permissions/waitForUiReady';
import {
  ensureCameraPermission,
  showCameraPermissionDeniedAlert,
} from '../lib/permissions/cameraPermission';
import type { RootStackParamList } from '../navigation/types';

const CAMERA_OPTIONS: CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  saveToPhotos: false,
  ...(Platform.OS === 'ios' ? { presentationStyle: 'fullScreen' } : {}),
};

const GALLERY_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  selectionLimit: 1,
};

function getPickerErrorMessage(errorCode?: string, errorMessage?: string): string {
  switch (errorCode) {
    case 'permission':
      return 'Permission denied. Enable camera or photo access in your device Settings.';
    case 'camera_unavailable':
      return 'Camera is not available on this device.';
    case 'others':
      return errorMessage ?? 'Unable to open camera or gallery.';
    default:
      return errorMessage ?? 'Unable to open camera or gallery.';
  }
}

async function navigateWithAsset(
  asset: Asset | undefined,
  navigation: NativeStackNavigationProp<RootStackParamList>,
) {
  const uri = asset?.uri;

  if (!uri) {
    await appAlert({
      title: 'No image selected',
      message: 'Please choose a photo and try again.',
    });
    return;
  }

  navigation.navigate('Analyzing', {
    imageUri: uri,
    mimeType: asset.type,
    fileName: asset.fileName ?? undefined,
  });
}

export function useCameraViewModel() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  const capturePhoto = useCallback(async () => {
    if (isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      const consented = await ensureAiConsent();
      if (!consented) {
        return;
      }

      const hasPermission = await ensureCameraPermission();

      if (!hasPermission) {
        await showCameraPermissionDeniedAlert();
        return;
      }

      const result = await launchCamera(CAMERA_OPTIONS);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        await appAlert({
          title: 'Camera error',
          message: getPickerErrorMessage(result.errorCode, result.errorMessage),
        });
        return;
      }

      await navigateWithAsset(result.assets?.[0], navigation);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to open the camera. Please try again.';
      await appAlert({ title: 'Camera error', message });
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, navigation]);

  const pickFromGallery = useCallback(async () => {
    if (isPicking) {
      return;
    }

    setIsPicking(true);

    try {
      const consented = await ensureAiConsent();
      if (!consented) {
        return;
      }

      await waitForUiReady();

      const result = await launchImageLibrary(GALLERY_OPTIONS);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        await appAlert({
          title: 'Gallery error',
          message: getPickerErrorMessage(result.errorCode, result.errorMessage),
        });
        return;
      }

      await navigateWithAsset(result.assets?.[0], navigation);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to open the gallery. Please try again.';
      await appAlert({ title: 'Gallery error', message });
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, navigation]);

  return {
    isCapturing,
    isPicking,
    isBusy: isCapturing || isPicking,
    capturePhoto,
    pickFromGallery,
  };
}
