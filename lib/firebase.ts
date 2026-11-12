import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebaseConfig';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** True when Firebase is saving the sign-in on the phone, so it survives closing the app. */
export const authPersists = (): boolean => !!(globalThis as any).__authPersists;

function makeAuth() {
  // Firebase has named its React Native "stay signed in" option differently across versions,
  // so look for either one instead of importing a name that might not exist.
  const fa = FirebaseAuth as any;
  try {
    const persistence = fa.getReactNativePersistence
      ? fa.getReactNativePersistence(AsyncStorage)
      : fa.reactNativeLocalPersistence;
    if (persistence) {
      const created = FirebaseAuth.initializeAuth(app, { persistence });
      (globalThis as any).__authPersists = true;
      return created;
    }
    console.warn('Firebase auth persistence was not found, so sign-in will not be saved on this phone.');
  } catch {
    // already initialised (for example after a fast refresh): keep what was recorded the first time
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
