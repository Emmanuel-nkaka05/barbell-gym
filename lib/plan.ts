import type { Profile } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { LevelKey, LiftId, STANDARD_LIFTS, levelFor, standardsFor } from '../data/standards';
import { roundToPlate } from './units';

/** Target bodyweight formula: height in cm minus 100 */
export const targetBodyweightKg = (heightCm: number) => heightCm - 100;

export type LiftPlan = {
  lift: LiftId;
  name: string;
  current: number | null; // kg, current 1RM if the user entered one
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

export function buildPlan(p: Profile) {
  const targetBw = p.heightCm ? targetBodyweightKg(p.heightCm) : null;
  const goalBw = targetBw ?? p.bodyweightKg;

  const lifts: LiftPlan[] = STANDARD_LIFTS.map((lift) => {
    const std = standardsFor(lift, p.bodyweightKg);
    const current = p.maxes[lift] ?? null;
    const lv = current ? levelFor(std, current) : null;
    const base = current ?? std.untrained;
    const goal = standardsFor(lift, goalBw)[p.goalLevel];
    return {
      lift,
      name: EXERCISE_MAP[lift].name,
      current,
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
export function startWeights(p: Profile): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of buildPlan(p).lifts) out[l.lift] = l.start;
  return out;
}
