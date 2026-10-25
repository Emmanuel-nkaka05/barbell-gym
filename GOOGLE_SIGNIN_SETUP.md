# Google sign-in setup (Android)

Google sign-in uses native code, so it does NOT work in Expo Go. You need a **development build**:
your own copy of the Expo Go app with your project's native pieces inside. It looks and works the
same, you just open it instead of Expo Go. Email/password sign-in keeps working everywhere.

You need: a free Expo account (expo.dev) and the Firebase project you already made.

## 1. Install the packages

```
npx expo install expo-dev-client @react-native-google-signin/google-signin
npm install -g eas-cli
```

## 2. Edit app.json

Inside the existing `"expo"` object, add or merge these. Pick your own package name.
It must be unique and lowercase, for example `com.emmanuelnkaka.barbellgym`.

```json
"android": {
  "package": "com.yourname.barbellgym",
  "googleServicesFile": "./google-services.json"
},
"plugins": [
  "@react-native-google-signin/google-signin"
]
```

If `"android"` or `"plugins"` already exist, add to them instead of making a second copy.

## 3. Log in to Expo and set up builds

```
eas login
eas build:configure
```

Choose Android when asked. This creates `eas.json`. Make sure it has a `development` profile:

```json
"development": {
  "developmentClient": true,
  "distribution": "internal"
}
```

## 4. Get your SHA-1 key

Google only trusts apps whose signing key it knows.

```
eas credentials -p android
```

Pick the **development** profile. If there is no keystore yet, let EAS generate one.
Then choose the option that shows the keystore details and copy the **SHA1 Fingerprint**.

## 5. Register the Android app in Firebase

1. Firebase console > Project settings > Your apps > **Add app** > Android.
2. Package name: exactly what you put in app.json.
3. Add the SHA-1 from step 4 (Project settings > your Android app > Add fingerprint).
4. Download **google-services.json** and put it in your project root, next to package.json.

## 6. Turn on Google in Firebase

1. Authentication > Sign-in method > **Google** > Enable > Save.
2. Open the Google provider again and expand **Web SDK configuration**.
3. Copy the **Web client ID** (it ends in `.apps.googleusercontent.com`).
4. Paste it into `googleWebClientId` in `lib/firebaseConfig.ts`.

Download google-services.json again after enabling Google if the first copy was made before.

## 7. Build and install

```
eas build --profile development --platform android
```

When the build finishes, open the link on your phone, download the APK and install it
(allow "install unknown apps" if asked). Then start the project with:

```
npx expo start --dev-client
```

Open the new app on your phone and scan the QR code, like you did with Expo Go.
**Continue with Google** now appears on the Sign in screen.

## If it fails

- **"Google sign-in is not set up correctly" / DEVELOPER_ERROR:** the SHA-1 or package name in
  Firebase does not match the build, or the Web client ID is wrong. Fix it, download a fresh
  google-services.json, and build again.
- **No Google button:** you are in Expo Go, the Web client ID is still the placeholder, or the
  package is not installed.
- **Rebuild needed:** any change to app.json, plugins or google-services.json needs a new build.
  Changes to normal code do not.
