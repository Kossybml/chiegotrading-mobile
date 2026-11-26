import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

/** true while the phone has a connection (updates live). */
export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const apply = (s: Network.NetworkState) => setOnline(s.isInternetReachable !== false && s.isConnected !== false);
    Network.getNetworkStateAsync().then(apply).catch(() => undefined);
    const sub = Network.addNetworkStateListener(apply);
    return () => sub.remove();
  }, []);
  return online;
}
