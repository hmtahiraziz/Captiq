export type RootStackParamList = {
  Auth: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  MainTabs: undefined;
  Analyzing: { imageUri: string; mimeType?: string; fileName?: string };
  ScanResult: { scanId: string; imageUri?: string; caption?: string };
  ScanDetail: { scanId: string; caption?: string };
  AccountSettings: undefined;
  PrivacySettings: undefined;
  AboutCaptiq: undefined;
};

export type MainTabParamList = {
  Camera: undefined;
  History: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
