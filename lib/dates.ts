import type { Session } from '../store';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const WEEKDAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const pad = (n: number) => String(n).padStart(2, '0');

/** A day as text, like 2026-10-26 (local time). Used to store and compare days. */
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayKey = () => dayKey(new Date());

export const dayLabel = (k: string) => {
  const d = parseKey(k);
  return `${WEEKDAYS_FULL[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** Weeks (Monday first) for one month. Cells outside the month are null. */
export function monthMatrix(year: number, month: number): (string | null)[][] {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: total }, (_, i) => dayKey(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Every day with a logged session, plus days you marked by hand. */
export function workoutDays(sessions: Session[], checkins: string[]): Set<string> {
  const set = new Set<string>(checkins);
  for (const s of sessions) set.add(dayKey(new Date(s.endedAt)));
  return set;
}

export const sessionsOn = (sessions: Session[], key: string) =>
  sessions.filter((s) => dayKey(new Date(s.endedAt)) === key);

const dayNum = (k: string) => Math.round(parseKey(k).getTime() / 86400000);

/** Current run of consecutive workout days (today may still be empty) and your best run ever. */
export function streaks(days: Set<string>, today = todayKey()) {
  const nums = Array.from(days)
    .map(dayNum)
    .sort((a, b) => a - b);

  let best = 0;
  let run = 0;
  for (let i = 0; i < nums.length; i++) {
    run = i > 0 && nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const set = new Set(nums);
  let cursor = dayNum(today);
  if (!set.has(cursor)) cursor -= 1; // today not done yet, so count back from yesterday
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor -= 1;
  }
  return { current, best };
}
