import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { AiCaptionCard } from '../components/scan/AiCaptionCard';
import { ChatBubble } from '../components/scan/ChatBubble';
import { MaterialIcon } from '../components/profile/MaterialIcon';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { useMessages, useScan, useSendMessage } from '../hooks/useScans';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import type { RootStackParamList } from '../navigation/types';
import type { Message } from '../types/api';
import { getApiErrorMessage } from '../services/api/client';
import { colors, glass, radius, spacing, typography } from '../theme/tokens';

const COMPOSER_FALLBACK_HEIGHT = 88;

const KEYBOARD_SCROLL_DELAY_MS = Platform.OS === 'android' ? 300 : 150;

/** Samsung One UI toolbar above keys — tune 36–52 if input overlaps or gaps. */
const ANDROID_KEYBOARD_EXTRA = 55;

type ScanScreenProps =
  | NativeStackScreenProps<RootStackParamList, 'ScanResult'>
  | NativeStackScreenProps<RootStackParamList, 'ScanDetail'>;

export function ScanDetailScreen({ route, navigation }: ScanScreenProps) {
  const scanId = route.params.scanId;
  const imageUri = 'imageUri' in route.params ? route.params.imageUri : undefined;
  const captionParam =
    'caption' in route.params ? route.params.caption : undefined;

  const { height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.round(windowHeight * 0.36);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;

  const { data: scan, isLoading, isError } = useScan(scanId);
  const { data: messages = [] } = useMessages(scanId);
  const sendMessage = useSendMessage(scanId);
  const [input, setInput] = useState('');
  const [composerHeight, setComposerHeight] = useState(COMPOSER_FALLBACK_HEIGHT);
  const listRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<TextInput>(null);

  const displayImage = imageUri ?? scan?.imageUrl;
  const caption = scan?.caption ?? captionParam ?? '';
  const canSend = input.trim().length > 0 && !sendMessage.isPending;

  const scrollToEnd = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const handleInputFocus = useCallback(() => {
    if (messages.length === 0) {
      return;
    }

    setTimeout(() => scrollToEnd(), KEYBOARD_SCROLL_DELAY_MS);
  }, [messages.length, scrollToEnd]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    scrollToEnd();
  }, [messages.length, scrollToEnd]);

  useEffect(() => {
    if (!keyboardOpen || messages.length === 0) {
      return;
    }

    const timer = setTimeout(() => scrollToEnd(), KEYBOARD_SCROLL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [keyboardOpen, keyboardHeight, messages.length, scrollToEnd]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sendMessage.isPending) {
      return;
    }

    setInput('');

    try {
      await sendMessage.mutateAsync(content);
    } catch (error) {
      setInput(content);
      Toast.show({ type: 'error', text1: getApiErrorMessage(error) });
    }
  };

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <View style={styles.messageRow}>
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

  const listHeader = (
    <View style={styles.headerBlock}>
      <View style={[styles.hero, { height: heroHeight }]}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroPlaceholder} />
        )}

        <SafeAreaView edges={['top']} style={styles.heroOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <MaterialIcon name="arrow_back" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
        </SafeAreaView>
      </View>

      <View style={styles.contentBlock}>
        <AiCaptionCard caption={caption} model={scan?.model} />
        <View style={styles.followUpHeader}>
          <MaterialIcon name="forum" size={20} color={colors.primary} />
          <Text style={styles.followUpTitle}>Follow-up</Text>
        </View>
      </View>
    </View>
  );

  const composerBottomInset = keyboardOpen ? spacing.sm : Math.max(insets.bottom, spacing.md);
  const androidKeyboardExtra =
    Platform.OS === 'android' && keyboardOpen ? ANDROID_KEYBOARD_EXTRA : 0;
  const listBottomPadding = composerHeight + spacing.xl + androidKeyboardExtra;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
      keyboardVerticalOffset={insets.top}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListHeaderComponent={listHeader}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: listBottomPadding },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.messageGap} />}
        ListEmptyComponent={
          <Text style={styles.emptyChat}>
            Ask a follow-up question about this image
          </Text>
        }
      />

      <View
        onLayout={(event) => {
          setComposerHeight(event.nativeEvent.layout.height);
        }}
        style={[
          styles.composerDock,
          {
            paddingBottom: composerBottomInset,
            marginBottom: androidKeyboardExtra,
          },
        ]}>
        <View style={styles.composer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Ask about this image..."
            placeholderTextColor="rgba(71, 69, 85, 0.55)"
            value={input}
            onChangeText={setInput}
            onFocus={handleInputFocus}
            multiline
            maxLength={1000}
            editable={!sendMessage.isPending}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            textAlignVertical="top"
          />
          <Pressable
            accessibilityRole="button"
            disabled={!canSend}
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendPressable,
              !canSend && styles.sendDisabled,
              pressed && canSend && styles.pressed,
            ]}>
            <View style={styles.sendButton}>
              {sendMessage.isPending ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <MaterialIcon name="send" size={20} color={colors.onPrimary} filled />
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  headerBlock: {
    backgroundColor: colors.background,
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
  backButton: {
    marginTop: spacing.sm,
    marginLeft: spacing.marginMobile,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: glass.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  contentBlock: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  followUpTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  messageRow: {
    paddingHorizontal: spacing.marginMobile,
  },
  messageGap: {
    height: spacing.md,
  },
  emptyChat: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.marginMobile,
  },
  composerDock: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(200, 196, 216, 0.6)',
    paddingLeft: spacing.md,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 56,
    maxWidth: 672,
    alignSelf: 'center',
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
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.95 }],
  },
});
