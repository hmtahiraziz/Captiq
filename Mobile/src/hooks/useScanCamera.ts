import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  launchImageLibrary,
  type Asset,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ScanCameraHandle } from '../components/scan/CameraPreview';
import { waitForUiReady } from '../lib/permissions/waitForUiReady';
import {
  ensureCameraPermission,
  showCameraPermissionDeniedAlert,
} from '../lib/permissions/cameraPermission';
import type { RootStackParamList } from '../navigation/types';
import { useCameraPermission } from 'react-native-vision-camera';

const GALLERY_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  selectionLimit: 1,
};

type CameraNavigation = NativeStackNavigationProp<RootStackParamList>;

function navigateWithAsset(
  asset: Asset | undefined,
  navigation: CameraNavigation,
) {
  const uri = asset?.uri;

  if (!uri) {
    return;
  }

  navigation.navigate('Analyzing', {
    imageUri: uri,
    mimeType: asset.type,
    fileName: asset.fileName ?? undefined,
  });
}

export function useScanCamera() {
  const navigation = useNavigation<CameraNavigation>();
  const cameraRef = useRef<ScanCameraHandle>(null);
  const { hasPermission } = useCameraPermission();

  const [isFocused, setIsFocused] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        setCameraReady(false);
      };
    }, []),
  );

  const handlePreviewStarted = useCallback(() => {
    setCameraReady(true);
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      setCameraReady(false);
    }
  }, [hasPermission]);

  const capturePhoto = useCallback(async () => {
    if (isCapturing) {
      return;
    }

    if (!hasPermission) {
      const granted = await ensureCameraPermission();
      if (!granted) {
        showCameraPermissionDeniedAlert();
        return;
      }
    }

    if (!cameraRef.current) {
      Alert.alert('Camera unavailable', 'Please wait for the preview to initialize.');
      return;
    }

    setIsCapturing(true);

    try {
      const uri = await cameraRef.current.capturePhoto();

      if (uri) {
        navigation.navigate('Analyzing', {
          imageUri: uri,
          mimeType: 'image/jpeg',
          fileName: `captiq-${Date.now()}.jpg`,
        });
        return;
      }
    } catch {
      // Fallback to system camera if preview capture fails
      const { launchCamera } = await import('react-native-image-picker');
      const granted = await ensureCameraPermission();
      if (granted) {
        const result = await launchCamera({
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
        });
        if (!result.didCancel && result.assets?.[0]) {
          navigateWithAsset(result.assets[0], navigation);
        }
      }
    } finally {
      setIsCapturing(false);
    }
  }, [hasPermission, isCapturing, navigation]);

  const pickFromGallery = useCallback(async () => {
    if (isPicking) {
      return;
    }

    setIsPicking(true);

    try {
      await waitForUiReady();
      const result = await launchImageLibrary(GALLERY_OPTIONS);

      if (!result.didCancel && result.assets?.[0]) {
        navigateWithAsset(result.assets[0], navigation);
      }
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, navigation]);

  return {
    cameraRef,
    isFocused,
    isCapturing,
    isPicking,
    isBusy: isCapturing || isPicking,
    hasPermission,
    cameraReady,
    handlePreviewStarted,
    capturePhoto,
    pickFromGallery,
  };
}
