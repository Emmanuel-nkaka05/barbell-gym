import type { Profile, Session } from '../store';
import { LiftId, levelFor, standardsFor } from '../data/standards';
import { e1rm } from './metrics';

export const BOARD_LIFTS: LiftId[] = ['bench', 'squat', 'deadlift', 'ohp'];

export const WEIGHT_CLASSES = ['Under 60', '60-70', '70-80', '80-90', '90-100', 'Over 100'];

/** Bodyweight is shared only as a 10 kg class, never the exact number. */
export function weightClassOf(kg: number) {
  if (kg < 60) return WEIGHT_CLASSES[0];
  if (kg < 70) return WEIGHT_CLASSES[1];
  if (kg < 80) return WEIGHT_CLASSES[2];
  if (kg < 90) return WEIGHT_CLASSES[3];
  if (kg < 100) return WEIGHT_CLASSES[4];
  return WEIGHT_CLASSES[5];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Builds what gets uploaded: best estimated 1-rep max per lift (from sets of 1 to 10 reps,
 * because the estimate gets unreliable on high-rep sets), the best set, and the strength level.
 * Weights are in kg.
 */
export function buildEntry(profile: Profile, sessions: Session[]) {
  const best: Record<string, { w: number; r: number; e: number }> = {};
  for (const s of sessions) {
    for (const ex of s.exercises) {
      if (!BOARD_LIFTS.includes(ex.exerciseId as LiftId)) continue;
      for (const x of ex.sets) {
        if (x.reps < 1 || x.reps > 10 || x.weight <= 0) continue;
        const e = e1rm(x.weight, x.reps);
        const cur = best[ex.exerciseId];
        if (!cur || e > cur.e) best[ex.exerciseId] = { w: round1(x.weight), r: x.reps, e };
      }
    }
  }

  const entry: Record<string, any> = {
    personalId: profile.personalId,
    name: profile.name.slice(0, 40),
    avatar: profile.avatar,
    weightClass: weightClassOf(profile.bodyweightKg),
    sets: {},
    levels: {},
  };

  let total = 0;
  let count = 0;
  for (const lift of BOARD_LIFTS) {
    const b = best[lift];
    if (!b) continue;
    const v = round1(b.e);
    entry[lift] = v;
    entry.sets[lift] = { w: b.w, r: b.r };
    entry.levels[lift] = levelFor(standardsFor(lift, profile.bodyweightKg), b.e).level;
    total += v;
    count++;
  }
  // The 4-lift total only counts when all four lifts are logged
  if (count === BOARD_LIFTS.length) entry.total = round1(total);

  return entry;
}

export const hasAnyLift = (entry: Record<string, any>) => BOARD_LIFTS.some((l) => typeof entry[l] === 'number');
