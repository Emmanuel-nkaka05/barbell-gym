import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { useStore } from '../store';
import type { Profile } from '../store';
import { PHOTO_LIMIT } from './photo';
import { auth } from './firebase';
import { cloudConfigured } from './firebaseConfig';
import * as cloud from './cloud';
import type { CloudUser } from './cloud';
import { buildEntry } from './leaderboard';
import { googleAvailable, signInWithGoogle } from './googleSignIn';

type Cloud = {
  configured: boolean;
  ready: boolean; // sign-in state has been checked
  busy: boolean;
  error: string | null;
  user: CloudUser | null;
  /** each returns an error message, or null on success */
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  googleReady: boolean; // true only in a development build with Google set up
  signInGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  setShowOnBoard: (show: boolean) => Promise<string | null>;
  rename: (name: string) => void;
  /** removes the profile photo on this phone and from the account */
  removePhoto: () => Promise<void>;
};

const CloudContext = createContext<Cloud | null>(null);

// A saved copy of your account details, so the app can show you as signed in even with no internet.
const CACHE_KEY = 'barbell-gym-cloud-user';

const isOffline = (e: any) =>
  e?.code === 'unavailable' || /offline|network|unavailable|timed? ?out/i.test(String(e?.message ?? ''));

const saveCache = (u: CloudUser) =>
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...u, photo: '' })).catch(() => {});

