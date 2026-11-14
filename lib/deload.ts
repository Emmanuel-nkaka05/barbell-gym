import type { Session } from '../store';
import { weeklyTotals } from './metrics';

/** Suggests a deload after 6 straight weeks of 2+ sessions, or 3 falling weeks of volume in a row. */
export function deloadAdvice(sessions: Session[], bodyweightKg: number): { reason: string } | null {
  const weeks = weeklyTotals(sessions, bodyweightKg, 10).filter((w) => !w.isCurrent); // completed weeks only

  const last6 = weeks.slice(-6);
  if (last6.length === 6 && last6.every((w) => w.sessions >= 2)) {
    return { reason: 'You have trained 2+ times a week for 6 weeks in a row.' };
  }

  const [a, b, c, d] = weeks.slice(-4).map((w) => w.volume);
  if (d > 0 && a > b && b > c && c > d) {
    return { reason: 'Your weekly volume has dropped 3 weeks in a row, a sign of building fatigue.' };
  }
  return null;
}

export const DELOAD_SET_FACTOR = 0.6; // 40% less volume
export const deloadSets = (sets: number) => Math.max(1, Math.round(sets * DELOAD_SET_FACTOR));