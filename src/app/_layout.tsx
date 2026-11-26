import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockScreen } from '@/components/LockScreen';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ApiError } from '@/lib/api';
import { colors } from '@/lib/theme';
import { useNotificationTaps, usePushSetup } from '@/hooks/useNotifications';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { CurrencyProvider } from '@/providers/CurrencyProvider';
import '@/lib/push'; // registers the foreground notification handler

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (n, e) => !(e instanceof ApiError && e.status > 0 && e.status < 500) && n < 2, // don't retry 4xx
    },
  },
});

function Shell() {
  const { user, loading, locked } = useAuth();
  usePushSetup(user);
  useNotificationTaps();
  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => undefined);
  }, [loading]);
  if (loading) return null;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.greenDark,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="product/[slug]" options={{ title: '' }} />
        <Stack.Screen name="reviews/[slug]" options={{ title: 'Reviews' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="order/[reference]" options={{ title: 'Order' }} />
        <Stack.Screen name="account/edit" options={{ title: 'Edit profile' }} />
        <Stack.Screen name="account/security" options={{ title: 'Security' }} />
        <Stack.Screen name="account/settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="contact" options={{ title: 'Contact us' }} />
        <Stack.Screen name="legal/[slug]" options={{ title: '' }} />
        <Stack.Screen name="seller/index" options={{ title: 'My listings' }} />
        <Stack.Screen name="seller/listing" options={{ title: 'Listing' }} />
        <Stack.Screen name="seller/sales" options={{ title: 'My sales' }} />
      </Stack>
      <OfflineBanner />
      {locked ? <LockScreen /> : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <Shell />
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
