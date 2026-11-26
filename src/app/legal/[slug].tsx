import { Stack, useLocalSearchParams } from 'expo-router';

import { Body, ErrorState, H1, Loading, Muted, Screen } from '@/components/ui';
import { useLegal } from '@/lib/queries';
import { dateLabel, stripHtml } from '@/lib/utils';

export default function Legal() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useLegal(slug);
  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message="Could not load this page." onRetry={refetch} />;
  return (
    <Screen>
      <Stack.Screen options={{ title: data.title }} />
      <H1>{data.title}</H1>
      <Muted>Updated {dateLabel(data.updated)}</Muted>
      <Body style={{ marginTop: 16 }}>{stripHtml(data.content)}</Body>
    </Screen>
  );
}
