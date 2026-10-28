import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AccentKey } from './theme';
import { BUILTIN_PROGRAMS, Program } from './data/programs';
import type { LevelKey } from './data/standards';
import type { Unit } from './lib/units';

export type SetLog = { reps: number; weight: number }; // weight is always stored in kg
export type ExerciseLog = { exerciseId: string; sets: SetLog[] };
export type Session = {
  id: string;
  programId: string;
  programName: string;
  endedAt: number;
  durationSec: number;
  exercises: ExerciseLog[];
};

export type Profile = {
  name: string;
  personalId: string; // assigned by the server when you create an account, never typed in by the user
  registered: boolean; // true once the personal ID came from a real account
  avatar: string; // icon name for the preset avatar
  unit: Unit;
  heightCm: number | null;
  bodyweightKg: number;
  maxes: Record<string, number>; // current 1RM per lift, kg
  goalLevel: LevelKey;
};

type Persisted = {
  accent: AccentKey;
  sessions: Session[]; // newest first
  customPrograms: Program[];
  profile: Profile;
  checkins: string[]; // days marked as workout days by hand, as YYYY-MM-DD
};

type Store = Persisted & {
  loaded: boolean;
  programs: Program[];
  bodyweight: number; // kg, shortcut for profile.bodyweightKg
  unit: Unit; // shortcut for profile.unit
  photo: string | null; // profile photo as a data URI, stored separately
  setPhoto: (uri: string | null) => void;
  setAccent: (a: AccentKey) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addSession: (s: Session) => void;
  deleteSession: (id: string) => void;
  addProgram: (p: Program) => void;
  deleteProgram: (id: string) => void;
  toggleCheckin: (dayKey: string) => void;
  resetAll: () => void;
};

const KEY = 'barbell-gym-v1';
const PHOTO_KEY = 'barbell-gym-photo';

const DEFAULT_PROFILE: Profile = {
  name: '',
  personalId: '',
  registered: false,
  avatar: 'person',
  unit: 'kg',
  heightCm: null,
  bodyweightKg: 80,
  maxes: {},
  goalLevel: 'advanced',
};

const DEFAULTS: Persisted = {
  accent: 'gold',
  sessions: [],
  customPrograms: [],
  profile: DEFAULT_PROFILE,
  checkins: [],
};

const StoreContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Persisted>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem(PHOTO_KEY)])
      .then(([raw, photoRaw]) => {
        let next: Persisted = DEFAULTS;
        if (raw) {
          try {
            const { bodyweight: legacyBodyweight, ...parsed } = JSON.parse(raw);
            const profile: Profile = { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) };
            if (!parsed.profile && typeof legacyBodyweight === 'number') profile.bodyweightKg = legacyBodyweight;
            next = {
              ...DEFAULTS,
              ...parsed,
              profile,
              checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
            };
          } catch {}
        }
        // IDs made on the phone in earlier versions were not unique, so only keep IDs from a real account
        if (!next.profile.registered && next.profile.personalId) {
          next = { ...next, profile: { ...next.profile, personalId: '' } };
        }
        if (photoRaw) setPhoto(photoRaw);
        setData(next);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (photo ? AsyncStorage.setItem(PHOTO_KEY, photo) : AsyncStorage.removeItem(PHOTO_KEY)).catch(() => {});
  }, [photo, loaded]);

  const value = useMemo<Store>(
    () => ({
      ...data,
      checkins: data.checkins ?? [],
      loaded,
      programs: [...BUILTIN_PROGRAMS, ...data.customPrograms],
      bodyweight: data.profile.bodyweightKg,
      photo,
      setPhoto,
      unit: data.profile.unit,
      setAccent: (accent) => setData((d) => ({ ...d, accent })),
      updateProfile: (patch) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
      addSession: (s) => setData((d) => ({ ...d, sessions: [s, ...d.sessions] })),
      deleteSession: (id) => setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) })),
      addProgram: (p) => setData((d) => ({ ...d, customPrograms: [...d.customPrograms, p] })),
      deleteProgram: (id) =>
        setData((d) => ({ ...d, customPrograms: d.customPrograms.filter((p) => p.id !== id) })),
      toggleCheckin: (key) =>
        setData((d) => ({
          ...d,
          checkins: d.checkins.includes(key) ? d.checkins.filter((k) => k !== key) : [...d.checkins, key],
        })),
      // Clears logged sessions, check-ins and custom protocols; keeps theme and your profile
      resetAll: () => setData((d) => ({ ...DEFAULTS, accent: d.accent, profile: d.profile })),
    }),
    [data, loaded, photo]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore must be used inside AppProvider');
  return v;
}
