import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcon, type MaterialIconName } from '../components/profile/MaterialIcon';
import { AppTopBar } from '../components/ui/AppTopBar';
import { TAB_BAR_BOTTOM_PADDING } from '../components/ui/GlassBottomNav';
import { captionTitle, formatAiText } from '../lib/format/aiText';
import { formatRelativeScanDate } from '../lib/format/date';
import { useScans } from '../hooks/useScans';
import { useCameraViewModel } from '../viewmodels/useCameraViewModel';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type SourceCardProps = {
  icon: MaterialIconName;
  title: string;
  badge: string;
  subtitle: string;
  loading?: boolean;
  disabled?: boolean;
  primary?: boolean;
  onPress: () => void;
};

function SourceCard({
  icon,
  title,
  badge,
  subtitle,
  loading,
  disabled,
  primary,
  onPress,
}: SourceCardProps) {
  const content = (
    <>
      <View style={[styles.sourceIcon, primary && styles.sourceIconOnPrimary]}>
        {loading ? (
          <ActivityIndicator color={primary ? colors.onPrimary : colors.primary} />
        ) : (
          <MaterialIcon
            name={icon}
            size={28}
            color={primary ? colors.onPrimary : colors.primary}
            filled={primary}
          />
        )}
      </View>

      <View style={styles.sourceMeta}>
        <View style={styles.sourceTitleRow}>
          <Text style={[styles.sourceTitle, primary && styles.sourceTitleOnPrimary]}>
            {title}
          </Text>
          <View style={[styles.sourceBadge, primary && styles.sourceBadgeOnPrimary]}>
            <Text
              style={[styles.sourceBadgeText, primary && styles.sourceBadgeTextOnPrimary]}>
              {badge}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.sourceSubtitle, primary && styles.sourceSubtitleOnPrimary]}
          numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <View style={[styles.sourceChevron, primary && styles.sourceChevronOnPrimary]}>
        <MaterialIcon
          name="chevron_right"
          size={20}
          color={primary ? colors.onPrimary : colors.outline}
        />
      </View>
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sourceCardShell,
        primary ? styles.sourceCardShellPrimary : styles.sourceCardShellSecondary,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}>
      {primary ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer, '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sourceCard}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.sourceCard, styles.sourceCardSecondary]}>{content}</View>
      )}
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { isBusy, isCapturing, isPicking, capturePhoto, pickFromGallery } =
    useCameraViewModel();
  const { data } = useScans();
  const latest = data?.items[0];
  const caption = latest ? formatAiText(latest.caption) : '';
  const title = latest ? captionTitle(latest.caption) : '';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F8FAFC', colors.surfaceContainerLowest, '#EEF2FF']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppTopBar showTrailing={false} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.body, { paddingBottom: TAB_BAR_BOTTOM_PADDING }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.newScanPill}>
              <View style={styles.newScanDot} />
              <Text style={styles.newScanLabel}>New scan</Text>
            </View>

            <Text style={styles.title}>Camera or gallery</Text>
            <Text style={styles.subtitle}>
              Pick a source. Captiq will analyze visual details and describe what it sees.
            </Text>
          </View>

          <View style={styles.sources}>
            <SourceCard
              icon="photo_camera"
              title="Camera"
              badge="Live AI"
              subtitle="Take a photo for instant explanation"
              primary
              loading={isCapturing}
              disabled={isBusy && !isCapturing}
              onPress={capturePhoto}
            />
            <SourceCard
              icon="image"
              title="Gallery"
              badge="Photos & files"
              subtitle="Pick snapshots, screenshots, or documents"
              loading={isPicking}
              disabled={isBusy && !isPicking}
              onPress={pickFromGallery}
            />
          </View>

          <View style={styles.lastScanSection}>
            <View style={styles.lastScanHeader}>
              <View style={styles.lastScanHeadingRow}>
                <Text style={styles.lastScanHeading}>Last scan</Text>
                {latest ? <View style={styles.liveDot} /> : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View all scans"
                hitSlop={8}
                onPress={() => navigation.navigate('History')}
                style={styles.viewAllBtn}>
                <Text style={styles.viewAll}>View all</Text>
                <MaterialIcon name="chevron_right" size={14} color={colors.primary} />
              </Pressable>
            </View>

            {latest ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open last scan"
                onPress={() =>
                  navigation.navigate('ScanDetail', {
                    scanId: latest.id,
                    caption: latest.caption,
                  })
                }
                style={({ pressed }) => [styles.lastScanCard, pressed && styles.pressed]}>
                <Image
                  source={{ uri: latest.thumbnailUrl || latest.imageUrl }}
                  style={styles.lastScanThumb}
                  resizeMode="cover"
                />
                <View style={styles.lastScanCopy}>
                  <View style={styles.lastScanDateRow}>
                    <Text style={styles.lastScanDate} numberOfLines={1}>
                      {formatRelativeScanDate(latest.createdAt)}
                    </Text>
                    <MaterialIcon name="chevron_right" size={16} color={colors.outlineVariant} />
                  </View>
                  <Text style={styles.lastScanTitle} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.lastScanCaption} numberOfLines={2}>
                    {caption || 'Open scan'}
                  </Text>
                  <View style={styles.lastScanTags}>
                    <View style={styles.tagSuccess}>
                      <MaterialIcon name="check_circle" size={12} color={colors.success} />
                      <Text style={styles.tagSuccessText}>AI caption</Text>
                    </View>
                    <View style={styles.tagNeutral}>
                      <Text style={styles.tagNeutralText}>Follow-ups</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyHint}>
                  Your recent scans will show up here after the first capture.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <MaterialIcon name="bolt" size={16} color={colors.primary} filled />
            </View>
            <View style={styles.tipCopy}>
              <Text style={styles.tipTitle}>Ready when you are</Text>
              <Text style={styles.tipSubtitle}>
                Scan with camera or gallery, then ask follow-ups anytime.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing.marginMobile,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.xl,
    paddingTop: spacing.sm,
  },
  header: {
    gap: spacing.sm,
  },
  newScanPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(165, 180, 252, 0.6)',
  },
  newScanDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  newScanLabel: {
    ...typography.labelMd,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    fontSize: 11,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    maxWidth: 340,
    lineHeight: 22,
    fontSize: 14,
  },
  sources: {
    gap: 14,
  },
  sourceCardShell: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sourceCardShellPrimary: {
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.35)',
  },
  sourceCardShellSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    backgroundColor: colors.surfaceContainerLowest,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 20,
    minHeight: 108,
    borderRadius: 24,
  },
  sourceCardSecondary: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  sourceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceIconOnPrimary: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sourceMeta: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  sourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sourceTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontWeight: '700',
  },
  sourceTitleOnPrimary: {
    color: colors.onPrimary,
  },
  sourceSubtitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  sourceSubtitleOnPrimary: {
    color: 'rgba(224, 231, 255, 0.95)',
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceBadgeOnPrimary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sourceBadgeText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sourceBadgeTextOnPrimary: {
    color: colors.onPrimary,
  },
  sourceChevron: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  sourceChevronOnPrimary: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  lastScanSection: {
    gap: spacing.md,
  },
  lastScanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  lastScanHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastScanHeading: {
    ...typography.labelMd,
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '800',
    fontSize: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAll: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  lastScanCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200, 196, 216, 0.8)',
  },
  lastScanThumb: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
  },
  lastScanCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  lastScanDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lastScanDate: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 11,
    backgroundColor: colors.primaryFixed,
    overflow: 'hidden',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lastScanTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontWeight: '700',
    marginTop: 2,
  },
  lastScanCaption: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
  },
  lastScanTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  tagSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagSuccessText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
    fontSize: 10,
  },
  tagNeutral: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  tagNeutralText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
    fontSize: 10,
  },
  emptyCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  emptyHint: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.primaryFixed,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(165, 180, 252, 0.5)',
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  tipTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 12,
  },
  tipSubtitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
