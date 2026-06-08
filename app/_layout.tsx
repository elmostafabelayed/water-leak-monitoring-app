import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LeakAlertOverlay from '../components/LeakAlertOverlay';
import Toast from '../components/Toast';
import { router, useSegments } from 'expo-router';
import '../global.css';
import AppErrorBoundary from '../components/AppErrorBoundary';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appKey, setAppKey] = useState(0);
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppErrorBoundary key={appKey} onReset={() => setAppKey((k) => k + 1)}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppErrorBoundary>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading, toastMessage, clearToast } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const routeRoot = segments[0];
    const isAuthScreen = routeRoot === 'login' || routeRoot === 'register';
    const isProtected = !isAuthScreen;

    if (!user && isProtected) {
      router.replace('/login');
    } else if (user && isAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return null; // Or a splash screen/loading indicator
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Toast message={toastMessage} onHide={clearToast} />
      <StackScreen />
      <LeakAlertOverlay />
    </ThemeProvider>
  );
}

function StackScreen() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
