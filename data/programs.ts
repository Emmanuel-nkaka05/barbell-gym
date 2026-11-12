export type ProgramExercise = {
  exerciseId: string;
  sets: number;
  reps: string; // e.g. "5" or "6-8"
  note?: string;
};

export type Program = {
  id: string;
  name: string;
  tag: string;
  level: string;
  exercises: ProgramExercise[];
  custom?: boolean;
  main?: boolean; // false for the extra no-gear protocols, so they are not part of the normal rotation
};

export const BUILTIN_PROGRAMS: Program[] = [
  {
    id: 'fb-a',
    name: 'Full Body A',
    tag: 'Full body strength, 3 days/week',
    level: 'Beginner',
    exercises: [
      { exerciseId: 'squat', sets: 3, reps: '5' },
      { exerciseId: 'bench', sets: 3, reps: '5' },
      { exerciseId: 'row', sets: 3, reps: '8' },
    ],
  },
  {
    id: 'fb-b',
    name: 'Full Body B',
    tag: 'Full body strength, 3 days/week',
    level: 'Beginner',
    exercises: [
      { exerciseId: 'deadlift', sets: 1, reps: '5', note: 'Warm up with lighter sets, then one heavy working set.' },
      { exerciseId: 'ohp', sets: 3, reps: '5' },
      { exerciseId: 'front-squat', sets: 3, reps: '8' },
    ],
  },
  {
    id: 'ul-upper',
    name: 'Upper Body Day',
    tag: 'Upper / lower split, 4 days/week',
    level: 'Intermediate',
    exercises: [
      { exerciseId: 'bench', sets: 4, reps: '6-8' },
      { exerciseId: 'row', sets: 4, reps: '6-8' },
      { exerciseId: 'ohp', sets: 3, reps: '8-10' },
      { exerciseId: 'curl', sets: 3, reps: '10-12' },
      { exerciseId: 'skull', sets: 3, reps: '10-12' },
    ],
  },
  {
    id: 'ul-lower',
    name: 'Lower Body Day',
    tag: 'Upper / lower split, 4 days/week',
    level: 'Intermediate',
    exercises: [
      { exerciseId: 'squat', sets: 4, reps: '6-8' },
      { exerciseId: 'rdl', sets: 4, reps: '8-10' },
      { exerciseId: 'lunge', sets: 3, reps: '10', note: '10 steps per leg.' },
      { exerciseId: 'hip-thrust', sets: 3, reps: '10-12' },
    ],
  },
  {
    id: 'bw-full',
    name: 'Bodyweight Full Body',
    tag: 'No equipment needed',
    level: 'Beginner',
    main: false,
    exercises: [
      { exerciseId: 'pushup', sets: 3, reps: '12' },
      { exerciseId: 'inverted-row', sets: 3, reps: '10', note: 'Use a heavy, sturdy table.' },
      { exerciseId: 'air-squat', sets: 3, reps: '15' },
      { exerciseId: 'single-leg-bridge', sets: 3, reps: '12', note: '12 per leg.' },
      { exerciseId: 'hollow-hold', sets: 3, reps: '20', note: 'Hold for about 20 seconds each set.' },
    ],
  },
  {
    id: 'db-home',
    name: 'Dumbbell Home Workout',
    tag: 'Dumbbells only',
    level: 'Beginner',
    main: false,
    exercises: [
      { exerciseId: 'goblet-squat', sets: 3, reps: '10' },
      { exerciseId: 'db-shoulder-press', sets: 3, reps: '10' },
      { exerciseId: 'db-rdl', sets: 3, reps: '10' },
      { exerciseId: 'hammer-curl', sets: 3, reps: '12' },
      { exerciseId: 'lateral-raise', sets: 3, reps: '12' },
    ],
  },
];

export const totalSets = (p: Program) => p.exercises.reduce((n, e) => n + e.sets, 0);
export const estMinutes = (p: Program) => Math.round(totalSets(p) * 3.5) + 5;
export const targetReps = (reps: string) => parseInt(reps, 10) || 8;
