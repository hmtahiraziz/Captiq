import type { LegalDocumentId } from '../config/legalDocuments';

export type RootStackParamList = {
  Auth: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  MainTabs: undefined;
  Analyzing: { imageUri: string; mimeType?: string; fileName?: string };
  ScanResult: { scanId: string; imageUri?: string; caption?: string };
  ScanDetail: { scanId: string; caption?: string };
  AccountSettings: undefined;
  PrivacySettings: undefined;
  AboutCaptiq: undefined;
  LegalDocument: { document: LegalDocumentId };
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
