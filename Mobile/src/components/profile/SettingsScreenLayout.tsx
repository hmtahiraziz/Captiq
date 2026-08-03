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
        colors={['#F5F2FF', '#E3DFFF', colors.background]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
            <MaterialIcon name="arrow_back" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(252, 248, 255, 0.85)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
});
