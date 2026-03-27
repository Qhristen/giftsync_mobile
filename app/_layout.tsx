import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts as useDMSans
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  useFonts as useFraunces
} from '@expo-google-fonts/fraunces';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { useTheme } from '@/hooks/useTheme';
import { store } from '@/store';
import 'react-native-reanimated';
import { Toaster } from 'sonner-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import notificationService from '@/services/notificationService';
import { RootState } from '@/store';
import { restoreSession } from '@/store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

function RootLayoutContent() {
  const { isDark, colors, spacing } = useTheme();

  const dispatch = useDispatch();
  const segments = useSegments();
  const router = useRouter();
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);


  const syncDeviceToken = async () => {
    const expoToken = notificationService.getPushToken();
    const deviceToken = notificationService.getDevicePushToken();

    if (expoToken || deviceToken) {
      try {
        // await saveDeviceToken({
        //   token: deviceToken || expoToken || '',
        //   expoToken: expoToken ?? "",
        //   deviceType: Platform.OS.toString()
        // }).unwrap();
        console.log("✅ Device token synced with server");
      } catch (error) {
        console.error("❌ Failed to sync device token:", error);
      }
    }
  };


  useEffect(() => {
    dispatch(restoreSession() as any);
  }, []);

  // Initialize notification service
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notificationService.initialize();
        console.log("🔔 Notification service ready");

        // If already authenticated, sync token
        if (isAuthenticated) {
          syncDeviceToken();
        }
      } catch (error) {
        console.error("❌ Failed to initialize notifications:", error);
      }
    };

    initNotifications();

    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome if not authenticated
      router.replace('/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);


  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
          }}
        >
          <Stack.Screen name="(auth)" options={{ animation: 'fade', headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade', headerShown: false }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </BottomSheetModalProvider>
      <Toaster theme={isDark ? "dark" : "light"} position="top-center" closeButton={true} toastOptions={{
        actionButtonStyle: {
          borderRadius: spacing.md,
        }
      }} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [frauncesLoaded, frauncesError] = useFraunces({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  const [dmSansLoaded, dmSansError] = useDMSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (frauncesLoaded && dmSansLoaded) {
      SplashScreen.hideAsync();
    }
  }, [frauncesLoaded, dmSansLoaded]);

  if (!frauncesLoaded || !dmSansLoaded) {
    if (frauncesError || dmSansError) {
      console.error('Error loading fonts', frauncesError, dmSansError);
    }
    return null;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutContent />
      </GestureHandlerRootView>
    </Provider>
  );
}
