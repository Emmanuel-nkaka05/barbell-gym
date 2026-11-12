import type { Profile, Session } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { LevelKey, LiftId, STANDARD_LIFTS, levelFor, standardsFor } from '../data/standards';
import { roundToPlate } from './units';
import { e1rm } from './metrics';

/** Target bodyweight formula: height in cm minus 100 */
export const targetBodyweightKg = (heightCm: number) => heightCm - 100;

export type LiftPlan = {
  lift: LiftId;
  name: string;
  current: number | null; // kg, heaviest of the typed max and the best logged estimate
  logged: number | null; // kg, best estimated 1RM from logged sets (null if none)
  level: LevelKey | null;
  next: LevelKey | null;
  progress: number; // 0..1 toward next level
  std: Record<LevelKey, number>; // standards at current bodyweight, kg
  start: number; // suggested starting working weight, kg
  goal: number; // 5-year goal, kg
  perYear: number; // kg to add per year on average
};

/** Starting working weight is about 75% of your max. Without a tested max we assume the "untrained" standard. */
const START_FRACTION = 0.75;

/** Best estimated 1RM per main lift from logged sessions (kg). Sets of 1 to 10 reps only, like the leaderboard. */
export function loggedMaxes(sessions: Session[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of sessions) {
    for (const ex of s.exercises) {
      if (!STANDARD_LIFTS.includes(ex.exerciseId as LiftId)) continue;
      for (const x of ex.sets) {
        if (x.reps < 1 || x.reps > 10 || x.weight <= 0) continue;
        out[ex.exerciseId] = Math.max(out[ex.exerciseId] ?? 0, e1rm(x.weight, x.reps));
      }
    }
  }
  return out;
}

export function buildPlan(p: Profile, sessions: Session[] = []) {
  const targetBw = p.heightCm ? targetBodyweightKg(p.heightCm) : null;
  const goalBw = targetBw ?? p.bodyweightKg;
  const logged = loggedMaxes(sessions);

  const lifts: LiftPlan[] = STANDARD_LIFTS.map((lift) => {
    const std = standardsFor(lift, p.bodyweightKg);
    const best = Math.max(p.maxes[lift] ?? 0, logged[lift] ?? 0);
    const current = best > 0 ? best : null; // the heaviest the user has typed or lifted
    const lv = current ? levelFor(std, current) : null;
    const base = current ?? std.untrained;
    const goal = standardsFor(lift, goalBw)[p.goalLevel];
    return {
      lift,
      name: EXERCISE_MAP[lift].name,
      current,
      logged: logged[lift] ?? null,
      level: lv ? lv.level : null,
      next: lv ? lv.next : null,
      progress: lv ? lv.progress : 0,
      std,
      start: roundToPlate(base * START_FRACTION, p.unit),
      goal,
      perYear: Math.max(0, (goal - base) / 5),
    };
  });

  return { targetBw, lifts };
}

/** Suggested starting weights (kg) keyed by exercise id, used to pre-fill workouts before any history exists. */
export function startWeights(p: Profile, sessions: Session[] = []): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of buildPlan(p, sessions).lifts) out[l.lift] = l.start;
  return out;
}
