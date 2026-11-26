import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { colors } from '@/lib/theme';
import { useCart } from '@/providers/CartProvider';
import type { IconName } from '@/components/ui';

const icon = (on: IconName, off: IconName) => ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => <Ionicons name={focused ? on : off} size={size} color={color as string} />;

export default function TabsLayout() {
  const { count } = useCart();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600', color: colors.greenDark },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', headerShown: false, tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', headerShown: false, tabBarIcon: icon('storefront', 'storefront-outline') }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: icon('cart', 'cart-outline'), tabBarBadge: count ? Math.min(count, 99) : undefined, tabBarBadgeStyle: { backgroundColor: colors.red } }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: icon('receipt', 'receipt-outline') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('person', 'person-outline') }} />
    </Tabs>
  );
}
