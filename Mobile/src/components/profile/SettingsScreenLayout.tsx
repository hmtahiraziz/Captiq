import { type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F5F2FF', colors.background, '#E8F4FF']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.headerWrap}>
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
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
  headerWrap: {
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
  },
  backPressed: {
    backgroundColor: colors.primaryFixed,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.headlineSm,
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    minWidth: 0,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    maxWidth: 512,
    width: '100%',
    alignSelf: 'center',
  },
});
