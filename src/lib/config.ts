import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string; eas?: { projectId?: string } };

export const config = {
  apiUrl: (process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || 'https://chiegotrading.com/api/v1').replace(/\/$/, ''),
  google: {
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  },
  easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || extra.eas?.projectId || '',
  paymentReturnPath: 'payment-complete',
};

export const googleEnabled = Boolean(config.google.web || config.google.ios || config.google.android);
