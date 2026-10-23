import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { AiCaptionCard } from '../components/scan/AiCaptionCard';
import { ChatBubble } from '../components/scan/ChatBubble';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { quotaKeys } from '../hooks/useQuota';
import { useMessages, useScan, useSendMessage } from '../hooks/useScans';
import { formatAiText } from '../lib/format/aiText';
import { shareText } from '../lib/share/shareText';
import type { RootStackParamList } from '../navigation/types';
import type { Message } from '../types/api';
import { getApiErrorMessage } from '../services/api/client';
import { colors, radius, spacing, typography } from '../theme/tokens';

const FOLLOW_UP_SUGGESTIONS = [
  'What is the main subject?',
  'Describe the colors and mood',
  'Is there any text I should read?',
] as const;

type ScanScreenProps =
  | NativeStackScreenProps<RootStackParamList, 'ScanResult'>
  | NativeStackScreenProps<RootStackParamList, 'ScanDetail'>;

function buildThreadShareText(caption: string, messages: Message[]): string {
  const parts = [`Captiq scan`, '', formatAiText(caption) || 'No caption'].filter(Boolean);

  if (messages.length > 0) {
    parts.push('', 'Follow-up');
    for (const message of messages) {
      const label = message.role === 'user' ? 'You' : 'Captiq';
      parts.push('', `${label}:`, formatAiText(message.content));
    }
  }

  return parts.join('\n');
}

export function ScanDetailScreen({ route, navigation }: ScanScreenProps) {
  const scanId = route.params.scanId;
  const imageUri = 'imageUri' in route.params ? route.params.imageUri : undefined;
  const captionParam =
    'caption' in route.params ? route.params.caption : undefined;

  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;
  const queryClient = useQueryClient();

  const { data: scan, isLoading, isError } = useScan(scanId);
  const { data: messages = [] } = useMessages(scanId);
  const sendMessage = useSendMessage(scanId);
  const [input, setInput] = useState('');
  const inputRef = useRef<TextInput>(null);

  const displayImage = imageUri ?? scan?.imageUrl;
  const caption = scan?.caption ?? captionParam ?? '';
  const isSending = sendMessage.isPending;
  const canSend = input.trim().length > 0 && !isSending;
  const chatting = messages.length > 0;
  const showSuggestions = messages.length === 0 && !isSending;

  const heroHeight = Math.round(windowHeight * (chatting ? 0.18 : 0.28));

  /** Newest first — inverted list keeps the latest turn above the ask field. */
  const chatItems = useMemo(() => [...messages].reverse(), [messages]);

  const sendQuestion = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isSending) {
        return;
      }

      setInput('');

      try {
        await sendMessage.mutateAsync(trimmed);
        await queryClient.invalidateQueries({ queryKey: quotaKeys.all });
      } catch (error) {
        setInput(trimmed);
        Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
      }
    },
    [isSending, queryClient, sendMessage],
  );

  const handleSend = () => {
    void sendQuestion(input);
  };

  const handleShareThread = async () => {
    try {
      await shareText(buildThreadShareText(caption, messages), 'Captiq conversation');
    } catch {
      Toast.show({ type: 'error', text1: 'Could not share conversation' });
    }
  };

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <View
        style={[
          styles.messageRow,
          item.role === 'user' ? styles.questionRow : styles.answerRow,
        ]}>
        <ChatBubble role={item.role} content={item.content} />
      </View>
    ),
    [],
  );

  if (isLoading && !displayImage && !caption) {
    return <LoadingOverlay message="Loading scan..." />;
  }

  if (isError && !caption && !displayImage) {
    return <LoadingOverlay message="Could not load scan" />;
  }

  // Renders at TOP when the list is inverted.
  const contextHeader = (
    <View style={styles.contextBlock}>
      <View style={[styles.hero, { height: heroHeight }]}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroPlaceholder} />
        )}

        <SafeAreaView edges={['top']} style={styles.heroOverlay}>
          <View style={styles.heroTopRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <MaterialIcon name="arrow_back" size={18} color={colors.onSurface} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share conversation"
              onPress={handleShareThread}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <MaterialIcon name="share" size={18} color={colors.onSurface} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentBlock}>
        <AiCaptionCard caption={caption} />
        <View style={styles.followUpHeader}>
          <Text style={styles.followUpTitle}>Follow-up</Text>
          {showSuggestions ? (
            <Text style={styles.followUpHint}>Ask a follow-up about this image</Text>
          ) : null}
        </View>

        {showSuggestions ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionRow}
            keyboardShouldPersistTaps="handled">
            {FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
              <Pressable
                key={suggestion}
                accessibilityRole="button"
                disabled={isSending}
                onPress={() => void sendQuestion(suggestion)}
                style={({ pressed }) => [
                  styles.suggestionChip,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );

  // When the keyboard is open, KeyboardStickyView lifts the dock — drop home-indicator padding.
  const composerBottomPad = keyboardOpen
    ? spacing.sm
    : Math.max(insets.bottom, spacing.sm);

  return (
    <View style={styles.root}>
      <FlatList
        inverted
        data={chatItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListFooterComponent={contextHeader}
        ListHeaderComponent={
          // Inverted: this sits above the ask field. Grow with the keyboard so
          // the latest messages stay visible while KeyboardStickyView lifts.
          <View style={{ height: keyboardOpen ? keyboardHeight + spacing.sm : spacing.sm }} />
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 80,
        }}
      />

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View style={[styles.composerDock, { paddingBottom: composerBottomPad }]}>
          <View style={styles.composer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ask anything…"
              placeholderTextColor={colors.onSurfaceVariant}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
              returnKeyType="default"
              blurOnSubmit={false}
              textAlignVertical="top"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send"
              disabled={!canSend}
              onPress={handleSend}
              style={({ pressed }) => [
                styles.sendPressable,
                !canSend && styles.sendDisabled,
                pressed && canSend && styles.pressed,
              ]}>
              <View style={styles.sendButton}>
                <MaterialIcon name="send" size={20} color={colors.onPrimary} filled />
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  contextBlock: {
    backgroundColor: colors.background,
    paddingBottom: spacing.md,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-start',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBlock: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  followUpHeader: {
    gap: spacing.xs,
  },
  followUpTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontWeight: '700',
  },
  followUpHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  suggestionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    maxWidth: 220,
  },
  suggestionText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  messageRow: {
    paddingHorizontal: spacing.marginMobile,
  },
  questionRow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  answerRow: {
    marginVertical: spacing.xs,
  },
  composerDock: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 56,
    width: '100%',
  },
  input: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    ...typography.bodyMd,
    color: colors.onSurface,
    maxHeight: 120,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
  sendPressable: {
    flexShrink: 0,
    marginLeft: spacing.xs,
    marginBottom: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.88,
  },
});
