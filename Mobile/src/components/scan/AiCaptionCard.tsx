import { StyleSheet, Text, View } from 'react-native';
import { splitAiParagraphs } from '../../lib/format/aiText';
import { VisionMetricBars } from './VisionMetricBars';
import { colors, spacing, typography } from '../../theme/tokens';

interface AiCaptionCardProps {
  caption: string;
  model?: string | null;
}

export function AiCaptionCard({ caption, model }: AiCaptionCardProps) {
  const paragraphs = splitAiParagraphs(caption);
  const modelLabel = model ?? 'GPT-4o mini';

  return (
    <View style={styles.card}>
      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
          <Text style={styles.title}>Image description</Text>
        </View>
        <Text style={styles.model} numberOfLines={2}>
          Powered by {modelLabel}
        </Text>
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

      {caption ? <VisionMetricBars caption={caption} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 216, 0.35)',
    padding: spacing.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  headerBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
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
    flex: 1,
  },
  model: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  body: {
    gap: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  paragraph: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 24,
  },
  paragraphSpacing: {
    marginTop: spacing.md,
  },
});
