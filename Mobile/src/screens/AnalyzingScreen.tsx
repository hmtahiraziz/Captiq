import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnalyzingProgressRing } from '../components/scan/AnalyzingProgressRing';
import {
  AnalyzingStepRow,
  analyzingGlassSheet,
} from '../components/scan/AnalyzingProgressPill';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';
import { useAnalyzingViewModel } from '../viewmodels/useAnalyzingViewModel';

type Props = NativeStackScreenProps<RootStackParamList, 'Analyzing'>;

export function AnalyzingScreen({ route, navigation }: Props) {
  const { imageUri, mimeType, fileName } = route.params;
  const { percent } = useAnalyzingViewModel(
    { uri: imageUri, mimeType, fileName },
    navigation,
  );

  const subjectDone = percent >= 40;
  const colorDone = percent >= 70;

  return (
    <View style={styles.root}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <MaterialIcon name="close" size={22} color={colors.onSurface} />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.center}>
          <View style={styles.copy}>
            <Text style={styles.title}>Analyzing image...</Text>
            <Text style={styles.subtitle}>
              Identifying subjects and color profiles using Vision Intelligence.
            </Text>
          </View>

          <AnalyzingProgressRing percent={percent} />
        </View>
      </SafeAreaView>

      <View style={analyzingGlassSheet.sheet}>
        <View style={analyzingGlassSheet.handle} />
        <View style={styles.steps}>
          <AnalyzingStepRow
            icon="visibility"
            title="Subject Detected"
            subtitle={subjectDone ? 'Visual subject identified' : 'Scanning frame...'}
            done={subjectDone}
          />
          <AnalyzingStepRow
            icon="palette"
            title="Color Profile"
            subtitle={colorDone ? 'Palette analysis complete' : 'Reading colors...'}
            done={colorDone}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(252, 248, 255, 0.82)',
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.xl,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },
  steps: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
