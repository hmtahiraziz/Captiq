import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraScreen } from '../screens/CameraScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GlassBottomNav } from '../components/ui/GlassBottomNav';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassBottomNav {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Camera" component={CameraScreen} options={{ title: 'Scan' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
