import { Platform } from 'react-native';
import { dayKey } from './dates';
import { quoteOfTheDay } from '../data/quotes';

const CHANNEL = 'workout-reminders';
const QUOTE_CHANNEL = 'daily-quote';
const QUOTE_PREFIX = 'quote-';

// Expo weekday numbers: 1 = Sunday ... 7 = Saturday. The screen lists Monday first.
export const WEEK: { day: number; short: string; name: string }[] = [
  { day: 2, short: 'M', name: 'Mon' },
  { day: 3, short: 'T', name: 'Tue' },
  { day: 4, short: 'W', name: 'Wed' },
  { day: 5, short: 'T', name: 'Thu' },
  { day: 6, short: 'F', name: 'Fri' },
  { day: 7, short: 'S', name: 'Sat' },
  { day: 1, short: 'S', name: 'Sun' },
];
export const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];
export const WEEKDAYS = [2, 3, 4, 5, 6];
export const WEEKENDS = [7, 1];

const sameDays = (a: number[], b: number[]) => a.length === b.length && a.every((d) => b.includes(d));

/** "Every day", "Weekdays", "Weekends", "Every Mon" or "Mon, Wed, Fri" */
export function describeDays(days: number[]) {
  if (sameDays(days, ALL_DAYS)) return 'Every day';
  if (sameDays(days, WEEKDAYS)) return 'Weekdays';
  if (sameDays(days, WEEKENDS)) return 'Weekends';
  const names = WEEK.filter((w) => days.includes(w.day)).map((w) => w.name);
  return names.length === 1 ? `Every ${names[0]}` : names.join(', ');
}

export function fmtTime(hour: number, minute: number) {
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

// expo-notifications is native code, so it only exists in a build made after it was installed.
// It is loaded on demand, so an older build keeps working and just says reminders are unavailable.
let mod: any | null | undefined;
function load(): any | null {
  if (mod !== undefined) return mod;
  try {
    mod = require('expo-notifications');
  } catch {
    mod = null;
  }
  return mod;
}

export const remindersAvailable = () => load() !== null;

let ready = false;
async function init(N: any) {
  if (ready) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    // Android needs the channel before it will ask for permission or show anything
    await N.setNotificationChannelAsync(CHANNEL, {
      name: 'Workout reminders',
      importance: N.AndroidImportance.HIGH,
    });
    await N.setNotificationChannelAsync(QUOTE_CHANNEL, {
      name: 'Daily quote',
      importance: N.AndroidImportance.DEFAULT,
    });
  }
  ready = true;
}

/** Asks for notification permission if needed. Returns true when reminders are allowed. */
export async function ensurePermission(): Promise<boolean> {
  const N = load();
  if (!N) return false;
  try {
    await init(N);
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await N.requestPermissionsAsync();
    return !!asked.granted;
  } catch {
    return false;
  }
}

/**
 * Schedules a repeating reminder. Every day is one daily notification,
 * any other set of days is one weekly notification per day. Returns the ids to cancel it later.
 */
export async function scheduleReminder(r: {
  hour: number;
  minute: number;
  days: number[];
  programName: string;
}): Promise<string[]> {
  const N = load();
  if (!N) throw new Error('Reminders need the newest app build.');
  await init(N);

  const content = {
    title: 'Time to train',
    body: `${r.programName} is waiting. Let's go.`,
    sound: 'default',
  };
  const T = N.SchedulableTriggerInputTypes;
  const ids: string[] = [];
  try {
    if (sameDays(r.days, ALL_DAYS)) {
      ids.push(
        await N.scheduleNotificationAsync({
          content,
          trigger: { type: T.DAILY, hour: r.hour, minute: r.minute, channelId: CHANNEL },
        })
      );
    } else {
      for (const weekday of r.days) {
        ids.push(
          await N.scheduleNotificationAsync({
            content,
            trigger: { type: T.WEEKLY, weekday, hour: r.hour, minute: r.minute, channelId: CHANNEL },
          })
        );
      }
    }
  } catch (e) {
    await cancelReminder(ids); // do not leave half a reminder behind
    throw e;
  }
  return ids;
}

export async function cancelReminder(ids: string[]) {
  const N = load();
  if (!N) return;
  for (const id of ids) {
    try {
      await N.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}

// ---------- daily quote notifications ----------
// One notification can not change its text each day, so the next two weeks are scheduled as separate
// notifications, each with that day's quote. They are refreshed every time the app opens.

async function clearQuotes(N: any) {
  const all = await N.getAllScheduledNotificationsAsync();
  for (const n of all) {
    const id = String(n.identifier ?? '');
    if (id.startsWith(QUOTE_PREFIX)) {
      try {
        await N.cancelScheduledNotificationAsync(id);
      } catch {}
    }
  }
}

export async function syncQuoteNotifications(hour: number, minute: number, daysAhead = 14) {
  const N = load();
  if (!N) return;
  if (!(await ensurePermission())) return;
  await clearQuotes(N);
  const T = N.SchedulableTriggerInputTypes;
  const now = Date.now();
  for (let i = 0; i < daysAhead; i++) {
    const at = new Date();
    at.setDate(at.getDate() + i);
    at.setHours(hour, minute, 0, 0);
    if (at.getTime() <= now) continue; // today's time has already passed
    await N.scheduleNotificationAsync({
      identifier: `${QUOTE_PREFIX}${dayKey(at)}`,
      content: { title: 'Quote of the day', body: quoteOfTheDay(dayKey(at)), sound: 'default' },
      trigger: { type: T.DATE, date: at, channelId: QUOTE_CHANNEL },
    });
  }
}

export async function cancelQuoteNotifications() {
  const N = load();
  if (!N) return;
  try {
    await clearQuotes(N);
  } catch {}
}
