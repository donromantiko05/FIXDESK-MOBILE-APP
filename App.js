import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebase/config';
import { registerPushToken, removePushToken } from './firebase/pushTokens';
import { UserPreferencesProvider } from './hooks/useUserPreferences';
import useTheme, { ThemeProvider } from './contexts/ThemeContext';
import StackNavigator from './navigation/StackNavigator';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function PushRegistration() {
  useEffect(() => {
    let previousUserId = null;
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const nextUserId = user?.uid || null;
      if (previousUserId && previousUserId !== nextUserId) {
        await removePushToken(previousUserId);
      }
      previousUserId = nextUserId;
      if (active && nextUserId) {
        registerPushToken(nextUserId).catch((error) => {
          if (__DEV__) console.warn('Push token registration failed:', error?.message);
        });
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return null;
}

function AppNavigation() {
  const { navigationTheme, isDark } = useTheme();
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <PushRegistration />
      <StackNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserPreferencesProvider>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </UserPreferencesProvider>
  );
}
