import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';

import { Body, Button, Card, EmptyState, H2, Input, Loading, Muted, Row, Screen, Stars } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useReviews } from '@/lib/queries';
import { colors, space } from '@/lib/theme';
import { failure, success, timeAgo } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export default function Reviews() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useReviews(slug);
  const mine = data?.results.find((r) => r.mine);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setTitle(mine.title);
      setBody(mine.body);
    }
  }, [mine?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['reviews', slug] });
    qc.invalidateQueries({ queryKey: ['product', slug] });
  };

  async function save() {
    setBusy(true);
    setError('');
    try {
      await api(`/products/${slug}/reviews/`, { method: 'POST', body: { rating, title, body } });
      success();
      refresh();
    } catch (e) {
      failure();
      setError(e instanceof ApiError ? (e.fields ? Object.values(e.fields)[0][0] : e.message) : 'Try again.');
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    Alert.alert('Delete your review?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api(`/products/${slug}/reviews/mine/`, { method: 'DELETE' }).catch(() => undefined);
          setRating(0);
          setTitle('');
          setBody('');
          refresh();
        },
      },
    ]);
  }

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Card style={{ marginBottom: space.lg }}>
        <H2>{mine ? 'Your review' : 'Write a review'}</H2>
        {user ? (
          <>
            <Row style={{ gap: 6, marginVertical: space.md }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} hitSlop={6} onPress={() => setRating(i)} accessibilityLabel={`${i} star${i > 1 ? 's' : ''}`}>
                  <Ionicons name={rating >= i ? 'star' : 'star-outline'} size={34} color={colors.star} />
                </Pressable>
              ))}
            </Row>
            <Input value={title} onChangeText={setTitle} placeholder="Headline (optional)" maxLength={120} />
            <Input value={body} onChangeText={setBody} placeholder="What did you think of it?" multiline style={{ minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }} />
            {error ? <Text style={{ color: colors.danger, marginBottom: space.md }}>{error}</Text> : null}
            <Button title={mine ? 'Update review' : 'Post review'} loading={busy} disabled={!rating || !body.trim()} onPress={save} />
            {mine ? <Button title="Delete my review" variant="ghost" onPress={remove} /> : null}
          </>
        ) : (
          <>
            <Muted style={{ marginVertical: space.md }}>Log in to share your experience.</Muted>
            <Button title="Log in" onPress={() => router.push({ pathname: '/login', params: { next: `/reviews/${slug}` } })} />
          </>
        )}
      </Card>

      {isLoading ? <Loading /> : !data?.results.length ? <EmptyState icon="chatbubble-outline" title="No reviews yet" text="Reviews from buyers will appear here." /> : null}
      {data?.results.map((r) => (
        <Card key={r.id} style={{ marginBottom: space.md, gap: 4 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Stars value={r.rating} />
            <Muted>{timeAgo(r.created)}</Muted>
          </Row>
          {r.title ? <Text style={{ fontWeight: '600', color: colors.greenDark }}>{r.title}</Text> : null}
          <Body style={{ fontSize: 14 }}>{r.body}</Body>
          <Muted>{r.author}{r.verified_purchase ? ' · Verified purchase' : ''}</Muted>
        </Card>
      ))}
    </Screen>
  );
}
