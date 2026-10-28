export type Category = 'big4' | 'upper' | 'lower';

export type Exercise = {
  id: string;
  name: string;
  category: Category;
  muscles: string[];
  variations: string[];
  cues: string[];
};

export const CATEGORY_LABEL: Record<Category, string> = {
  big4: 'The Big Four',
  upper: 'Upper body',
  lower: 'Lower body',
};

export const EXERCISES: Exercise[] = [
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    category: 'big4',
    muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core', 'Lower back'],
    variations: ['High-bar (more quad-dominant)', 'Low-bar (more posterior chain)'],
    cues: [
      'Bar on your upper back, brace your core before every rep.',
      'Knees track over your toes, chest stays up.',
      'Hips reach at least knee level, then drive up through mid-foot.',
    ],
  },
  {
    id: 'bench',
    name: 'Barbell Bench Press',
    category: 'big4',
    muscles: ['Pectoralis major', 'Front delts', 'Triceps'],
    variations: ['Flat', 'Incline (upper chest)', 'Decline', 'Close-grip (triceps)'],
    cues: [
      'Pull your shoulder blades back and down, keep them pinned.',
      'Lower the bar to mid-chest with forearms vertical.',
      'Feet planted, press up and slightly back.',
    ],
  },
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    category: 'big4',
    muscles: ['Hamstrings', 'Glutes', 'Erector spinae', 'Traps', 'Grip'],
    variations: ['Sumo (wider stance)', 'Deficit deadlift'],
    cues: [
      'Bar over mid-foot, shoulders just in front of the bar.',
      'Brace and pull the slack out before the bar leaves the floor.',
      'Push the floor away, lock hips and knees out together.',
    ],
  },
  {
    id: 'ohp',
    name: 'Overhead Press',
    category: 'big4',
    muscles: ['Shoulders', 'Triceps', 'Upper chest', 'Core'],
    variations: ['Seated OHP', 'Push press (leg drive)'],
    cues: [
      'Squeeze glutes, ribs down, bar starts on your front delts.',
      'Press straight up and move your head through at the top.',
      'Finish with the bar over mid-foot and shrug at lockout.',
    ],
  },
  {
    id: 'row',
    name: 'Bent-Over Barbell Row',
    category: 'upper',
    muscles: ['Lats', 'Rhomboids', 'Rear delts', 'Biceps', 'Lower back'],
    variations: ['Pendlay row (from the floor)', 'Underhand / Yates row'],
    cues: [
      'Hinge to about 45 degrees with a flat back.',
      'Pull the bar to your lower ribs, lead with the elbows.',
      'Control the way down, no torso heaving.',
    ],
  },
  {
    id: 'shrug',
    name: 'Barbell Shrug',
    category: 'upper',
    muscles: ['Trapezius'],
    variations: [],
    cues: [
      'Hold the bar at arm length, standing tall.',
      'Lift your shoulders straight toward your ears, no rolling.',
      'Pause at the top, lower slowly.',
    ],
  },
  {
    id: 'curl',
    name: 'Barbell Bicep Curl',
    category: 'upper',
    muscles: ['Biceps brachii'],
    variations: ['Straight bar or EZ-bar', 'Reverse grip (forearms, brachialis)'],
    cues: [
      'Elbows pinned to your sides.',
      'Curl without swinging your torso.',
      'Lower under control to full extension.',
    ],
  },
  {
    id: 'skull',
    name: 'Skull Crushers',
    category: 'upper',
    muscles: ['Triceps'],
    variations: ['EZ-bar recommended'],
    cues: [
      'Upper arms stay vertical and still.',
      'Lower the bar toward your forehead or just behind your head.',
      'Extend until your arms are locked out.',
    ],
  },
  {
    id: 'rdl',
    name: 'Romanian Deadlift',
    category: 'lower',
    muscles: ['Hamstrings', 'Glutes'],
    variations: [],
    cues: [
      'Soft knees, push your hips back.',
      'Bar slides down your thighs, back stays flat.',
      'Stop at a deep hamstring stretch, then drive your hips forward.',
    ],
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    category: 'lower',
    muscles: ['Quadriceps', 'Upper back', 'Core'],
    variations: [],
    cues: [
      'Elbows high, bar resting on your front delts.',
      'Stay upright through the whole rep.',
      'Drive your elbows up as you stand out of the bottom.',
    ],
  },
  {
    id: 'hip-thrust',
    name: 'Barbell Hip Thrust',
    category: 'lower',
    muscles: ['Glute maximus'],
    variations: [],
    cues: [
      'Upper back on a bench, bar over your hips (use a pad).',
      'Chin tucked, shins vertical at the top.',
      'Squeeze the glutes hard without arching your lower back.',
    ],
  },
  {
    id: 'lunge',
    name: 'Barbell Walking Lunge',
    category: 'lower',
    muscles: ['Quadriceps', 'Glutes', 'Balance'],
    variations: [],
    cues: [
      'Take a long step and keep your torso upright.',
      'Back knee lightly touches just above the floor.',
      'Push through the front heel to step forward.',
    ],
  },
];

export const EXERCISE_MAP: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e])
);

/** What each exercise is best for, shown as "Best for ..." on protocol pages. */
export const FOCUS: Record<string, string> = {
  squat: 'legs',
  bench: 'chest',
  deadlift: 'back and legs',
  ohp: 'shoulders',
  row: 'back',
  shrug: 'traps',
  curl: 'biceps',
  skull: 'triceps',
  rdl: 'hamstrings',
  'front-squat': 'quads',
  'hip-thrust': 'glutes',
  lunge: 'legs',
};
