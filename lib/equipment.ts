import { EQUIP_LABEL, EXERCISE_MAP } from '../data/exercises';
import type { Equip, Exercise } from '../data/exercises';
import type { Program } from '../data/programs';

/** owned is the list of gear the user has. null means they have not set it yet, so everything counts as available. */
export const canDo = (ex: Exercise, owned: string[] | null) =>
  !owned || ex.equipment.every((e) => owned.includes(e));

export const missingGear = (ex: Exercise, owned: string[] | null): Equip[] =>
  owned ? ex.equipment.filter((e) => !owned.includes(e)) : [];

export const gearText = (ids: Equip[]) => ids.map((i) => EQUIP_LABEL[i]).join(', ');

/**
 * Works out what to actually do for an exercise in a protocol.
 * You can do it: use it. You can't, but its no-equipment version fits: swap to that.
 * Neither: keep it and report what is missing.
 */
export function resolveExercise(id: string, owned: string[] | null): { id: string; swappedFrom?: string; missing?: Equip[] } {
  const ex = EXERCISE_MAP[id];
  if (!ex || canDo(ex, owned)) return { id };
  const alt = ex.alt ? EXERCISE_MAP[ex.alt] : undefined;
  if (alt && canDo(alt, owned)) return { id: alt.id, swappedFrom: id };
  return { id, missing: missingGear(ex, owned) };
}

/** How a whole protocol fits your gear: exercises that fit, get swapped, or can't be done. */
export function programFit(p: Program, owned: string[] | null) {
  let ok = 0;
  let swaps = 0;
  let missing = 0;
  for (const pe of p.exercises) {
    const r = resolveExercise(pe.exerciseId, owned);
    if (r.swappedFrom) swaps++;
    else if (r.missing && r.missing.length) missing++;
    else ok++;
  }
  return { ok, swaps, missing };
}
