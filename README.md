# ChiegoTrading Mobile

iOS and Android app for [ChiegoTrading](https://chiegotrading.com) (natural water, juices, herbal and agro goods, Warri, Nigeria). Built with Expo SDK 58, React Native and expo-router. It talks to the Django REST API (`/api/v1/`, docs at `/api/v1/docs/`).

## Native features

| Feature | Module |
|---|---|
| Secure login tokens (Keychain / Keystore) | `expo-secure-store` |
| Face ID / fingerprint app lock (re-locks after 60 s in background) | `expo-local-authentication` |
| Push notifications (order paid, shipped, delivered) with tap-to-open | `expo-notifications`, `expo-device` |
| Camera and gallery for profile photo and seller listings | `expo-image-picker` |
| Paystack checkout in the in-app browser, returns by deep link | `expo-web-browser` |
| Deep links `chiegotrading://` and `https://chiegotrading.com/shop/<slug>/` | `expo-router`, `+native-intent.tsx` |
| Google sign-in | `expo-auth-session`, `expo-crypto` |
| Haptic feedback | `expo-haptics` |
| Offline banner | `expo-network` |
| Native share sheet, copy order reference | `Share`, `expo-clipboard` |
| Call, WhatsApp, email, maps shortcuts | `Linking` |
| Starting currency from phone region | `expo-localization` |
| Store rating prompt after first payment | `expo-store-review` |
| Offline cart | `@react-native-async-storage/async-storage` |

Screens: onboarding, login/register/OTP verify/forgot/reset, home, shop (search, filters, infinite scroll), product, reviews, cart, checkout, orders, order detail, profile, security (app lock, password, delete account), settings (currency, notifications), contact, legal pages, seller dashboard, listings (with photo), sales.

## Setup

```bash
npm install
cp .env.example .env     # set EXPO_PUBLIC_API_URL and Google client IDs
npx expo start
```

Push, Face ID and Google sign-in need a **development build** (they do not work in Expo Go):

```bash
npm i -g eas-cli
eas init                 # put the project id in EXPO_PUBLIC_EAS_PROJECT_ID
eas build --profile development --platform android   # or ios
```

## Server settings (website `.env`)

- `MOBILE_PAYMENT_RETURN_URL=chiegotrading://payment-complete`
- `GOOGLE_API_CLIENT_IDS=<web>,<ios>,<android>` (same IDs as in this app's `.env`)
- Paystack keys as on the website.

For universal links, host `apple-app-site-association` and `assetlinks.json` on chiegotrading.com.

## Checks

`npx tsc --noEmit` and `npx expo export --platform android` both pass. Not yet run on a device.
