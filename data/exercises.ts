export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';

export type Equip =
  | 'dumbbells'
  | 'barbell'
  | 'bench'
  | 'rack'
  | 'bands'
  | 'pullup'
  | 'dip'
  | 'abwheel'
  | 'cable'
  | 'machine';

export type Exercise = {
  id: string;
  name: string;
  group: MuscleGroup;
  equipment: Equip[]; // everything you need for it. An empty list means no equipment.
  focus: string; // what it is best for, shown as "Best for ..."
  muscles: string[];
  variations: string[];
  cues: string[];
  alt?: string; // id of a no-equipment (or easier to set up) version
};

export const GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'legs', label: 'Legs' },
  { id: 'core', label: 'Core' },
];

export const EQUIPMENT: { id: Equip; label: string; section: string }[] = [
  { id: 'dumbbells', label: 'Dumbbells', section: 'Free weights' },
  { id: 'barbell', label: 'Barbell and plates', section: 'Free weights' },
  { id: 'bench', label: 'Bench (flat or incline)', section: 'Benches and racks' },
  { id: 'rack', label: 'Squat or power rack', section: 'Benches and racks' },
  { id: 'bands', label: 'Resistance bands', section: 'Accessories' },
  { id: 'pullup', label: 'Pull-up bar', section: 'Accessories' },
  { id: 'dip', label: 'Dip bars', section: 'Accessories' },
  { id: 'abwheel', label: 'Ab wheel', section: 'Accessories' },
  { id: 'cable', label: 'Cable machine', section: 'Gym machines' },
  { id: 'machine', label: 'Pulldown and leg curl machines', section: 'Gym machines' },
];

export const EQUIP_LABEL = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e.label])) as Record<Equip, string>;

const ALL_GEAR = EQUIPMENT.map((e) => e.id);

export const PRESETS: {
  id: string;
  title: string;
  subtitle: string;
  icon: 'body' | 'home' | 'barbell' | 'business';
  equipment: Equip[];
}[] = [
  { id: 'bodyweight', title: 'Bodyweight only', subtitle: 'No gear needed', icon: 'body', equipment: [] },
  { id: 'home', title: 'Minimalist home', subtitle: 'Dumbbells and resistance bands', icon: 'home', equipment: ['dumbbells', 'bands'] },
  {
    id: 'homegym',
    title: 'Full home gym',
    subtitle: 'Barbell, rack, bench and weights',
    icon: 'barbell',
    equipment: ['dumbbells', 'barbell', 'bench', 'rack', 'bands', 'pullup'],
  },
  { id: 'commercial', title: 'Commercial gym', subtitle: 'Full access to machines and cables', icon: 'business', equipment: ALL_GEAR },
];

function ex(
  id: string,
  name: string,
  group: MuscleGroup,
  equipment: Equip[],
  focus: string,
  muscles: string[],
  cues: string[],
  alt?: string,
  variations: string[] = []
): Exercise {
  return { id, name, group, equipment, focus, muscles, cues, alt, variations };
}

