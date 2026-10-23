export type Unit = 'kg' | 'lb';

export const LB_PER_KG = 2.2046226218;

export const kgToUnit = (kg: number, u: Unit) => (u === 'lb' ? kg * LB_PER_KG : kg);
export const unitToKg = (v: number, u: Unit) => (u === 'lb' ? v / LB_PER_KG : v);

/** Number as text with at most 1 decimal and no trailing ".0" */
export const fmtNum = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};

/** Weight stored in kg, shown in the user's unit (number only, no label) */
export const fmtWeight = (kg: number, u: Unit) => fmtNum(kgToUnit(kg, u));

/** Round a kg value to a loadable plate step in the user's unit (2.5 kg or 5 lb) and return kg. */
export function roundToPlate(kg: number, u: Unit) {
  const step = u === 'lb' ? 5 : 2.5;
  const inUnit = Math.max(step, Math.round(kgToUnit(kg, u) / step) * step);
  return unitToKg(inUnit, u);
}
