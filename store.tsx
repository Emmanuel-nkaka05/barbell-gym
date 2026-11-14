import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AccentKey } from './theme';
import { BUILTIN_PROGRAMS, Program } from './data/programs';
import type { LevelKey } from './data/standards';
import type { Unit } from './lib/units';

export type SetLog = { reps: number; weight: number ;note?: string }; // weight is always stored in kg
export type ExerciseLog = { exerciseId: string; sets: SetLog[] };
export type Session = {
  id: string;
  programId: string;
  programName: string;
  endedAt: number;
  durationSec: number;
  exercises: ExerciseLog[];
};

export type QuoteNotif = { enabled: boolean; hour: number; minute: number };

export type Reminder = {
  id: string;
  programId: string;
  programName: string; // saved so the reminder still reads right if the workout is renamed
  hour: number; // 0-23
  minute: number;
  days: number[]; // 1 = Sunday ... 7 = Saturday
  notifIds: string[]; // scheduled notification ids, used to cancel it
};

export type Profile = {
  name: string;
  personalId: string; // assigned by the server when you create an account, never typed in by the user
  registered: boolean; // true once the personal ID came from a real account
  avatar: string; // icon name for the preset avatar
  unit: Unit;
  heightCm: number | null;
  bodyweightKg: number;
  equipment: string[] | null; // gear the user owns; null means not set yet, so everything is shown
  maxes: Record<string, number>; // current 1RM per lift, kg
  goalLevel: LevelKey;
  restDays: number; // missed days the current streak may bridge
};

type Persisted = {
  accent: AccentKey;
  sessions: Session[]; // newest first
  customPrograms: Program[];
  profile: Profile;
  checkins: string[]; // days marked as workout days by hand, as YYYY-MM-DD
  reminders: Reminder[];
  quoteNotif: QuoteNotif;
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
  updateProgram: (id: string, patch: Partial<Program>) => void; // edits a custom workout
  deleteProgram: (id: string) => void;
  toggleCheckin: (dayKey: string) => void;
  addReminder: (r: Reminder) => void;
  removeReminder: (id: string) => void;
  setQuoteNotif: (patch: Partial<QuoteNotif>) => void;
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
  equipment: null,
  maxes: {},
  goalLevel: 'advanced',
  restDays: 2,
};

const DEFAULTS: Persisted = {
  accent: 'bordo',
  sessions: [],
  customPrograms: [],
  profile: DEFAULT_PROFILE,
  checkins: [],
  reminders: [],
  quoteNotif: { enabled: true, hour: 8, minute: 0 },
};

