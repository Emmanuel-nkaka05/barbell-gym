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
  personalId: string;
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
};

type Store = Persisted & {
  loaded: boolean;
  programs: Program[];
  bodyweight: number; // kg, shortcut for profile.bodyweightKg
  unit: Unit; // shortcut for profile.unit
  setAccent: (a: AccentKey) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addSession: (s: Session) => void;
  deleteSession: (id: string) => void;
  addProgram: (p: Program) => void;
  deleteProgram: (id: string) => void;
  resetAll: () => void;
  
};

const KEY = 'barbell-gym-v1';

const DEFAULT_PROFILE: Profile = {
  name: '',
  personalId: '',
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
};

export const makeId = () => `GK-${Math.floor(1000 + Math.random() * 9000)}`;

const StoreContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Persisted>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        let next: Persisted = DEFAULTS;
        if (raw) {
          try {
            const { bodyweight: legacyBodyweight, ...parsed } = JSON.parse(raw);
            const profile: Profile = { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) };
            if (!parsed.profile && typeof legacyBodyweight === 'number') profile.bodyweightKg = legacyBodyweight;
            next = { ...DEFAULTS, ...parsed, profile };
          } catch {}
        }
        if (!next.profile.personalId) {
          next = { ...next, profile: { ...next.profile, personalId: makeId() } };
        }
        setData(next);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  const value = useMemo<Store>(
    () => ({
      ...data,
      loaded,
      programs: [...BUILTIN_PROGRAMS, ...data.customPrograms],
      bodyweight: data.profile.bodyweightKg,
      unit: data.profile.unit,
      setAccent: (accent) => setData((d) => ({ ...d, accent })),
      updateProfile: (patch) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
      addSession: (s) => setData((d) => ({ ...d, sessions: [s, ...d.sessions] })),
      deleteSession: (id) => setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) })),
      addProgram: (p) => setData((d) => ({ ...d, customPrograms: [...d.customPrograms, p] })),
      deleteProgram: (id) =>
        setData((d) => ({ ...d, customPrograms: d.customPrograms.filter((p) => p.id !== id) })),
      // Clears logged sessions and custom protocols; keeps theme and your profile
      resetAll: () =>
      setData(() => ({ ...DEFAULTS, profile: { ...DEFAULT_PROFILE, personalId: makeId() } })),
    }),
    [data, loaded]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore must be used inside AppProvider');
  return v;
}