export function CloudProvider({ children }: { children: React.ReactNode }) {
  const { profile, sessions, updateProfile, photo, setPhoto, loaded } = useStore();
  const [user, setUser] = useState<CloudUser | null>(null);
  const [synced, setSynced] = useState(false); // true once the account was loaded from the server
  const [needsSync, setNeedsSync] = useState(false); // signed in, but the server has not answered yet
  const [ready, setReady] = useState(!cloudConfigured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef(profile.name);
  nameRef.current = profile.name;

  /**
   * Loads the account from the server. Never signs anyone out: a network problem
   * (offline, slow start-up) only means we try again later.
   */
  const syncAccount = async (fbUser: FirebaseUser): Promise<{ status: 'ok' | 'offline' | 'failed'; error?: any }> => {
    try {
      const fallback = nameRef.current || fbUser.displayName || (fbUser.email ?? 'Agent').split('@')[0];
      const info = await cloud.loadAccount(fbUser.uid, fbUser.email, fallback);
      setUser(info);
      setSynced(true);
      setNeedsSync(false);
      setError(null);

      const patch: Partial<Profile> = { personalId: info.personalId, registered: true, name: info.name };
      // keep an avatar picked before signing in if the account has no avatar yet
      if (info.avatar && info.avatar !== 'person') patch.avatar = info.avatar;
      updateProfile(patch);
      // the photo saved with the account wins, so it is the same every time you log in
      if (info.photo) setPhoto(info.photo);

      saveCache(info);
      cloud.touchLastSeen(fbUser.uid);
      return { status: 'ok' };
    } catch (e) {
      return { status: isOffline(e) ? 'offline' : 'failed', error: e };
    }
  };
  const syncRef = useRef(syncAccount);
  syncRef.current = syncAccount;

  // Watch the sign-in state. Firebase restores a saved sign-in by itself when the app opens.
  useEffect(() => {
    if (!cloudConfigured) return;
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setSynced(false);
        setNeedsSync(false);
        setReady(true);
        setBusy(false);
        return;
      }

      // 1. Show the signed-in state at once from the saved copy, so being offline never logs you out.
      let cached: CloudUser | null = null;
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        const parsed = raw ? (JSON.parse(raw) as CloudUser) : null;
        if (parsed && parsed.uid === fbUser.uid) cached = parsed;
      } catch {}
      if (cached) {
        setUser(cached);
        setReady(true);
      }

      // 2. Then refresh from the server.
      const res = await syncRef.current(fbUser);
      if (res.status === 'offline') {
        setNeedsSync(true); // try again later, stay signed in
        if (!cached) setError('No connection yet. You are signed in, and your details load as soon as you are back online.');
      } else if (res.status === 'failed') {
        if (cached) {
          setNeedsSync(true); // keep the saved details and try again later
        } else {
          // A real problem on the very first sign-in (for example the rules or the ID counter).
          // Sign out only in this case, so the message is clear instead of a half-finished account.
          setError(cloud.friendlyError(res.error));
          setUser(null);
          await cloud.signOutNow().catch(() => {});
        }
      }
      setReady(true);
      setBusy(false);
    });
  }, []);

  // While the server has not answered, try again every 15 seconds and whenever the app comes to the front.
  useEffect(() => {
    if (!cloudConfigured || !needsSync) return;
    const retry = () => {
      const u = auth.currentUser;
      if (u) {
        syncRef.current(u).then((r) => {
          if (r.status === 'ok') setBusy(false);
        });
      }
    };
    const timer = setInterval(retry, 15000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') retry();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [needsSync]);

  // Keep the leaderboard entry up to date after workouts, but only for people who joined.
  const showOnBoard = user?.showOnBoard ?? false;
  useEffect(() => {
    if (!user || !showOnBoard) return;
    const t = setTimeout(() => {
      cloud.publish(user.uid, buildEntry({ ...profile, personalId: user.personalId, name: user.name }, sessions)).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [user?.uid, showOnBoard, synced, sessions[0]?.id, sessions.length, profile.bodyweightKg, profile.avatar, user?.name]);

  // Save a changed avatar icon with the account. Only once the account has loaded from the server,
  // so a saved copy can never overwrite the real one.
  useEffect(() => {
    if (!user || !synced || profile.avatar === user.avatar) return;
    const next = profile.avatar;
    cloud
      .updateAvatar(user.uid, next)
      .then(() => setUser((u) => (u ? { ...u, avatar: next } : u)))
      .catch(() => {});
  }, [user?.uid, user?.avatar, profile.avatar, synced]);

  // Save a new profile photo with the account. Photos too big for the account stay on this phone.
  // An empty photo is never uploaded here, so signing out or an early start-up can never wipe the saved one.
  // Removing a photo is done on purpose with removePhoto().
  useEffect(() => {
    if (!user || !synced || !loaded) return;
    const local = photo ?? '';
    if (!local || local === user.photo || local.length > PHOTO_LIMIT) return;
    cloud
      .savePhoto(user.uid, local)
      .then(() => setUser((u) => (u ? { ...u, photo: local } : u)))
      .catch(() => {});
  }, [photo, user?.uid, user?.photo, synced, loaded]);

  const value = useMemo<Cloud>(
    () => ({
      configured: cloudConfigured,
      ready,
      busy,
      error,
      user,
      signUp: async (email, password, name) => {
        setError(null);
        setBusy(true);
        nameRef.current = name;
        try {
          await cloud.emailSignUp(email, password);
          return null; // the listener above finishes setting up the account
        } catch (e) {
          setBusy(false);
          return cloud.friendlyError(e);
        }
      },
      signIn: async (email, password) => {
        setError(null);
        setBusy(true);
        try {
          await cloud.emailSignIn(email, password);
          return null;
        } catch (e) {
          setBusy(false);
          return cloud.friendlyError(e);
        }
      },
      googleReady: googleAvailable(),
      signInGoogle: async () => {
        setError(null);
        setBusy(true);
        try {
          const ok = await signInWithGoogle();
          if (!ok) setBusy(false); // closed the picker; nothing else to do
          return null; // on success the listener above finishes setting up the account
        } catch (e) {
          setBusy(false);
          return cloud.friendlyError(e);
        }
      },
      // Only an explicit tap on Sign out ends the session.
      signOut: async () => {
        await cloud.signOutNow().catch(() => {});
        AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
        // the photo belongs to the account, so it must not show for the next person who signs in here
        setPhoto(null);
        updateProfile({ registered: false, personalId: '', avatar: 'person' });
      },
      setShowOnBoard: async (show) => {
        if (!user) return 'Sign in first.';
        try {
          await cloud.setShowOnBoard(user.uid, show);
          const next = { ...user, showOnBoard: show };
          setUser(next);
          saveCache(next);
          if (show) {
            await cloud.publish(user.uid, buildEntry({ ...profile, personalId: user.personalId, name: user.name }, sessions));
          }
          return null;
        } catch (e) {
          return cloud.friendlyError(e);
        }
      },
      rename: (name) => {
        if (!user) return;
        cloud
          .renameAccount(user.uid, name)
          .then(() =>
            setUser((u) => {
              if (!u) return u;
              const next = { ...u, name };
              saveCache(next);
              return next;
            })
          )
          .catch(() => {});
      },
      removePhoto: async () => {
        setPhoto(null);
        if (!user) return;
        try {
          await cloud.savePhoto(user.uid, '');
          setUser((u) => (u ? { ...u, photo: '' } : u));
        } catch {}
      },
    }),
    [ready, busy, error, user, profile, sessions]
  );

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}

export function useCloud(): Cloud {
  const v = useContext(CloudContext);
  if (!v) throw new Error('useCloud must be used inside CloudProvider');
  return v;
}
