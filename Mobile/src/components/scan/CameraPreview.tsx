import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  type CameraRef,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';
import { colors, typography } from '../../theme/tokens';

export interface ScanCameraHandle {
  capturePhoto: () => Promise<string | null>;
}

interface CameraPreviewProps {
  isActive: boolean;
  onPreviewStarted?: () => void;
}

export const CameraPreview = forwardRef<ScanCameraHandle, CameraPreviewProps>(
  function CameraPreview({ isActive, onPreviewStarted }, ref) {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const photoOutput = usePhotoOutput({
      qualityPrioritization: 'balanced',
      quality: 0.85,
    });

    useEffect(() => {
      if (!hasPermission) {
        void requestPermission();
      }
    }, [hasPermission, requestPermission]);

    useImperativeHandle(
      ref,
      () => ({
        capturePhoto: async () => {
          const photo = await photoOutput.capturePhoto({}, {});

          try {
            const path = await photo.saveToTemporaryFileAsync();

            if (Platform.OS === 'android' && !path.startsWith('file://')) {
              return `file://${path}`;
            }

            return path;
          } finally {
            photo.dispose();
          }
        },
      }),
      [photoOutput],
    );

    if (!hasPermission) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Camera access is required to scan</Text>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={styles.fallback}>
          <ActivityIndicator color={colors.secondaryContainer} />
          <Text style={styles.fallbackText}>Starting camera…</Text>
        </View>
      );
    }

    return (
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        outputs={[photoOutput]}
        isActive={isActive}
        resizeMode="cover"
        onPreviewStarted={onPreviewStarted}
      />
    );
  },
);

const styles = StyleSheet.create({
  fallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141824',
    gap: 12,
    paddingHorizontal: 24,
  },
  fallbackText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
