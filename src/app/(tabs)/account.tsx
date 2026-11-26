import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import Constants from 'expo-constants';

import { Avatar, Button, Card, H2, ListItem, Muted, Row, Screen } from '@/components/ui';
import { space } from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useMeta } from '@/lib/queries';
import { call, email, openMap, whatsapp } from '@/lib/utils';

export default function Account() {
  const { user, signOut } = useAuth();
  const { data: meta } = useMeta();
  const go = (p: any) => () => router.push(p);

  return (
    <Screen>
      {user ? (
        <Card style={{ marginBottom: space.lg }}>
          <Row style={{ gap: space.md }}>
            <Avatar uri={user.avatar} initials={user.initials} size={64} />
            <View style={{ flex: 1 }}>
              <H2>{`${user.first_name} ${user.last_name}`.trim() || 'Your account'}</H2>
              <Muted>{user.email}</Muted>
              {user.is_seller ? <Muted>{user.verified_seller ? 'Verified seller' : 'Seller'}</Muted> : null}
            </View>
          </Row>
        </Card>
      ) : (
        <Card style={{ marginBottom: space.lg, gap: space.md }}>
          <H2>Welcome to ChiegoTrading</H2>
          <Muted>Log in to track orders, review products and sell.</Muted>
          <Button title="Log in" onPress={go('/login')} />
          <Button title="Create an account" variant="secondary" onPress={go('/register')} />
        </Card>
      )}

      <Card style={{ padding: 0, marginBottom: space.lg }}>
        {user ? (
          <>
            <ListItem icon="person-outline" title="Edit profile" onPress={go('/account/edit')} />
            <ListItem icon="shield-checkmark-outline" title="Security" subtitle="App lock, password" onPress={go('/account/security')} />
            <ListItem icon="storefront-outline" title={user.is_seller ? 'Seller dashboard' : 'Become a seller'} onPress={go('/seller')} />
          </>
        ) : null}
        <ListItem icon="settings-outline" title="Settings" subtitle="Currency, notifications" onPress={go('/account/settings')} />
      </Card>

      <Card style={{ padding: 0, marginBottom: space.lg }}>
        <ListItem icon="chatbubbles-outline" title="Contact us" onPress={go('/contact')} />
        {meta ? (
          <>
            <ListItem icon="call-outline" title="Call us" subtitle={meta.site.phone} onPress={() => call(meta.site.phone)} />
            <ListItem icon="logo-whatsapp" title="WhatsApp" onPress={() => whatsapp(meta.site.phone, 'Hello ChiegoTrading')} />
            <ListItem icon="mail-outline" title="Email" subtitle={meta.site.email} onPress={() => email(meta.site.email)} />
            <ListItem icon="location-outline" title="Find us" subtitle={meta.site.address} onPress={() => openMap(meta.site.address)} />
          </>
        ) : null}
      </Card>

      <Card style={{ padding: 0, marginBottom: space.lg }}>
        <ListItem icon="document-text-outline" title="Terms of service" onPress={go({ pathname: '/legal/[slug]', params: { slug: 'terms-and-conditions' } })} />
        <ListItem icon="lock-closed-outline" title="Privacy policy" onPress={go({ pathname: '/legal/[slug]', params: { slug: 'privacy-policy' } })} />
      </Card>

      {user ? (
        <Button title="Log out" variant="secondary" icon="log-out-outline" onPress={() => Alert.alert('Log out?', undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: () => signOut().then(() => router.replace('/(tabs)')) }])} />
      ) : null}
      <Muted style={{ textAlign: 'center', marginTop: space.lg }}>ChiegoTrading {Constants.expoConfig?.version} · RC-1903359</Muted>
    </Screen>
  );
}
