import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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
};

const CloudContext = createContext<Cloud | null>(null);

export function CloudProvider({ children }: { children: React.ReactNode }) {
  const { profile, sessions, updateProfile, photo, setPhoto } = useStore();
  const [user, setUser] = useState<CloudUser | null>(null);
  const [ready, setReady] = useState(!cloudConfigured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef(profile.name);
  nameRef.current = profile.name;

  // Watch the sign-in state. When someone signs in, load (or create) their account and unique ID.
  useEffect(() => {
    if (!cloudConfigured) return;
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setReady(true);
        setBusy(false);
        return;
      }
      try {
        const fallback = nameRef.current || fbUser.displayName || (fbUser.email ?? 'Agent').split('@')[0];
        const info = await cloud.loadAccount(fbUser.uid, fbUser.email, fallback);
        setUser(info);
        setError(null);
        const patch: Partial<Profile> = { personalId: info.personalId, registered: true, name: info.name };
        // keep an avatar picked before signing in if the account has no avatar yet
        if (info.avatar && info.avatar !== 'person') patch.avatar = info.avatar;
        updateProfile(patch);
        // the photo saved with the account wins, so it is the same every time you log in
        if (info.photo) setPhoto(info.photo);
        cloud.touchLastSeen(fbUser.uid);
      } catch (e) {
        setError(cloud.friendlyError(e));
        setUser(null);
        await cloud.signOutNow().catch(() => {});
      }
      setReady(true);
      setBusy(false);
    });
  }, []);

  // Keep the leaderboard entry up to date after workouts, but only for people who joined.
  const showOnBoard = user?.showOnBoard ?? false;
  useEffect(() => {
    if (!user || !showOnBoard) return;
    const t = setTimeout(() => {
      cloud.publish(user.uid, buildEntry({ ...profile, personalId: user.personalId, name: user.name }, sessions)).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [user?.uid, showOnBoard, sessions[0]?.id, sessions.length, profile.bodyweightKg, profile.avatar, user?.name]);

  // Save a changed avatar icon with the account. At sign-in the phone takes the account's avatar
  // first, so the two match and nothing is overwritten.
  useEffect(() => {
    if (!user || profile.avatar === user.avatar) return;
    const next = profile.avatar;
    cloud
      .updateAvatar(user.uid, next)
      .then(() => setUser((u) => (u ? { ...u, avatar: next } : u)))
      .catch(() => {});
  }, [user?.uid, user?.avatar, profile.avatar]);

  // Save a new or removed profile photo with the account. Photos too big for the account stay on this phone.
  useEffect(() => {
    if (!user) return;
    const local = photo ?? '';
    if (local === user.photo || local.length > PHOTO_LIMIT) return;
    cloud
      .savePhoto(user.uid, local)
      .then(() => setUser((u) => (u ? { ...u, photo: local } : u)))
      .catch(() => {});
  }, [photo, user?.uid, user?.photo]);

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
      signOut: async () => {
        await cloud.signOutNow().catch(() => {});
        // the photo belongs to the account, so it must not show for the next person who signs in here
        setPhoto(null);
        updateProfile({ registered: false, personalId: '', avatar: 'person' });
      },
      setShowOnBoard: async (show) => {
        if (!user) return 'Sign in first.';
        try {
          await cloud.setShowOnBoard(user.uid, show);
          setUser({ ...user, showOnBoard: show });
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
          .then(() => setUser((u) => (u ? { ...u, name } : u)))
          .catch(() => {});
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
