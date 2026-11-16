import { type ReactNode } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcon } from './MaterialIcon';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface SettingsScreenLayoutProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
  contentStyle?: ViewStyle;
}

export function SettingsScreenLayout({
  title,
  onBack,
  children,
  contentStyle,
}: SettingsScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={['#F5F2FF', colors.background, '#E8F4FF']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.headerWrap, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
            <MaterialIcon name="arrow_back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bounces={false}
        overScrollMode="never"
        disableScrollOnKeyboardHide
        bottomOffset={72}
        extraKeyboardSpace={24}>
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.sm,
    minHeight: 48,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  },
  backPressed: {
    backgroundColor: colors.primaryFixed,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.headlineSm,
    color: colors.onSurface,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    minWidth: 0,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
    gap: spacing.lg,
    maxWidth: 512,
    width: '100%',
    alignSelf: 'center',
  },
});
