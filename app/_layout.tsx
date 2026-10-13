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
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { useTheme } from '@/hooks/useTheme';
import { persistor, store } from '@/store';
import 'react-native-reanimated';
import { Toaster } from 'sonner-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSocket } from '@/hooks/useSocket';
import notificationService from '@/services/notificationService';
import { RootState } from '@/store';
import { useRegisterDeviceTokenMutation } from '@/store/api/notificationApi';
import { useAppDispatch } from '@/store/hooks';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

function RootLayoutContent() {
  const { isDark, colors, spacing } = useTheme();

  const dispatch = useAppDispatch();
  const segments = useSegments();
  const router = useRouter();

  useSocket();
  useNetworkStatus();

  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [registerDeviceToken] = useRegisterDeviceTokenMutation()
  const [getPlatformConfig] = useLazyGetPlatformConfigQuery();

  useEffect(() => {

    const inAuthGroup = segments[0] === '(auth)';
    const isPublicRoute = segments[0] === 'profile' && (segments[1] === 'terms' || segments[1] === 'privacy');

    // Initialize authentication routing logic
    if (!isAuthenticated && !inAuthGroup && !isPublicRoute) {
      router.replace('/welcome');
    }

    // Initialize authenticated routing logic
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');

    }

    // Initialize notification service
    initNotifications();

    // Initialize platform config
    fetchPlatformConfig();
    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };


  }, [isAuthenticated, dispatch]);


  const initNotifications = async () => {
    try {
      await notificationService.initialize();
      console.log("🔔 Notification service ready");

      // If already authenticated, sync token
      if (isAuthenticated) {
        syncDeviceToken();
      }
    } catch (error) {
      console.log("❌ Failed to initialize notifications:", error);
    }
  };



  const fetchPlatformConfig = async () => {
    try {
      const platformConfigs = await getPlatformConfig().unwrap();
      if (platformConfigs) {
        dispatch(setConfigs(platformConfigs));
      }
    } catch (error) {
      console.error("❌ Failed to fetch platform config:", error);
    }
  };


  const syncDeviceToken = async () => {
    const status = await notificationService.getNotificationStatus();

    if (status.devicePushToken || status.expoPushToken) {
      try {
        await registerDeviceToken({
          fcmToken: status.devicePushToken as string,
          expoToken: status.expoPushToken as string,
          deviceType: Platform.OS.toString()
        }).unwrap();
        console.log("✅ Device token synced with server");
      } catch (error) {
        console.log("❌ Failed to sync device token:", error);
      }
    }
  };



  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Protected guard={!isLoading && isAuthenticated}>
            <Stack.Screen name="(tabs)" options={{ animation: 'fade', headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!isLoading && !isAuthenticated}>
            <Stack.Screen name="(auth)" options={{ animation: 'fade', headerShown: false }} />
          </Stack.Protected>
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </BottomSheetModalProvider>
      <Toaster theme={isDark ? "dark" : "light"} position="top-center" toastOptions={{
        actionButtonStyle: {
          borderRadius: spacing.md,
        }
      }} />
    </ThemeProvider>
  );
}

import { useLazyGetPlatformConfigQuery } from '@/store/api/platformConfigApi';
import { setConfigs } from '@/store/slices/configSlice';
import { KeyboardProvider } from 'react-native-keyboard-controller';


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
      <PersistGate loading={null} persistor={persistor}>
        <KeyboardProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutContent />
          </GestureHandlerRootView>
        </KeyboardProvider>
      </PersistGate>
    </Provider>
  );
}
