// Shapes are SVG paths drawn on a 120 x 240 body outline.
// When mirror is true the same shape is drawn again on the other side of the body.
export type Shape = { d: string; mirror?: boolean };

export type BodyPart = {
  id: string;
  name: string;
  view: 'front' | 'back';
  shapes: Shape[];
  where: string;
  use: string;
  lifts: string[]; // exercise ids from the library
};

const DELT = 'M26 50 Q35 45 38 55 Q36 66 30 70 Q22 67 22 58 Q22 52 26 50 Z';
const ARM_FRONT = 'M19 72 Q26 72 29 78 L27 98 Q22 102 16 98 Q13 86 19 72 Z';

export const BODY_PARTS: BodyPart[] = [
  {
    id: 'chest',
    name: 'Chest (pectorals)',
    view: 'front',
    shapes: [{ d: 'M58 52 Q48 49 37 55 Q34 66 40 75 Q50 79 58 73 Z', mirror: true }],
    where: 'Across the front of your upper ribcage, from the breastbone out to the shoulders.',
    use: 'Pushes your arms forward and across your body. It does the work when you press something away from you, like a bench press or a push-up.',
    lifts: ['bench', 'ohp'],
  },
  {
    id: 'front-delts',
    name: 'Shoulders (front delts)',
    view: 'front',
    shapes: [{ d: DELT, mirror: true }],
    where: 'The rounded front cap of each shoulder.',
    use: 'Lifts your arm forward and overhead and keeps the shoulder joint steady. They carry much of the load in any overhead or bench press.',
    lifts: ['ohp', 'bench'],
  },
  {
    id: 'biceps',
    name: 'Biceps',
    view: 'front',
    shapes: [{ d: ARM_FRONT, mirror: true }],
    where: 'The front of your upper arm, between the shoulder and the elbow.',
    use: 'Bends your elbow and turns your palm upward. They help in every pulling movement, like rows, and do the main work in curls.',
    lifts: ['curl', 'row'],
  },
  {
    id: 'forearms',
    name: 'Forearms and grip',
    view: 'front',
    shapes: [{ d: 'M12 108 L22 108 L24 140 Q20 146 14 142 Z', mirror: true }],
    where: 'Between your elbow and your wrist.',
    use: 'Close your hand and hold on to the bar. Grip often decides how much you can deadlift or row, and strong forearms protect your wrists and elbows.',
    lifts: ['deadlift', 'shrug', 'row', 'curl'],
  },
  {
    id: 'core',
    name: 'Core (abs and obliques)',
    view: 'front',
    shapes: [
      { d: 'M54 80 L66 80 L67 118 Q60 126 53 118 Z' },
      { d: 'M42 84 L51 84 L51 116 Q45 118 41 110 Z', mirror: true },
    ],
    where: 'Your midsection, from the bottom of the ribcage to the pelvis, wrapping around your sides.',
    use: 'Braces your spine like a belt. A tight core passes force between your legs and upper body and protects your lower back in squats, deadlifts and presses.',
    lifts: ['squat', 'deadlift', 'ohp', 'front-squat'],
  },
  {
    id: 'quads',
    name: 'Quadriceps',
    view: 'front',
    shapes: [{ d: 'M36 136 L57 136 L55 188 L40 188 Z', mirror: true }],
    where: 'The front of your thigh, from the hip to the knee.',
    use: 'Straighten your knee. They push you up out of a squat or lunge, carry you up stairs and protect the knee joint.',
    lifts: ['squat', 'front-squat', 'lunge'],
  },
  {
    id: 'traps',
    name: 'Traps (trapezius)',
    view: 'back',
    shapes: [{ d: 'M60 44 Q48 45 38 52 Q42 60 50 66 L60 70 L70 66 Q78 60 82 52 Q72 45 60 44 Z' }],
    where: 'A diamond-shaped muscle from the base of your skull across the tops of your shoulders and down your upper back.',
    use: 'Lifts and braces your shoulder blades. They hold your shoulders in place when you carry or deadlift heavy weight, and they do the shrug.',
    lifts: ['shrug', 'deadlift'],
  },
  {
    id: 'rear-delts',
    name: 'Rear delts',
    view: 'back',
    shapes: [{ d: DELT, mirror: true }],
    where: 'The back of each shoulder, behind the joint.',
    use: 'Pull your arm backward and keep the shoulder joint stable. They balance all the pressing you do and support good posture.',
    lifts: ['row'],
  },
  {
    id: 'rhomboids',
    name: 'Mid back (rhomboids)',
    view: 'back',
    shapes: [{ d: 'M50 71 L60 73 L70 71 L68 90 L60 95 L52 90 Z' }],
    where: 'Between your shoulder blades, underneath the traps.',
    use: 'Squeeze your shoulder blades together and hold them in place. They keep you upright, protect your shoulders and help you set your back for the bench press.',
    lifts: ['row', 'bench'],
  },
  {
    id: 'lats',
    name: 'Lats (latissimus dorsi)',
    view: 'back',
    shapes: [{ d: 'M32 68 Q40 74 51 90 L51 114 Q42 116 36 110 L32 84 Z', mirror: true }],
    where: 'The broad muscles down the sides of your back, from under your arms to your lower back.',
    use: 'Pull your arms down and back, like in a row or pull-up. They also keep your spine stable and the bar close to you during a deadlift.',
    lifts: ['row', 'deadlift'],
  },
  {
    id: 'triceps',
    name: 'Triceps',
    view: 'back',
    shapes: [{ d: 'M19 70 Q26 70 29 77 L27 98 Q22 102 16 98 Q13 86 19 70 Z', mirror: true }],
    where: 'The back of your upper arm, from the shoulder blade to the elbow.',
    use: 'Straighten your elbow. They finish every pressing movement, so strong triceps add weight to your bench and overhead press.',
    lifts: ['bench', 'ohp', 'skull'],
  },
  {
    id: 'lower-back',
    name: 'Lower back (erector spinae)',
    view: 'back',
    shapes: [{ d: 'M51 104 L69 104 L69 128 Q60 134 51 128 Z' }],
    where: 'Two columns of muscle running along either side of your spine, from the pelvis up toward the neck.',
    use: 'Keep your back straight while you bend forward and lift. They work hard in deadlifts, rows and Romanian deadlifts, so keep your form strict to protect them.',
    lifts: ['deadlift', 'rdl', 'row', 'squat'],
  },
  {
    id: 'glutes',
    name: 'Glutes',
    view: 'back',
    shapes: [{ d: 'M36 130 L59 130 L58 158 Q47 164 38 156 Z', mirror: true }],
    where: 'Your buttocks, at the back of the hips.',
    use: 'Extend your hip, which means standing up out of a squat, driving up from the floor in a deadlift or thrusting your hips up. The gluteus maximus is the largest muscle in your body.',
    lifts: ['squat', 'deadlift', 'hip-thrust', 'rdl', 'lunge'],
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    view: 'back',
    shapes: [{ d: 'M38 162 L57 162 L55 190 L41 190 Z', mirror: true }],
    where: 'The back of your thigh, from the hip to just below the knee.',
    use: 'Bend your knee and help extend your hip. They take heavy load in deadlifts and Romanian deadlifts, and strong hamstrings protect your knees.',
    lifts: ['deadlift', 'rdl', 'squat'],
  },
  {
    id: 'calves',
    name: 'Calves',
    view: 'back',
    shapes: [{ d: 'M41 196 L54 196 L52 228 Q47 232 43 228 Z', mirror: true }],
    where: 'The back of your lower leg, between the knee and the ankle.',
    use: 'Point your foot down and lift you onto your toes. They steady you and help you push off in squats and lunges, and they protect the ankle.',
    lifts: ['squat', 'lunge'],
  },
];

/** Ids of the body parts trained by a list of exercises. */
export const partsForExercises = (exerciseIds: string[]) =>
  BODY_PARTS.filter((p) => p.lifts.some((l) => exerciseIds.includes(l))).map((p) => p.id);
