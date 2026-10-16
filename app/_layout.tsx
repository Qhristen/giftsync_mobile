import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'sonner-native';

import { useFeatureManifestSync } from '@/hooks/useFeatureFlags';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSocket } from '@/hooks/useSocket';
import { useTheme } from '@/hooks/useTheme';
import { notificationService } from '@/services/notificationService';
import { RootState, persistor, store } from '@/store';
import { notificationApi } from '@/store/api/notificationApi';
import { platformConfigApi } from '@/store/api/platformConfigApi';
import { useAppDispatch } from '@/store/hooks';
import { setConfigs } from '@/store/slices/configSlice';

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isDark, colors, spacing } = useTheme();

  const dispatch = useAppDispatch();
  const segments = useSegments();
  const router = useRouter();
  const firstSegment = segments[0];
  const secondSegment = segments[1];

  useSocket();
  useNetworkStatus();
  useFeatureManifestSync();

  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = firstSegment === '(auth)';
    const isPublicRoute = firstSegment === 'profile' && (secondSegment === 'terms' || secondSegment === 'privacy');

    if (!isAuthenticated && !inAuthGroup && !isPublicRoute) {
      router.replace('/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [firstSegment, isAuthenticated, isLoading, router, secondSegment]);

  useEffect(() => {
    if (!isAuthenticated) {
      notificationService.cleanup();
      return;
    }

    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(async () => {
      try {
        await notificationService.initialize();
        if (cancelled) {
          notificationService.cleanup();
          return;
        }

        const devicePushToken = notificationService.getDevicePushToken();
        const expoPushToken = notificationService.getPushToken();

        if (devicePushToken || expoPushToken) {
          const registration = dispatch(
            notificationApi.endpoints.registerDeviceToken.initiate({
              fcmToken: devicePushToken as string,
              expoToken: expoPushToken as string,
              deviceType: Platform.OS,
            }),
          );

          try {
            await registration.unwrap();
          } finally {
            registration.reset();
          }
        }
      } catch (error) {
        console.warn('Failed to initialize notifications:', error);
      }
    });

    return () => {
      cancelled = true;
      task.cancel();
      notificationService.cleanup();
    };
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(async () => {
      const configRequest = dispatch(
        platformConfigApi.endpoints.getPlatformConfig.initiate(undefined, { subscribe: false }),
      );

      try {
        const platformConfigs = await configRequest.unwrap();
        if (!cancelled && platformConfigs) {
          dispatch(setConfigs(platformConfigs));
        }
      } catch (error) {
        console.warn('Failed to fetch platform config:', error);
      } finally {
        configRequest.unsubscribe();
      }
    });

    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [dispatch, isAuthenticated]);

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

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsError, fontsLoaded]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  if (fontsError) {
    console.warn('Error loading fonts; using system fallbacks.', fontsError);
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