type ThemeSlice = { accent: AccentKey; setAccent: (a: AccentKey) => void };
type ProfileSlice = {
  profile: Profile;
  unit: Unit;
  bodyweight: number;
  photo: string | null;
  setPhoto: (uri: string | null) => void;
  updateProfile: (patch: Partial<Profile>) => void;
};
type WorkoutSlice = {
  sessions: Session[];
  programs: Program[];
  checkins: string[];
  addSession: (s: Session) => void;
  deleteSession: (id: string) => void;
  addProgram: (p: Program) => void;
  updateProgram: (id: string, patch: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  toggleCheckin: (dayKey: string) => void;
  resetAll: () => void;
};
type NotifSlice = {
  reminders: Reminder[];
  quoteNotif: QuoteNotif;
  addReminder: (r: Reminder) => void;
  removeReminder: (id: string) => void;
  setQuoteNotif: (patch: Partial<QuoteNotif>) => void;
};

const ThemeCtx = createContext<ThemeSlice | null>(null);
const ProfileCtx = createContext<ProfileSlice | null>(null);
const WorkoutCtx = createContext<WorkoutSlice | null>(null);
const NotifCtx = createContext<NotifSlice | null>(null);
const LoadedCtx = createContext(false);

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
              reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
              quoteNotif: { ...DEFAULTS.quoteNotif, ...(parsed.quoteNotif ?? {}) },
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

  // Every action uses the functional setData form, so this object never changes identity.
  const actions = useMemo(
    () => ({
      setAccent: (accent: AccentKey) => setData((d) => ({ ...d, accent })),
      updateProfile: (patch: Partial<Profile>) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
      addSession: (s: Session) => setData((d) => ({ ...d, sessions: [s, ...d.sessions] })),
      deleteSession: (id: string) => setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) })),
      addProgram: (p: Program) => setData((d) => ({ ...d, customPrograms: [...d.customPrograms, p] })),
      updateProgram: (id: string, patch: Partial<Program>) =>
        setData((d) => ({
          ...d,
          customPrograms: d.customPrograms.map((p) => (p.id === id ? { ...p, ...patch, id: p.id } : p)),
        })),
      deleteProgram: (id: string) =>
        setData((d) => ({ ...d, customPrograms: d.customPrograms.filter((p) => p.id !== id) })),
      toggleCheckin: (key: string) =>
        setData((d) => ({
          ...d,
          checkins: d.checkins.includes(key) ? d.checkins.filter((k) => k !== key) : [...d.checkins, key],
        })),
      addReminder: (r: Reminder) => setData((d) => ({ ...d, reminders: [...d.reminders, r] })),
      removeReminder: (id: string) => setData((d) => ({ ...d, reminders: d.reminders.filter((r) => r.id !== id) })),
      setQuoteNotif: (patch: Partial<QuoteNotif>) =>
        setData((d) => ({ ...d, quoteNotif: { ...d.quoteNotif, ...patch } })),
      // Clears logged sessions, check-ins and custom workouts; keeps theme, profile and reminders
      resetAll: () =>
        setData((d) => ({
          ...DEFAULTS,
          accent: d.accent,
          profile: d.profile,
          reminders: d.reminders,
          quoteNotif: d.quoteNotif,
        })),
    }),
    []
  );

  const theme = useMemo<ThemeSlice>(() => ({ accent: data.accent, setAccent: actions.setAccent }), [data.accent, actions]);

  const profileSlice = useMemo<ProfileSlice>(
    () => ({
      profile: data.profile,
      unit: data.profile.unit,
      bodyweight: data.profile.bodyweightKg,
      photo,
      setPhoto,
      updateProfile: actions.updateProfile,
    }),
    [data.profile, photo, actions]
  );

  const workouts = useMemo<WorkoutSlice>(
    () => ({
      sessions: data.sessions,
      programs: [...BUILTIN_PROGRAMS, ...data.customPrograms],
      checkins: data.checkins ?? [],
      addSession: actions.addSession,
      deleteSession: actions.deleteSession,
      addProgram: actions.addProgram,
      updateProgram: actions.updateProgram,
      deleteProgram: actions.deleteProgram,
      toggleCheckin: actions.toggleCheckin,
      resetAll: actions.resetAll,
    }),
    [data.sessions, data.customPrograms, data.checkins, actions]
  );

  const notifs = useMemo<NotifSlice>(
    () => ({
      reminders: data.reminders,
      quoteNotif: data.quoteNotif,
      addReminder: actions.addReminder,
      removeReminder: actions.removeReminder,
      setQuoteNotif: actions.setQuoteNotif,
    }),
    [data.reminders, data.quoteNotif, actions]
  );

  return (
    <LoadedCtx.Provider value={loaded}>
      <ThemeCtx.Provider value={theme}>
        <ProfileCtx.Provider value={profileSlice}>
          <WorkoutCtx.Provider value={workouts}>
            <NotifCtx.Provider value={notifs}>{children}</NotifCtx.Provider>
          </WorkoutCtx.Provider>
        </ProfileCtx.Provider>
      </ThemeCtx.Provider>
    </LoadedCtx.Provider>
  );
}

function need<T>(v: T | null, name: string): T {
  if (!v) throw new Error(`${name} must be used inside AppProvider`);
  return v;
}
export const useTheme = () => need(useContext(ThemeCtx), 'useTheme');
export const useProfile = () => need(useContext(ProfileCtx), 'useProfile');
export const useWorkouts = () => need(useContext(WorkoutCtx), 'useWorkouts');
export const useNotifs = () => need(useContext(NotifCtx), 'useNotifs');
export const useLoaded = () => useContext(LoadedCtx);

/** Old all-in-one hook. Still works, but re-renders on ANY change. Prefer the slice hooks above. */
export function useStore() {
  return { ...useTheme(), ...useProfile(), ...useWorkouts(), ...useNotifs(), loaded: useLoaded() };
}
