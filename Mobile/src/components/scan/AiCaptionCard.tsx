import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { splitAiParagraphs, formatAiText } from '../../lib/format/aiText';
import { copyText, shareText } from '../../lib/share/shareText';
import { MaterialIcon } from '../profile/MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface AiCaptionCardProps {
  caption: string;
}

export function AiCaptionCard({ caption }: AiCaptionCardProps) {
  const paragraphs = splitAiParagraphs(caption);
  const plain = formatAiText(caption);

  const handleCopy = async () => {
    if (!plain) {
      return;
    }

    try {
      const result = await copyText(plain);
      Toast.show({
        type: 'success',
        text1: result === 'copied' ? 'Caption copied' : 'Share sheet opened',
        text2: result === 'shared' ? 'Choose Copy to save the caption' : undefined,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Could not copy caption' });
    }
  };

  const handleShare = async () => {
    if (!plain) {
      return;
    }

    try {
      await shareText(plain, 'Captiq caption');
    } catch {
      Toast.show({ type: 'error', text1: 'Could not share caption' });
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
        <Text style={styles.title}>Image description</Text>
        {plain ? (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copy caption"
              hitSlop={8}
              onPress={handleCopy}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
              <MaterialIcon name="content_copy" size={18} color={colors.primary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share caption"
              hitSlop={8}
              onPress={handleShare}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
              <MaterialIcon name="share" size={18} color={colors.primary} />
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <Text
              key={`${index}-${paragraph.slice(0, 12)}`}
              style={[styles.paragraph, index > 0 && styles.paragraphSpacing]}>
              {paragraph}
            </Text>
          ))
        ) : (
          <Text style={styles.paragraph}>No caption available for this scan.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  aiBadgeText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    ...typography.headlineSm,
    color: colors.primary,
    fontWeight: '700',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: spacing.sm,
  },
  paragraph: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 24,
  },
  paragraphSpacing: {
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
