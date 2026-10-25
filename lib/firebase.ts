import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebaseConfig';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function makeAuth() {
  // Firebase has named its React Native "stay signed in" option differently across versions,
  // so look for either one instead of importing a name that might not exist.
  const fa = FirebaseAuth as any;
  try {
    const persistence = fa.getReactNativePersistence
      ? fa.getReactNativePersistence(AsyncStorage)
      : fa.reactNativeLocalPersistence;
    if (persistence) return FirebaseAuth.initializeAuth(app, { persistence });
  } catch {
    // already initialised (for example after a fast refresh), fall through
  }
  return FirebaseAuth.getAuth(app);
}

function makeDb() {
  try {
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return getFirestore(app);
  }
}

export const auth = makeAuth();
export const db = makeDb();
