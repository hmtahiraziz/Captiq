import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnalyzingProgressRing } from '../components/scan/AnalyzingProgressRing';
import { AnalyzingStepRow } from '../components/scan/AnalyzingProgressPill';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';
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
      <LinearGradient
        colors={['#F5F2FF', colors.background, '#E8F4FF']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <MaterialIcon name="close" size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Captiq AI</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.center}>
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          </View>

          <View style={styles.copy}>
            <Text style={styles.title}>Analyzing…</Text>
            <Text style={styles.subtitle}>
              Captiq is reading subjects, colors, and context from your image.
            </Text>
          </View>

          <View style={styles.ringPlate}>
            <AnalyzingProgressRing percent={percent} />
          </View>
        </View>

        <View style={styles.sheet}>
          <AnalyzingStepRow
            icon="visibility"
            title="Subject"
            subtitle={subjectDone ? 'Identified' : 'Scanning…'}
            done={subjectDone}
          />
          <AnalyzingStepRow
            icon="palette"
            title="Colors"
            subtitle={colorDone ? 'Complete' : 'Reading…'}
            done={colorDone}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
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
    minHeight: 56,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.labelLg,
    color: colors.primary,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.lg,
  },
  previewWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.thumbnail,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  copy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },
  ringPlate: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    marginHorizontal: spacing.marginMobile,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
});
