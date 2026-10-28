// Your Firebase project: barbell-gym-92896
//
// Most values below came from your google-services.json. TWO values are still placeholders and must
// come from a Firebase WEB app (not the Android app):
//   Firebase console > Project settings > General > Your apps > Add app > Web (</>) > Register
//   Then copy "apiKey" and "appId" from the config it shows.
//
// Do not use the apiKey from google-services.json. That key is the Android key and is usually
// restricted to Android apps, so the sign-in calls made by this app would be blocked.
export const firebaseConfig = {
  apiKey: 'AIzaSyCm4c0LZOQJvMUkr7zIbtYkCOx0Kd7f8JU', // <-- paste the WEB app apiKey
  authDomain: 'barbell-gym-92896.firebaseapp.com',
  projectId: 'barbell-gym-92896',
  storageBucket: 'barbell-gym-92896.firebasestorage.app',
  messagingSenderId: '225501997008',
  appId: '', // <-- paste the WEB app appId
};

// Google sign-in: the Web client ID from Authentication > Sign-in method > Google > Web SDK configuration.
export const googleWebClientId = '225501997008-btpv4arcja4qfncc85ln2d9p0gm314vi.apps.googleusercontent.com';

/** False until apiKey and projectId are real. The app still works offline when this is false. */
export const cloudConfigured =
  !firebaseConfig.apiKey.startsWith('YOUR_') && !firebaseConfig.projectId.startsWith('YOUR_');