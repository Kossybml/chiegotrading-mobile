import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text } from 'react-native';

import { Button, Chip, Input, Muted, Row, Screen } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useMeta } from '@/lib/queries';
import { colors, space } from '@/lib/theme';
import { call, failure, success, whatsapp } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export default function Contact() {
  const { user } = useAuth();
  const { data: meta } = useMeta();
  const [f, setF] = useState({ name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(), email: user?.email ?? '', phone: user?.phone ?? '', message: '' });
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function send() {
    setBusy(true);
    setErrors({});
    try {
      await api('/contact/', { method: 'POST', auth: false, body: { ...f, topic: topic || meta?.contact_topics[0] } });
      success();
      Alert.alert('Message sent', 'Thank you. We will reply soon.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      failure();
      if (e instanceof ApiError) setErrors(e.fields ?? { message: [e.message] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      {meta ? (
        <Row style={{ gap: space.md, marginBottom: space.lg }}>
          <Button style={{ flex: 1 }} variant="secondary" icon="call" title="Call" onPress={() => call(meta.site.phone)} />
          <Button style={{ flex: 1 }} variant="lime" icon="logo-whatsapp" title="WhatsApp" onPress={() => whatsapp(meta.site.phone, 'Hello ChiegoTrading')} />
        </Row>
      ) : null}
      <Muted style={{ marginBottom: space.sm }}>Topic</Muted>
      <Row style={{ flexWrap: 'wrap', gap: 8, marginBottom: space.md }}>
        {meta?.contact_topics.map((t) => <Chip key={t} label={t} active={(topic || meta.contact_topics[0]) === t} onPress={() => setTopic(t)} />)}
      </Row>
      <Input label="Name" value={f.name} onChangeText={set('name')} error={errors.name?.[0]} />
      <Input label="Email" value={f.email} onChangeText={set('email')} error={errors.email?.[0]} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Phone (optional)" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <Input label="Message" value={f.message} onChangeText={set('message')} error={errors.message?.[0]} multiline style={{ minHeight: 120, textAlignVertical: 'top', paddingTop: 12 }} />
      {errors.topic ? <Text style={{ color: colors.danger }}>{errors.topic[0]}</Text> : null}
      <Button title="Send message" loading={busy} disabled={!f.name || !f.email || !f.message} onPress={send} />
    </Screen>
  );
}