export const EXERCISES: Exercise[] = [
  // ---------- CHEST ----------
  ex('bench', 'Barbell Bench Press', 'chest', ['barbell', 'bench'], 'chest', ['Pectoralis major', 'Front delts', 'Triceps'], [
    'Pull your shoulder blades back and down, keep them pinned.',
    'Lower the bar to mid-chest with forearms vertical.',
    'Feet planted, press up and slightly back.',
  ], 'pushup', ['Flat', 'Incline (upper chest)', 'Decline', 'Close-grip (triceps)']),
  ex('incline-db-press', 'Incline Dumbbell Bench Press', 'chest', ['dumbbells', 'bench'], 'upper chest', ['Upper chest', 'Front delts', 'Triceps'], [
    'Set the bench to a low incline, about 30 degrees.',
    'Lower the dumbbells to the sides of your upper chest.',
    'Press up and slightly together without banging the weights.',
  ], 'decline-pushup'),
  ex('chest-dips', 'Chest Dips', 'chest', ['dip'], 'lower chest', ['Lower chest', 'Triceps', 'Front delts'], [
    'Lean your torso forward a little.',
    'Lower until your shoulders are just below your elbows.',
    'Press back up without locking out hard.',
  ], 'bench-dips'),
  ex('db-fly', 'Dumbbell Fly', 'chest', ['dumbbells', 'bench'], 'inner chest', ['Pectorals', 'Front delts'], [
    'Keep a slight bend in your elbows the whole time.',
    'Open your arms wide until you feel a chest stretch.',
    'Squeeze the dumbbells together like hugging a tree.',
  ], 'wide-pushup'),
  ex('cable-crossover', 'Cable Crossover', 'chest', ['cable'], 'inner chest', ['Pectorals'], [
    'Step forward with a slight lean and a soft elbow bend.',
    'Bring your hands together in a wide arc.',
    'Pause and squeeze, then return slowly.',
  ], 'diamond-pushup'),
  ex('pushup', 'Standard Push-Up', 'chest', [], 'chest', ['Pectorals', 'Front delts', 'Triceps', 'Core'], [
    'Hands under shoulders, body in one straight line.',
    'Lower your chest to just above the floor.',
    'Press up without letting your hips sag.',
  ], undefined, ['Knee push-up (easier)', 'Feet elevated (harder)']),
  ex('decline-pushup', 'Decline Push-Up', 'chest', [], 'upper chest', ['Upper chest', 'Front delts', 'Triceps'], [
    'Put your feet on a chair or bed, hands on the floor.',
    'Keep your body straight from head to heels.',
    'Lower under control and press up.',
  ]),
  ex('wide-pushup', 'Wide Push-Up', 'chest', [], 'chest', ['Pectorals', 'Front delts'], [
    'Place your hands wider than your shoulders.',
    'Lower until your chest nearly touches the floor.',
    'Press up and squeeze your chest at the top.',
  ]),
  ex('diamond-pushup', 'Diamond Push-Up', 'chest', [], 'inner chest and triceps', ['Inner chest', 'Triceps'], [
    'Make a diamond with your thumbs and fingers under your chest.',
    'Keep your elbows close to your body.',
    'Lower and press up with a straight back.',
  ]),
  ex('bench-dips', 'Bench Dips', 'chest', [], 'lower chest and triceps', ['Triceps', 'Lower chest', 'Front delts'], [
    'Put your hands on the edge of a sturdy chair or bed behind you.',
    'Lower until your elbows reach about 90 degrees.',
    'Press up and keep your shoulders away from your ears.',
  ]),

  // ---------- BACK ----------
  ex('deadlift', 'Conventional Deadlift', 'back', ['barbell'], 'back and legs', ['Hamstrings', 'Glutes', 'Erector spinae', 'Traps', 'Grip'], [
    'Bar over mid-foot, shoulders just in front of the bar.',
    'Brace and pull the slack out before the bar leaves the floor.',
    'Push the floor away, lock hips and knees out together.',
  ], 'superman', ['Sumo (wider stance)', 'Deficit deadlift']),
  ex('row', 'Bent-Over Barbell Row', 'back', ['barbell'], 'back', ['Lats', 'Rhomboids', 'Rear delts', 'Biceps', 'Lower back'], [
    'Hinge to about 45 degrees with a flat back.',
    'Pull the bar to your lower ribs, lead with the elbows.',
    'Control the way down, no torso heaving.',
  ], 'inverted-row', ['Pendlay row (from the floor)', 'Underhand / Yates row']),
  ex('rdl', 'Romanian Deadlift', 'back', ['barbell'], 'hamstrings and lower back', ['Hamstrings', 'Glutes', 'Lower back'], [
    'Soft knees, push your hips back.',
    'Bar slides down your thighs, back stays flat.',
    'Stop at a deep hamstring stretch, then drive your hips forward.',
  ], 'superman'),
  ex('shrug', 'Barbell Shrug', 'back', ['barbell'], 'traps', ['Trapezius'], [
    'Hold the bar at arm length, standing tall.',
    'Lift your shoulders straight toward your ears, no rolling.',
    'Pause at the top, lower slowly.',
  ], 'towel-shrug'),
  ex('pullup', 'Pull-Up', 'back', ['pullup'], 'lats', ['Lats', 'Biceps', 'Upper back'], [
    'Grip just outside shoulder width.',
    'Pull your chest toward the bar, elbows down and back.',
    'Lower to a full hang on every rep.',
  ], 'inverted-row'),
  ex('lat-pulldown', 'Lat Pulldown', 'back', ['machine'], 'lat width', ['Lats', 'Biceps', 'Rear delts'], [
    'Sit tall and grip wider than your shoulders.',
    'Pull the bar to your upper chest, elbows down.',
    'Let the bar rise slowly until your arms are straight.',
  ], 'doorframe-row'),
  ex('db-row', 'One-Arm Dumbbell Row', 'back', ['dumbbells', 'bench'], 'lats and upper back', ['Lats', 'Rhomboids', 'Rear delts', 'Biceps'], [
    'One hand and one knee on the bench, back flat.',
    'Pull the dumbbell to your hip, elbow close to your body.',
    'Lower until your arm is straight.',
  ], 'inverted-row'),
  ex('db-shrug', 'Dumbbell Shrug', 'back', ['dumbbells'], 'traps', ['Trapezius'], [
    'Hold a dumbbell in each hand at your sides.',
    'Lift your shoulders straight up, no rolling.',
    'Pause at the top and lower slowly.',
  ], 'towel-shrug'),
  ex('db-rdl', 'Dumbbell Romanian Deadlift', 'back', ['dumbbells'], 'hamstrings and lower back', ['Hamstrings', 'Glutes', 'Lower back'], [
    'Hold the dumbbells in front of your thighs.',
    'Push your hips back with a flat back and soft knees.',
    'Stand up by driving your hips forward.',
  ], 'superman'),
  ex('inverted-row', 'Inverted Row', 'back', [], 'back', ['Lats', 'Rhomboids', 'Biceps'], [
    'Lie under a heavy, sturdy table and grip the edge.',
    'Keep your body straight and pull your chest to the table.',
    'Lower slowly. Bend your knees to make it easier.',
  ]),
  ex('doorframe-row', 'Door-Frame Row', 'back', [], 'lats', ['Lats', 'Biceps'], [
    'Hold both sides of a solid door frame and lean back.',
    'Pull your chest toward the frame with a straight body.',
    'Lean further back to make it harder. Check the frame is solid first.',
  ]),
  ex('superman', 'Superman Extension', 'back', [], 'lower back', ['Lower back', 'Glutes'], [
    'Lie face down with your arms stretched forward.',
    'Lift your arms, chest and legs a few centimetres.',
    'Hold for a second, then lower slowly.',
  ]),
  ex('towel-shrug', 'Towel Shrug Hold', 'back', [], 'traps', ['Trapezius'], [
    'Stand on the middle of a towel and hold both ends.',
    'Pull up on the ends while you shrug your shoulders.',
    'Hold for 5 to 10 seconds, then relax.',
  ]),

  // ---------- SHOULDERS ----------
  ex('ohp', 'Overhead Press', 'shoulders', ['barbell'], 'shoulders', ['Shoulders', 'Triceps', 'Upper chest', 'Core'], [
    'Squeeze glutes, ribs down, bar starts on your front delts.',
    'Press straight up and move your head through at the top.',
    'Finish with the bar over mid-foot and shrug at lockout.',
  ], 'pike-pushup', ['Seated OHP', 'Push press (leg drive)']),
  ex('db-shoulder-press', 'Dumbbell Shoulder Press', 'shoulders', ['dumbbells'], 'shoulders', ['Shoulders', 'Triceps'], [
    'Start with the dumbbells at shoulder height, palms forward.',
    'Press up until your arms are straight, without arching your back.',
    'Lower back to your shoulders under control.',
  ], 'pike-pushup'),
  ex('lateral-raise', 'Dumbbell Lateral Raise', 'shoulders', ['dumbbells'], 'side delts', ['Side delts'], [
    'Stand tall with a slight bend in your elbows.',
    'Raise your arms out to the sides up to shoulder height.',
    'Lower slowly. Use light weights and no swinging.',
  ], 'side-lying-raise'),
  ex('reverse-fly', 'Reverse Fly', 'shoulders', ['dumbbells'], 'rear delts', ['Rear delts', 'Upper back'], [
    'Hinge forward with a flat back and soft elbows.',
    'Raise the dumbbells out to the sides, squeezing your shoulder blades.',
    'Lower slowly. Keep the weights light.',
  ], 'ytw-raise'),
  ex('face-pull', 'Face Pull', 'shoulders', ['cable'], 'rear delts', ['Rear delts', 'Upper back', 'Rotator cuff'], [
    'Set the cable at face height with a rope handle.',
    'Pull toward your face, elbows high and apart.',
    'Squeeze your shoulder blades and return slowly.',
  ], 'ytw-raise'),
  ex('pike-pushup', 'Pike Push-Up', 'shoulders', [], 'shoulders', ['Shoulders', 'Triceps', 'Upper chest'], [
    'Start in a downward-dog shape with your hips high.',
    'Lower the top of your head toward the floor.',
    'Press back up. Raise your feet on a chair to make it harder.',
  ]),
  ex('side-lying-raise', 'Side-Lying Arm Raise', 'shoulders', [], 'side delts', ['Side delts'], [
    'Lie on your side with your top arm straight along your body.',
    'Raise your arm up toward the ceiling, slowly.',
    'Lower and repeat, then switch sides.',
  ]),
  ex('ytw-raise', 'Y-T-W Raises', 'shoulders', [], 'rear delts and upper back', ['Rear delts', 'Rhomboids', 'Lower traps'], [
    'Lie face down with your arms out in a Y shape.',
    'Lift your arms, then move through a T and a W.',
    'Keep your neck relaxed and squeeze your shoulder blades.',
  ]),

  // ---------- ARMS ----------
  ex('curl', 'Barbell Bicep Curl', 'arms', ['barbell'], 'biceps', ['Biceps brachii'], [
    'Elbows pinned to your sides.',
    'Curl without swinging your torso.',
    'Lower under control to full extension.',
  ], 'isometric-curl', ['Straight bar or EZ-bar', 'Reverse grip (forearms, brachialis)']),
  ex('hammer-curl', 'Dumbbell Hammer Curl', 'arms', ['dumbbells'], 'biceps and forearms', ['Biceps', 'Brachialis', 'Forearms'], [
    'Hold the dumbbells with your palms facing each other.',
    'Curl up with your elbows pinned to your sides.',
    'Lower slowly, no swinging.',
  ], 'backpack-curl'),
  ex('skull', 'Skull Crushers', 'arms', ['barbell', 'bench'], 'triceps', ['Triceps'], [
    'Upper arms stay vertical and still.',
    'Lower the bar toward your forehead or just behind your head.',
    'Extend until your arms are locked out.',
  ], 'close-grip-pushup', ['EZ-bar recommended']),
  ex('tricep-pushdown', 'Cable Triceps Pushdown', 'arms', ['cable'], 'triceps', ['Triceps'], [
    'Stand close to the cable with your elbows at your sides.',
    'Push the handle down until your arms are straight.',
    'Let it rise slowly without moving your elbows.',
  ], 'bw-tricep-ext'),
  ex('close-grip-pushup', 'Close-Grip Push-Up', 'arms', [], 'triceps', ['Triceps', 'Chest', 'Front delts'], [
    'Place your hands under your shoulders or slightly closer.',
    'Keep your elbows tight to your ribs as you lower.',
    'Press up to straight arms.',
  ]),
  ex('bw-tricep-ext', 'Bodyweight Triceps Extension', 'arms', [], 'triceps', ['Triceps'], [
    'Put your hands on a sturdy table or counter and lean forward.',
    'Bend your elbows to lower your forehead toward your hands.',
    'Straighten your arms to come back up.',
  ]),
  ex('isometric-curl', 'Isometric Doorway Curl', 'arms', [], 'biceps', ['Biceps'], [
    'Hold the edge of a table or door frame from underneath.',
    'Pull upward as if curling, without moving.',
    'Hold for 10 seconds, rest, and repeat.',
  ]),
  ex('backpack-curl', 'Backpack Curl', 'arms', [], 'biceps', ['Biceps', 'Forearms'], [
    'Fill a backpack with books and hold it by the handle.',
    'Curl it up with your elbow pinned to your side.',
    'Lower slowly. Add more weight as you get stronger.',
  ]),

  // ---------- LEGS ----------
  ex('squat', 'Barbell Back Squat', 'legs', ['barbell', 'rack'], 'legs', ['Quadriceps', 'Glutes', 'Hamstrings', 'Core', 'Lower back'], [
    'Bar on your upper back, brace your core before every rep.',
    'Knees track over your toes, chest stays up.',
    'Hips reach at least knee level, then drive up through mid-foot.',
  ], 'air-squat', ['High-bar (more quad-dominant)', 'Low-bar (more posterior chain)']),
  ex('front-squat', 'Front Squat', 'legs', ['barbell', 'rack'], 'quads', ['Quadriceps', 'Upper back', 'Core'], [
    'Elbows high, bar resting on your front delts.',
    'Stay upright through the whole rep.',
    'Drive your elbows up as you stand out of the bottom.',
  ], 'air-squat'),
  ex('lunge', 'Barbell Walking Lunge', 'legs', ['barbell'], 'legs', ['Quadriceps', 'Glutes', 'Balance'], [
    'Take a long step and keep your torso upright.',
    'Back knee lightly touches just above the floor.',
    'Push through the front heel to step forward.',
  ], 'bw-lunge'),
  ex('hip-thrust', 'Barbell Hip Thrust', 'legs', ['barbell', 'bench'], 'glutes', ['Glute maximus'], [
    'Upper back on a bench, bar over your hips (use a pad).',
    'Chin tucked, shins vertical at the top.',
    'Squeeze the glutes hard without arching your lower back.',
  ], 'single-leg-bridge'),
  ex('bulgarian-split-squat', 'Bulgarian Split Squat', 'legs', ['dumbbells', 'bench'], 'quads and glutes', ['Quads', 'Glutes', 'Hamstrings'], [
    'Put your back foot on a bench behind you.',
    'Lower straight down until your front thigh is parallel to the floor.',
    'Drive through the front heel to stand.',
  ], 'split-squat'),
  ex('goblet-squat', 'Goblet Squat', 'legs', ['dumbbells'], 'quads and glutes', ['Quads', 'Glutes', 'Core'], [
    'Hold one dumbbell at your chest.',
    'Sit down between your knees with your chest up.',
    'Stand up by pushing the floor away.',
  ], 'air-squat'),
  ex('leg-curl', 'Lying Leg Curl', 'legs', ['machine'], 'hamstrings', ['Hamstrings'], [
    'Lie face down and set the pad just above your heels.',
    'Curl your heels toward your glutes.',
    'Lower slowly to a straight leg.',
  ], 'glute-ham-slide'),
  ex('air-squat', 'Bodyweight Squat', 'legs', [], 'quads and glutes', ['Quads', 'Glutes'], [
    'Stand with your feet shoulder-width apart.',
    'Sit down and back until your thighs are parallel to the floor.',
    'Stand up tall and squeeze your glutes.',
  ]),
  ex('split-squat', 'Bodyweight Split Squat', 'legs', [], 'quads and glutes', ['Quads', 'Glutes'], [
    'Put your back foot on a chair behind you.',
    'Lower straight down with an upright chest.',
    'Press through your front heel to stand.',
  ]),
  ex('glute-ham-slide', 'Glute-Ham Floor Slide', 'legs', [], 'hamstrings', ['Hamstrings', 'Glutes'], [
    'Lie on your back with your heels on towels on a smooth floor.',
    'Lift your hips, then slide your heels out slowly.',
    'Pull your heels back in and lower.',
  ]),
  ex('single-leg-bridge', 'Single-Leg Glute Bridge', 'legs', [], 'glutes', ['Glutes', 'Hamstrings'], [
    'Lie on your back with one foot flat and the other leg straight.',
    'Drive through your heel to lift your hips.',
    'Squeeze at the top and lower slowly. Switch legs.',
  ]),
  ex('bw-lunge', 'Bodyweight Walking Lunge', 'legs', [], 'legs', ['Quads', 'Glutes'], [
    'Take a long step forward.',
    'Lower until both knees are bent about 90 degrees.',
    'Push through the front heel and step through.',
  ]),

  // ---------- CORE ----------
  ex('ab-wheel', 'Ab Wheel Rollout', 'core', ['abwheel'], 'abs', ['Abs', 'Core', 'Lats'], [
    'Kneel and hold the wheel under your shoulders.',
    'Roll out as far as you can while keeping your back flat.',
    'Pull back using your abs, not your hips.',
  ], 'hollow-hold'),
  ex('hanging-leg-raise', 'Hanging Leg Raise', 'core', ['pullup'], 'lower abs', ['Lower abs', 'Hip flexors', 'Grip'], [
    'Hang from the bar with your shoulders pulled down.',
    'Raise your legs and curl your hips up slightly.',
    'Lower slowly without swinging.',
  ], 'hollow-hold'),
  ex('cable-woodchop', 'Cable Woodchop', 'core', ['cable'], 'obliques', ['Obliques', 'Core'], [
    'Set the cable high and stand side-on to it.',
    'Pull diagonally down across your body, turning from the torso.',
    'Return slowly and keep your hips facing forward.',
  ], 'russian-twist'),
  ex('hollow-hold', 'Hollow Hold', 'core', [], 'abs', ['Abs', 'Hip flexors'], [
    'Lie on your back and press your lower back into the floor.',
    'Lift your shoulders and legs a few centimetres.',
    'Hold for 20 to 30 seconds without arching.',
  ]),
  ex('russian-twist', 'Russian Twist', 'core', [], 'obliques', ['Obliques', 'Abs'], [
    'Sit with your knees bent and lean back slightly.',
    'Turn your shoulders from side to side.',
    'Lift your feet to make it harder.',
  ]),
  ex('side-plank', 'Side Plank', 'core', [], 'obliques', ['Obliques', 'Glutes', 'Shoulders'], [
    'Lie on your side with your elbow under your shoulder.',
    'Lift your hips so your body is in one straight line.',
    'Hold, then switch sides.',
  ]),
  ex('plank', 'Plank', 'core', [], 'abs', ['Abs', 'Core', 'Shoulders'], [
    'Elbows under shoulders, body in one straight line.',
    'Squeeze your glutes and brace your abs.',
    'Hold without letting your hips sag.',
  ]),
];

export const EXERCISE_MAP: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e])
);

/** What each exercise is best for, shown as "Best for ..." on protocol pages. */
export const FOCUS: Record<string, string> = Object.fromEntries(EXERCISES.map((e) => [e.id, e.focus]));
