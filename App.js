import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebase/config';
import { registerPushToken, removePushToken } from './firebase/pushTokens';
import { UserPreferencesProvider } from './hooks/useUserPreferences';
import useUserPreferences from './hooks/useUserPreferences';
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
  const { preferences } = useUserPreferences();

  useEffect(() => {
    let previousUserId = null;
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const nextUserId = user?.uid || null;
      if (previousUserId && previousUserId !== nextUserId) {
        await removePushToken(previousUserId);
      }
      previousUserId = nextUserId;
      if (active && nextUserId && preferences.pushNotifications) {
        registerPushToken(nextUserId).catch((error) => {
          if (__DEV__) console.warn('Push token registration failed:', error?.message);
        });
      } else if (active && nextUserId) {
        removePushToken(nextUserId).catch((error) => {
          if (__DEV__) console.warn('Push token removal failed:', error?.message);
        });
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [preferences.pushNotifications]);

  return null;
}

function AppNavigation() {
  const { navigationTheme, isDark } = useTheme();
  const navigationRef = useNavigationContainerRef();
  const pendingTicketId = useRef(null);
  const handledResponseId = useRef(null);

  const openTicketFromNotification = useCallback((response) => {
    const responseId = response?.notification?.request?.identifier;
    if (responseId && handledResponseId.current === responseId) return;
    const data = response?.notification?.request?.content?.data;
    const ticketId = data?.ticketId || data?.ticketCode;
    if (!ticketId) return;
    handledResponseId.current = responseId || ticketId;
    Notifications.clearLastNotificationResponseAsync().catch(() => {});
    if (!navigationRef.isReady()) {
      pendingTicketId.current = ticketId;
      return;
    }
    navigationRef.navigate('Details', { id: ticketId });
  }, [navigationRef]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(openTicketFromNotification);
    Notifications.getLastNotificationResponseAsync().then(openTicketFromNotification).catch(() => {});
    return () => subscription.remove();
  }, [openTicketFromNotification]);

  const handleNavigationReady = () => {
    if (pendingTicketId.current) {
      navigationRef.navigate('Details', { id: pendingTicketId.current });
      pendingTicketId.current = null;
    }
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} onReady={handleNavigationReady}>
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
