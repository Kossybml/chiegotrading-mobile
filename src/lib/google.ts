import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

import { config, googleEnabled } from './config';

WebBrowser.maybeCompleteAuthSession();

/** Google sign-in via the system browser sheet. Calls `onToken` with the Google ID token, which the API verifies. */
export function useGoogleSignIn(onToken: (idToken: string) => void) {
  const [request, response, prompt] = Google.useIdTokenAuthRequest({
    webClientId: config.google.web || undefined,
    iosClientId: config.google.ios || undefined,
    androidClientId: config.google.android || undefined,
  });
  useEffect(() => {
    if (response?.type === 'success') {
      const token = (response.params as Record<string, string>).id_token ?? response.authentication?.idToken;
      if (token) onToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);
  return { enabled: googleEnabled, ready: !!request, start: () => prompt() };
}
