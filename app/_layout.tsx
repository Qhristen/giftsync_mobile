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
import { Stack } from 'expo-router';
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

function RootLayoutContent() {
  const { scheme, isDark, spacing } = useTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
