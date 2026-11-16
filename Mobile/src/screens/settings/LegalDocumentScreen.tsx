import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SettingsScreenLayout } from '../../components/profile/SettingsScreenLayout';
import { LEGAL_DOCUMENTS } from '../../config/legalDocuments';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme/tokens';

export function LegalDocumentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LegalDocument'>>();
  const document = LEGAL_DOCUMENTS[route.params.document];

  return (
    <SettingsScreenLayout title={document.title} onBack={() => navigation.goBack()}>
      <View style={styles.meta}>
        <Text style={styles.intro}>{document.intro}</Text>
        <Text style={styles.updated}>Last updated {document.lastUpdated}</Text>
      </View>

      {document.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          {section.paragraphs.map((paragraph) => (
            <Text key={paragraph.slice(0, 48)} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  meta: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  intro: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  updated: {
    ...typography.labelMd,
    color: colors.outline,
  },
  section: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
  },
  heading: {
    ...typography.labelLg,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  paragraph: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
