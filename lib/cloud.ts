import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { hasAnyLift } from './leaderboard';
import { googleSignOut } from './googleSignIn';

export type CloudUser = {
  uid: string;
  email: string | null;
  personalId: string;
  name: string;
  isAdmin: boolean;
  showOnBoard: boolean;
  avatar: string; // icon avatar saved with the account
  photo: string; // profile photo as a small data URI, or '' when there is none
};

export function friendlyError(e: any): string {
  switch (e?.code) {
    case 'auth/email-already-in-use':
      return 'That email already has an account. Try signing in instead.';
    case 'auth/invalid-email':
      return 'That email address does not look right.';
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Check your network and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'This email already has an account with a password. Sign in with your email and password instead.';
    case 'DEVELOPER_ERROR':
      return 'Google sign-in is not set up correctly. Check the SHA-1 key and Web client ID in Firebase, then rebuild.';
    case 'permission-denied':
      return 'The server refused this. Check that your Firestore rules are published.';
    default:
      return e?.message ? String(e.message) : 'Something went wrong. Please try again.';
  }
}

export const emailSignUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email.trim(), password);

export const emailSignIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export const signOutNow = async () => {
  await googleSignOut();
  await fbSignOut(auth);
};

/**
 * Gives a new user the next number from meta/counter (GK-1000, GK-1001, ...).
 * The counter and the user document are written in ONE transaction, so two users can never get the same ID.
 * The Firestore rules check this too. GK-9999 is reserved for the admin.
 */
async function mintAccount(uid: string, name: string) {
  const counterRef = doc(db, 'meta', 'counter');
  const userRef = doc(db, 'users', uid);
  return runTransaction(db, async (tx) => {
    const existing = await tx.get(userRef);
    if (existing.exists()) return existing.data() as { personalId: string; name: string; showOnBoard?: boolean };

    const counter = await tx.get(counterRef);
    if (!counter.exists()) {
      throw new Error('Setup incomplete: create the document meta/counter with a number field "next" = 1000.');
    }
    const next = counter.data().next as number;
    const personalId = `GK-${next}`;

    tx.update(counterRef, { next: next + 1 });
    tx.set(userRef, {
      personalId,
      name: name.slice(0, 40),
      avatar: 'person',
      createdAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      showOnBoard: false,
    });
    return { personalId, name: name.slice(0, 40), showOnBoard: false };
  });
}

/** Loads the account, creating it (and its unique ID) the first time. Safe to call repeatedly. */
export async function loadAccount(uid: string, email: string | null, fallbackName: string): Promise<CloudUser> {
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.exists()
    ? (snap.data() as { personalId: string; name: string; showOnBoard?: boolean })
    : await mintAccount(uid, fallbackName);
  const admin = await getDoc(doc(db, 'admins', uid));
  return {
    uid,
    email,
    personalId: data.personalId,
    name: data.name,
    isAdmin: admin.exists(),
    showOnBoard: !!data.showOnBoard,
    avatar: (data as any).avatar ?? 'person',
    photo: (data as any).photo ?? '',
  };
}

export const touchLastSeen = (uid: string) =>
  updateDoc(doc(db, 'users', uid), { lastSeenAt: serverTimestamp() }).catch(() => {});

export const renameAccount = (uid: string, name: string) =>
  updateDoc(doc(db, 'users', uid), { name: name.slice(0, 40) });

export const updateAvatar = (uid: string, avatar: string) =>
  updateDoc(doc(db, 'users', uid), { avatar }).catch(() => {});

/** Saves the profile photo with the account. Pass '' to remove it. */
export const savePhoto = (uid: string, photo: string) => updateDoc(doc(db, 'users', uid), { photo });

export async function setShowOnBoard(uid: string, show: boolean) {
  await updateDoc(doc(db, 'users', uid), { showOnBoard: show });
  if (!show) await deleteDoc(doc(db, 'leaderboard', uid)).catch(() => {});
}

export async function publish(uid: string, entry: Record<string, any>) {
  if (!hasAnyLift(entry)) return; // nothing to show yet
  await setDoc(doc(db, 'leaderboard', uid), { ...entry, updatedAt: serverTimestamp() });
}

export async function fetchBoard(field: string) {
  const q = query(collection(db, 'leaderboard'), where(field, '>', 0), orderBy(field, 'desc'), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Record<string, any>) }));
}

async function countOf(q: any): Promise<number> {
  try {
    return (await getCountFromServer(q)).data().count;
  } catch {
    return (await getDocs(q)).size; // fallback for small user bases
  }
}

/** Admin dashboard numbers. The Firestore rules only allow this for accounts listed in "admins". */
export async function adminStats() {
  const users = collection(db, 'users');
  const now = Date.now();
  const since = (ms: number) => Timestamp.fromMillis(now - ms);

  const [total, day, week, onBoard, recentSnap] = await Promise.all([
    countOf(users),
    countOf(query(users, where('lastSeenAt', '>=', since(24 * 3600 * 1000)))),
    countOf(query(users, where('lastSeenAt', '>=', since(7 * 24 * 3600 * 1000)))),
    countOf(collection(db, 'leaderboard')),
    getDocs(query(users, orderBy('createdAt', 'desc'), limit(20))),
  ]);

  const recent = recentSnap.docs.map((d) => {
    const x = d.data() as any;
    return {
      uid: d.id,
      name: x.name as string,
      personalId: x.personalId as string,
      createdAt: x.createdAt?.toMillis?.() as number | undefined,
      lastSeenAt: x.lastSeenAt?.toMillis?.() as number | undefined,
    };
  });

  return { total, active24h: day, active7d: week, onBoard, recent };
}
