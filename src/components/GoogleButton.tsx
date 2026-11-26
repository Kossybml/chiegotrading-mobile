import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/ui';
import { signInWith } from '@/lib/api';
import { googleEnabled } from '@/lib/config';
import { useGoogleSignIn } from '@/lib/google';
import type { User } from '@/lib/types';
import { failure } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

/** The Google hook throws without a client ID, so it only mounts when one is configured. */
export function GoogleButton(props: { role?: User['role']; onDone: () => void }) {
  return googleEnabled ? <GoogleButtonInner {...props} /> : null;
}

function GoogleButtonInner({ role = 'buyer', onDone }: { role?: User['role']; onDone: () => void }) {
  const { setSession } = useAuth();
  const [busy, setBusy] = useState(false);
  const google = useGoogleSignIn(async (idToken) => {
    setBusy(true);
    try {
      await setSession(await signInWith('/auth/google/', { id_token: idToken, role }));
      onDone();
    } catch (e: any) {
      failure();
      Alert.alert('Google sign-in failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  });
  return <Button title="Continue with Google" icon="logo-google" variant="secondary" loading={busy} disabled={!google.ready} onPress={google.start} />;
}
