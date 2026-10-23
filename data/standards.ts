import { LB_PER_KG } from '../lib/units';

export type LevelKey = 'untrained' | 'novice' | 'intermediate' | 'advanced' | 'elite';
export type LiftId = 'squat' | 'bench' | 'deadlift' | 'ohp';

export const LEVELS: LevelKey[] = ['untrained', 'novice', 'intermediate', 'advanced', 'elite'];
export const LEVEL_LABEL: Record<LevelKey, string> = {
  untrained: 'Untrained',
  novice: 'Novice',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
};
export const STANDARD_LIFTS: LiftId[] = ['squat', 'bench', 'deadlift', 'ohp'];

// Body weight bands in pounds (the last band is "320+")
const BW = [114, 123, 132, 148, 165, 181, 198, 220, 242, 275, 319, 320];

// Adult men, pounds. Each row: [untrained, novice, intermediate, advanced, elite], same order as BW.
const TABLE: Record<LiftId, number[][]> = {
  ohp: [
    [55, 75, 90, 110, 130],
    [60, 80, 100, 115, 140],
    [65, 85, 105, 125, 150],
    [70, 95, 120, 140, 170],
    [75, 100, 130, 155, 190],
    [80, 110, 140, 165, 220],
    [85, 115, 145, 175, 235],
    [90, 120, 155, 185, 255],
    [95, 125, 160, 190, 265],
    [95, 130, 165, 195, 275],
    [100, 135, 170, 200, 280],
    [100, 140, 175, 205, 285],
  ],
  bench: [
    [85, 110, 130, 180, 220],
    [90, 115, 140, 195, 240],
    [100, 125, 155, 210, 260],
    [110, 140, 170, 235, 290],
    [120, 150, 185, 255, 320],
    [130, 165, 200, 275, 345],
    [135, 175, 215, 290, 360],
    [140, 185, 225, 305, 380],
    [145, 190, 230, 315, 395],
    [150, 195, 240, 325, 405],
    [155, 200, 245, 335, 415],
    [160, 205, 250, 340, 425],
  ],
  deadlift: [
    [95, 180, 205, 300, 385],
    [105, 195, 220, 320, 415],
    [115, 210, 240, 340, 440],
    [125, 235, 270, 380, 480],
    [135, 255, 295, 410, 520],
    [150, 275, 315, 440, 550],
    [155, 290, 335, 460, 565],
    [165, 305, 350, 480, 585],
    [170, 320, 365, 490, 595],
    [175, 325, 375, 500, 600],
    [180, 335, 380, 505, 610],
    [185, 340, 390, 510, 615],
  ],
  squat: [
    [80, 145, 175, 240, 320],
    [85, 155, 190, 260, 345],
    [90, 170, 205, 280, 370],
    [100, 190, 230, 315, 410],
    [110, 205, 250, 340, 445],
    [120, 220, 270, 370, 480],
    [125, 230, 285, 390, 505],
    [130, 245, 300, 410, 530],
    [135, 255, 310, 425, 550],
    [140, 260, 320, 435, 570],
    [145, 270, 325, 445, 580],
    [150, 275, 330, 455, 595],
  ],
};

/** Standards in kg for a given bodyweight (kg), interpolated between the table's bodyweight bands. */
export function standardsFor(lift: LiftId, bodyweightKg: number): Record<LevelKey, number> {
  const x = Math.min(Math.max(bodyweightKg * LB_PER_KG, BW[0]), BW[BW.length - 1]);
  let lo = 0;
  for (let k = 0; k < BW.length - 1; k++) if (x >= BW[k]) lo = k;
  const hi = Math.min(lo + 1, BW.length - 1);
  const t = hi === lo ? 0 : (x - BW[lo]) / (BW[hi] - BW[lo]);

  const out = {} as Record<LevelKey, number>;
  LEVELS.forEach((lv, j) => {
    const a = TABLE[lift][lo][j];
    const b = TABLE[lift][hi][j];
    out[lv] = (a + (b - a) * t) / LB_PER_KG;
  });
  return out;
}

/** Highest level whose standard the lifter meets, plus progress toward the next level (0 to 1). */
export function levelFor(std: Record<LevelKey, number>, oneRepMaxKg: number) {
  let idx = 0;
  LEVELS.forEach((lv, i) => {
    if (oneRepMaxKg >= std[lv]) idx = i;
  });
  const level = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  const progress = next ? Math.min(1, Math.max(0, (oneRepMaxKg - std[level]) / (std[next] - std[level]))) : 1;
  return { level, next, progress };
}
