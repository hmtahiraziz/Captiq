import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { useSplashGate } from '../hooks/useSplashGate';
import { AnalyzingScreen } from '../screens/AnalyzingScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { ScanDetailScreen } from '../screens/ScanDetailScreen';
import { ScanResultScreen } from '../screens/ScanResultScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { AccountSettingsScreen } from '../screens/settings/AccountSettingsScreen';
import { AboutCaptiqScreen } from '../screens/settings/AboutCaptiqScreen';
import { PrivacySettingsScreen } from '../screens/settings/PrivacySettingsScreen';
import { useAuthStore } from '../stores/useAuthStore';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const showSplash = useSplashGate(isBootstrapping);

  useEffect(() => {
    bootstrap().catch(() => undefined);
  }, [bootstrap]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Analyzing"
              component={AnalyzingScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen name="ScanResult" component={ScanResultScreen} />
            <Stack.Screen name="ScanDetail" component={ScanDetailScreen} />
            <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
            <Stack.Screen name="AboutCaptiq" component={AboutCaptiqScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
