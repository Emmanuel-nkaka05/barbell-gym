import type { Session } from '../store';
import type { Program } from '../data/programs';

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const clock = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.max(0, Math.floor(sec % 60))).padStart(2, '0')}`;

/** Epley estimated one-rep max */
export const e1rm = (weight: number, reps: number) => (reps <= 1 ? weight : weight * (1 + reps / 30));

/** Rough calorie estimate for strength training (about 5 METs). It's an estimate, not a measurement. */
export const kcalFor = (durationSec: number, bodyweightKg: number) =>
  Math.round(5 * bodyweightKg * (durationSec / 3600));

export function sessionVolume(s: Session) {
  let total = 0;
  for (const e of s.exercises) for (const x of e.sets) total += x.weight * x.reps;
  return total;
}

export const sessionSetCount = (s: Session) => s.exercises.reduce((n, e) => n + e.sets.length, 0);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function startOfWeek(d: Date) {
  const s = startOfDay(d);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7)); // Monday
  return s;
}

export function weekDays(sessions: Session[], today = new Date()) {
  const monday = startOfWeek(today);
  const todayStart = startOfDay(today).getTime();
  return DAY_NAMES.map((name, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const inDay = sessions.filter((s) => s.endedAt >= day.getTime() && s.endedAt < next.getTime());
    return {
      name,
      date: day.getDate(),
      isToday: day.getTime() === todayStart,
      trained: inDay.length > 0,
      volume: inDay.reduce((t, s) => t + sessionVolume(s), 0),
    };
  });
}

export type Best = { weight: number; reps: number; e1rm: number };

export function bestLifts(sessions: Session[]): Record<string, Best> {
  const out: Record<string, Best> = {};
  for (const s of sessions) {
    for (const e of s.exercises) {
      for (const x of e.sets) {
        const v = e1rm(x.weight, x.reps);
        if (v > 0 && (!out[e.exerciseId] || v > out[e.exerciseId].e1rm)) {
          out[e.exerciseId] = { weight: x.weight, reps: x.reps, e1rm: v };
        }
      }
    }
  }
  return out;
}

/** Heaviest weight used for an exercise in its most recent session (0 if never done). */
export function lastWeight(sessions: Session[], exerciseId: string) {
  for (const s of sessions) {
    const e = s.exercises.find((x) => x.exerciseId === exerciseId);
    if (e && e.sets.length) return Math.max(...e.sets.map((x) => x.weight));
  }
  return 0;
}

/** Rotates through the built-in programs based on the last session. */
export function nextProgram(programs: Program[], sessions: Session[]) {
  const builtin = programs.filter((p) => !p.custom);
  const last = sessions[0]?.programId;
  const i = builtin.findIndex((p) => p.id === last);
  return builtin[(i + 1) % builtin.length] ?? programs[0];
}

export function computeMetrics(sessions: Session[], bodyweight: number) {
  const start = startOfWeek(new Date()).getTime();
  const week = sessions.filter((s) => s.endedAt >= start);
  const best = bestLifts(sessions);
  let top: { exerciseId: string; best: Best } | null = null;
  for (const [id, b] of Object.entries(best)) {
    if (!top || b.e1rm > top.best.e1rm) top = { exerciseId: id, best: b };
  }
  return {
    weekSessions: week.length,
    weekVolume: week.reduce((t, s) => t + sessionVolume(s), 0),
    weekKcal: week.reduce((t, s) => t + kcalFor(s.durationSec, bodyweight), 0),
    total: sessions.length,
    top,
  };
}

export function dateLabel(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${DAY_NAMES[(d.getDay() + 6) % 7]} ${d.getDate()}/${d.getMonth() + 1}  ${hh}:${mm}`;
}

function weekRanges(weeks: number, today = new Date()) {
  const thisMonday = startOfWeek(today);
  return Array.from({ length: weeks }, (_, k) => {
    const i = weeks - 1 - k; // 0 = this week
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - 7 * i);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return {
      start: start.getTime(),
      end: end.getTime(),
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      isCurrent: i === 0,
    };
  });
}

/** Totals for each of the last N weeks (weeks start on Monday), oldest first. */
export function weeklyTotals(sessions: Session[], bodyweight: number, weeks = 8) {
  return weekRanges(weeks).map((r) => {
    const inWeek = sessions.filter((s) => s.endedAt >= r.start && s.endedAt < r.end);
    return {
      label: r.label,
      isCurrent: r.isCurrent,
      volume: inWeek.reduce((t, s) => t + sessionVolume(s), 0),
      sessions: inWeek.length,
      kcal: inWeek.reduce((t, s) => t + kcalFor(s.durationSec, bodyweight), 0),
    };
  });
}

/** Best estimated one-rep max for one exercise in each of the last N weeks (null if not trained). */
export function weeklyBest(sessions: Session[], exerciseId: string, weeks = 8) {
  return weekRanges(weeks).map((r) => {
    let best = 0;
    for (const s of sessions) {
      if (s.endedAt < r.start || s.endedAt >= r.end) continue;
      for (const e of s.exercises) {
        if (e.exerciseId !== exerciseId) continue;
        for (const x of e.sets) best = Math.max(best, e1rm(x.weight, x.reps));
      }
    }
    return { label: r.label, isCurrent: r.isCurrent, e1rm: best > 0 ? best : null };
  });
}
