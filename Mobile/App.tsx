import { StatusBar } from 'react-native';
import { AppProviders } from './src/providers/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F5FF" translucent />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
