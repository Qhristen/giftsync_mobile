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
import { DarkTheme, DefaultTheme, Redirect, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { useTheme } from '@/hooks/useTheme';
import { persistor, store } from '@/store';
import 'react-native-reanimated';
import { Toaster } from 'sonner-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { useChatSocket } from '@/hooks/useChatSocket';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import notificationService from '@/services/notificationService';
import { RootState } from '@/store';
import { useRegisterDeviceTokenMutation } from '@/store/api/notificationApi';
import { useLazyGetProfileQuery } from '@/store/api/userApi';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { tokenCache } from '@/utils/cache';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

function RootLayoutContent() {
  const { isDark, colors, spacing } = useTheme();

  const dispatch = useAppDispatch();
  const segments = useSegments();
  const router = useRouter();

  useChatSocket();
  useNetworkStatus();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [getProfile] = useLazyGetProfileQuery();
  const [registerDeviceToken] = useRegisterDeviceTokenMutation()
  const [getPlatformConfig] = useLazyGetPlatformConfigQuery();

  useEffect(() => {
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
    fetchPlatformConfig();
  }, [isAuthenticated, dispatch]);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
        console.error("❌ Failed to sync device token:", error);
      }
    }
  };

  useEffect(() => {

    const checkAuthStatus = async () => {
      try {

        const storedAccessToken = await tokenCache.get('accessToken');
        if (storedAccessToken) {
          console.log(storedAccessToken, "storedAccessToken")
          await getProfile()
        } else {
          dispatch(logout());
          await tokenCache.remove('accessToken');
          await tokenCache.remove('refreshToken');
        }
      } catch (error) {
        console.log('Auth check error:', error);
        dispatch(logout());
        await tokenCache.remove('accessToken');
        await tokenCache.remove('refreshToken');
            } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
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
  }, [isAuthenticated]);


  // Root authentication routing logic - handled in render to prevent glitch
  const inAuthGroup = segments[0] === '(auth)';
  const isPublicRoute = segments[0] === 'profile' && (segments[1] === 'terms' || segments[1] === 'privacy');

  if (!isCheckingAuth) {
    if (!isAuthenticated && !inAuthGroup && !isPublicRoute) {
      return <Redirect href="/welcome" />;
    }
    if (isAuthenticated && inAuthGroup) {
      return <Redirect href="/(tabs)" />;
    }
  }

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
          }}
        >
          <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade', headerShown: false }} />
          </Stack.Protected>
          <Stack.Screen name="(auth)" options={{ animation: 'fade', headerShown: false }} />
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
