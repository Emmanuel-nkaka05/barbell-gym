import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';
import { googleWebClientId } from './firebaseConfig';

/**
 * The Google sign-in module is native code. It does not exist inside Expo Go, only in a
 * development build. It is loaded lazily and inside try/catch so the app keeps working in Expo Go.
 */
function loadModule(): any | null {
  try {
    return require('@react-native-google-signin/google-signin');
  } catch {
    return null;
  }
}

const hasClientId = () => !!googleWebClientId && !googleWebClientId.startsWith('YOUR_');

/** True only in a development build with a Web client ID filled in. */
export const googleAvailable = () => hasClientId() && loadModule() !== null;

/** Returns true when signed in, false if the person closed the Google account picker. */
export async function signInWithGoogle(): Promise<boolean> {
  const mod = loadModule();
  if (!mod || !hasClientId()) {
    throw new Error('Google sign-in needs the development build and a Web client ID in lib/firebaseConfig.ts.');
  }
  const { GoogleSignin, statusCodes } = mod;

  GoogleSignin.configure({ webClientId: googleWebClientId });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  let res: any;
  try {
    res = await GoogleSignin.signIn();
  } catch (e: any) {
    if (e?.code === statusCodes?.SIGN_IN_CANCELLED) return false;
    throw e;
  }
  if (res?.type === 'cancelled') return false;

  // Newer versions return { data: { idToken } }, older ones return { idToken }
  const idToken = res?.data?.idToken ?? res?.idToken;
  if (!idToken) throw new Error('Google did not return a sign-in token. Please try again.');

  await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  return true;
}

/** Signs out of Google too, so the account picker shows again next time. */
export async function googleSignOut() {
  try {
    await loadModule()?.GoogleSignin?.signOut?.();
  } catch {}
}
