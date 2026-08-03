import Toast from 'react-native-toast-message';
import { APP_TOAST_TOP_OFFSET } from '../../components/ui/AppToast';

type AppToastType = 'success' | 'error' | 'info';

export function showAppToast(type: AppToastType, message: string): void {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    topOffset: APP_TOAST_TOP_OFFSET,
    visibilityTime: type === 'error' ? 3200 : 1800,
  });
}
