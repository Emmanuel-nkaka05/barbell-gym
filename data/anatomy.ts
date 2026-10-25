export type Highlight = { cx: number; cy: number; rx: number; ry: number };

export type BodyPart = {
  id: string;
  name: string;
  view: 'front' | 'back';
  shapes: Highlight[]; // drawn on a 120 x 240 body outline
  where: string;
  use: string;
  lifts: string[]; // exercise ids from the library
};

export const BODY_PARTS: BodyPart[] = [
  {
    id: 'chest',
    name: 'Chest (pectorals)',
    view: 'front',
    shapes: [
      { cx: 47, cy: 66, rx: 14, ry: 10 },
      { cx: 73, cy: 66, rx: 14, ry: 10 },
    ],
    where: 'Across the front of your upper ribcage, from the breastbone out to the shoulders.',
    use: 'Pushes your arms forward and across your body. It does the work when you press something away from you, like a bench press or a push-up.',
    lifts: ['bench', 'ohp'],
  },
  {
    id: 'front-delts',
    name: 'Shoulders (front delts)',
    view: 'front',
    shapes: [
      { cx: 28, cy: 57, rx: 9, ry: 9 },
      { cx: 92, cy: 57, rx: 9, ry: 9 },
    ],
    where: 'The rounded front cap of each shoulder.',
    use: 'Lifts your arm forward and overhead and keeps the shoulder joint steady. They carry much of the load in any overhead or bench press.',
    lifts: ['ohp', 'bench'],
  },
  {
    id: 'biceps',
    name: 'Biceps',
    view: 'front',
    shapes: [
      { cx: 19, cy: 78, rx: 6, ry: 14 },
      { cx: 101, cy: 78, rx: 6, ry: 14 },
    ],
    where: 'The front of your upper arm, between the shoulder and the elbow.',
    use: 'Bends your elbow and turns your palm upward. They help in every pulling movement, like rows, and do the main work in curls.',
    lifts: ['curl', 'row'],
  },
  {
    id: 'forearms',
    name: 'Forearms and grip',
    view: 'front',
    shapes: [
      { cx: 13, cy: 120, rx: 5, ry: 16 },
      { cx: 107, cy: 120, rx: 5, ry: 16 },
    ],
    where: 'Between your elbow and your wrist.',
    use: 'Close your hand and hold on to the bar. Grip often decides how much you can deadlift or row, and strong forearms protect your wrists and elbows.',
    lifts: ['deadlift', 'shrug', 'row', 'curl'],
  },
  {
    id: 'core',
    name: 'Core (abs and obliques)',
    view: 'front',
    shapes: [{ cx: 60, cy: 100, rx: 14, ry: 24 }],
    where: 'Your midsection, from the bottom of the ribcage to the pelvis, wrapping around your sides.',
    use: 'Braces your spine like a belt. A tight core passes force between your legs and upper body and protects your lower back in squats, deadlifts and presses.',
    lifts: ['squat', 'deadlift', 'ohp', 'front-squat'],
  },
  {
    id: 'quads',
    name: 'Quadriceps',
    view: 'front',
    shapes: [
      { cx: 46, cy: 160, rx: 11, ry: 24 },
      { cx: 74, cy: 160, rx: 11, ry: 24 },
    ],
    where: 'The front of your thigh, from the hip to the knee.',
    use: 'Straighten your knee. They push you up out of a squat or lunge, carry you up stairs and protect the knee joint.',
    lifts: ['squat', 'front-squat', 'lunge'],
  },
  {
    id: 'traps',
    name: 'Traps (trapezius)',
    view: 'back',
    shapes: [{ cx: 60, cy: 50, rx: 22, ry: 9 }],
    where: 'A diamond-shaped muscle from the base of your skull across the tops of your shoulders and down your upper back.',
    use: 'Lifts and braces your shoulder blades. They hold your shoulders in place when you carry or deadlift heavy weight, and they do the shrug.',
    lifts: ['shrug', 'deadlift'],
  },
  {
    id: 'rear-delts',
    name: 'Rear delts',
    view: 'back',
    shapes: [
      { cx: 27, cy: 57, rx: 9, ry: 9 },
      { cx: 93, cy: 57, rx: 9, ry: 9 },
    ],
    where: 'The back of each shoulder, behind the joint.',
    use: 'Pull your arm backward and keep the shoulder joint stable. They balance all the pressing you do and support good posture.',
    lifts: ['row'],
  },
  {
    id: 'rhomboids',
    name: 'Mid back (rhomboids)',
    view: 'back',
    shapes: [{ cx: 60, cy: 68, rx: 12, ry: 11 }],
    where: 'Between your shoulder blades, underneath the traps.',
    use: 'Squeeze your shoulder blades together and hold them in place. They keep you upright, protect your shoulders and help you set your back for the bench press.',
    lifts: ['row', 'bench'],
  },
  {
    id: 'lats',
    name: 'Lats (latissimus dorsi)',
    view: 'back',
    shapes: [
      { cx: 45, cy: 88, rx: 11, ry: 20 },
      { cx: 75, cy: 88, rx: 11, ry: 20 },
    ],
    where: 'The broad muscles down the sides of your back, from under your arms to your lower back.',
    use: 'Pull your arms down and back, like in a row or pull-up. They also keep your spine stable and the bar close to you during a deadlift.',
    lifts: ['row', 'deadlift'],
  },
  {
    id: 'triceps',
    name: 'Triceps',
    view: 'back',
    shapes: [
      { cx: 19, cy: 78, rx: 6, ry: 14 },
      { cx: 101, cy: 78, rx: 6, ry: 14 },
    ],
    where: 'The back of your upper arm, from the shoulder blade to the elbow.',
    use: 'Straighten your elbow. They finish every pressing movement, so strong triceps add weight to your bench and overhead press.',
    lifts: ['bench', 'ohp', 'skull'],
  },
  {
    id: 'lower-back',
    name: 'Lower back (erector spinae)',
    view: 'back',
    shapes: [{ cx: 60, cy: 112, rx: 14, ry: 12 }],
    where: 'Two columns of muscle running along either side of your spine, from the pelvis up toward the neck.',
    use: 'Keep your back straight while you bend forward and lift. They work hard in deadlifts, rows and Romanian deadlifts, so keep your form strict to protect them.',
    lifts: ['deadlift', 'rdl', 'row', 'squat'],
  },
  {
    id: 'glutes',
    name: 'Glutes',
    view: 'back',
    shapes: [
      { cx: 49, cy: 140, rx: 12, ry: 11 },
      { cx: 71, cy: 140, rx: 12, ry: 11 },
    ],
    where: 'Your buttocks, at the back of the hips.',
    use: 'Extend your hip, which means standing up out of a squat, driving up from the floor in a deadlift or thrusting your hips up. The gluteus maximus is the largest muscle in your body.',
    lifts: ['squat', 'deadlift', 'hip-thrust', 'rdl', 'lunge'],
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    view: 'back',
    shapes: [
      { cx: 46, cy: 168, rx: 11, ry: 22 },
      { cx: 74, cy: 168, rx: 11, ry: 22 },
    ],
    where: 'The back of your thigh, from the hip to just below the knee.',
    use: 'Bend your knee and help extend your hip. They take heavy load in deadlifts and Romanian deadlifts, and strong hamstrings protect your knees.',
    lifts: ['deadlift', 'rdl', 'squat'],
  },
];
