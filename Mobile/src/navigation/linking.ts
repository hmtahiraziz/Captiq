import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Optional deep links (password reset uses in-app 6-digit codes, not links).
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['captiq://'],
  config: {
    screens: {
      Auth: '',
      ForgotPassword: 'forgot-password',
      MainTabs: {
        screens: {
          Home: 'home',
          History: 'history',
          Profile: 'profile',
        },
      },
    },
  },
};
