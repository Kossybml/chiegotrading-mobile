import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { KEYS, store } from '@/lib/storage';

/** First launch shows the welcome screens; after that straight to the shop. */
export default function Index() {
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    store.get(KEYS.onboarded, false).then(setSeen);
  }, []);
  if (seen === null) return null;
  return <Redirect href={seen ? '/(tabs)' : '/onboarding'} />;
}
