import { StyleSheet, Text, View } from 'react-native';
import { formatAiText } from '../../lib/format/aiText';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';
  const displayText = isUser ? content.trim() : formatAiText(content);

  if (isUser) {
    return (
      <View style={styles.userWrap}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{displayText}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantWrap}>
      <View style={styles.assistantMeta}>
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>AI</Text>
        </View>
        <Text style={styles.brandLabel}>Captiq</Text>
      </View>
      <View style={styles.assistantBubble}>
        <Text style={styles.assistantText}>{displayText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrap: {
    alignItems: 'flex-end',
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  userText: {
    ...typography.bodyMd,
    color: colors.onPrimary,
  },
  assistantWrap: {
    alignItems: 'flex-start',
    maxWidth: '85%',
    gap: spacing.xs,
  },
  assistantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  aiTag: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onPrimaryContainer,
  },
  brandLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 216, 0.45)',
    borderRadius: radius.lg,
    borderTopLeftRadius: 0,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  assistantText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 24,
  },
});
