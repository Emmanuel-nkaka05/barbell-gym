import { parseKey, todayKey } from '../lib/dates';

export const QUOTES = [
  'The bar does not care how you feel. Lift anyway.',
  'Small weights added consistently beat big plans never started.',
  'You are one rep stronger than yesterday.',
  'Discipline is doing the set when motivation has left the building.',
  'Strength is built in the reps nobody sees.',
  'Show up. The numbers will follow.',
  'Every great lift started as a heavy warm-up.',
  'Progress is quiet until it is obvious.',
  'Rest is part of the program. Earn it, then take it.',
  "Your only competition is last week's you.",
  'Heavy is relative. Keep moving the line.',
  'Form first, then weight, then pride.',
  'A bad workout still beats the one you skipped.',
  'Consistency turns effort into strength.',
  'The hardest rep is walking through the door.',
  'Strong is a habit, not a mood.',
  'Make the weight earn its place on the bar.',
  'Patience under the bar builds strength over years.',
  "Today's sweat is next month's personal best.",
  'You do not need perfect days, you need repeated ones.',
  'Chase progress, not perfection.',
  'Be the lifter your future self thanks.',
  'Pain passes. A hard-earned PR stays.',
  'Train like the plan is working. It is.',
  'Another set, another vote for who you are becoming.',
  'Growth lives just past the last comfortable rep.',
  'Lift with intent. Recover with respect.',
  'Slow progress is still progress.',
  'The plates add up. So do the days.',
  'Start where you are. Use what you have. Lift.',
];

const dayNum = (k: string) => Math.round(parseKey(k).getTime() / 86400000);

/** Same quote all day, a different one tomorrow (7 and 30 share no factors, so no repeats for 30 days). */
export const quoteOfTheDay = (key = todayKey()) => QUOTES[(dayNum(key) * 7) % QUOTES.length];
