import type { ReactNode } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthBackground } from './AuthBackground';
import { colors, spacing } from '../../theme/tokens';

type AuthScreenShellProps = {
  children: ReactNode;
  /** Optional fixed top chrome (back bar). Drawn above the scroll content. */
  topBar?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra top padding inside the scroll content (beyond safe inset / top bar). */
  contentTopPad?: number;
};

/**
 * Edge-to-edge auth canvas: gradient under the status bar, no opaque white header band.
 */
export function AuthScreenShell({
  children,
  topBar,
  contentStyle,
  contentTopPad = spacing.md,
}: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();
  const topPad = topBar ? spacing.sm : Math.max(insets.top, spacing.md) + contentTopPad;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <AuthBackground />

      {topBar ? (
        <View style={[styles.topBarSlot, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
          {topBar}
        </View>
      ) : null}

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: topPad,
            paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg,
          },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
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
    // Avoid Android default window flash under translucent status bar.
    ...Platform.select({
      android: { elevation: 0 },
      default: null,
    }),
  },
  flex: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBarSlot: {
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.marginMobile,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
    backgroundColor: 'transparent',
  },
});
