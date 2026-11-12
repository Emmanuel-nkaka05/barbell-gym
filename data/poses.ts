export type Pt = [number, number];

export type Pose = {
  head: Pt;
  shoulder: Pt;
  hip: Pt;
  knee: Pt;
  ankle: Pt;
  toe: Pt;
  elbow: Pt;
  wrist: Pt;
  bar?: Pt; // plate centre (side view of the barbell). Leave it out for bodyweight moves and no plate is drawn
  // optional second leg (used for lunges), drawn behind the first
  knee2?: Pt;
  ankle2?: Pt;
  toe2?: Pt;
};

export type Demo = {
  a: Pose;
  b: Pose;
  captionA: string;
  captionB: string;
  bench?: boolean; // full flat bench (bench press, skull crushers)
  hipBench?: boolean; // short bench under the upper back (hip thrust)
  blocks?: [number, number, number, number][]; // x, y, w, h: chairs, tables, door frames
};

// Side view, figure facing right, drawn in a 240 x 220 box (ground at y = 178).
export const POSES: Record<string, Demo> = {
  squat: {
    captionA: 'Stand tall, bar on your upper back, brace your core.',
    captionB: 'Sit hips back and down, knees out, chest up.',
    a: {
      head: [115, 22], shoulder: [112, 38], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [98, 58], wrist: [106, 40], bar: [106, 38],
    },
    b: {
      head: [125, 91], shoulder: [112, 104], hip: [77, 140], knee: [122, 140], ankle: [112, 176],
      toe: [126, 176], elbow: [98, 124], wrist: [106, 106], bar: [106, 104],
    },
  },
  bench: {
    bench: true,
    captionA: 'Arms locked out, shoulder blades pinned back.',
    captionB: 'Lower to mid-chest under control, then press.',
    a: {
      head: [54, 138], shoulder: [72, 142], hip: [122, 142], knee: [160, 125], ankle: [158, 172],
      toe: [172, 174], elbow: [92, 118], wrist: [90, 92], bar: [90, 92],
    },
    b: {
      head: [54, 138], shoulder: [72, 142], hip: [122, 142], knee: [160, 125], ankle: [158, 172],
      toe: [172, 174], elbow: [98, 146], wrist: [96, 121], bar: [96, 121],
    },
  },
  deadlift: {
    captionA: 'Bar over mid-foot, flat back, take the slack out.',
    captionB: 'Push the floor away, lock hips and knees together.',
    a: {
      head: [138, 93], shoulder: [122, 102], hip: [80, 126], knee: [124, 140], ankle: [112, 176],
      toe: [126, 176], elbow: [120, 132], wrist: [118, 162], bar: [118, 164],
    },
    b: {
      head: [113, 23], shoulder: [112, 40], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [113, 71], wrist: [114, 100], bar: [114, 102],
    },
  },
  ohp: {
    captionA: 'Bar on your front delts, glutes tight, ribs down.',
    captionB: 'Press straight up and finish over mid-foot.',
    a: {
      head: [107, 23], shoulder: [112, 40], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [120, 68], wrist: [122, 40], bar: [122, 38],
    },
    b: {
      head: [114, 25], shoulder: [112, 40], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [114, 10], wrist: [116, -18], bar: [116, -18],
    },
  },
  row: {
    captionA: 'Hinge forward with a flat back, arms hanging straight.',
    captionB: 'Pull the bar to your lower ribs, elbows back, no swinging.',
    a: {
      head: [140, 66], shoulder: [126, 77], hip: [88, 112], knee: [120, 138], ankle: [112, 176],
      toe: [126, 176], elbow: [127, 107], wrist: [128, 134], bar: [128, 136],
    },
    b: {
      head: [140, 66], shoulder: [126, 77], hip: [88, 112], knee: [120, 138], ankle: [112, 176],
      toe: [126, 176], elbow: [98, 94], wrist: [118, 102], bar: [118, 104],
    },
  },
  shrug: {
    captionA: 'Stand tall, bar hanging at arm length against your thighs.',
    captionB: 'Lift your shoulders straight up toward your ears, then lower slowly.',
    a: {
      head: [115, 23], shoulder: [112, 40], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [113, 70], wrist: [114, 100], bar: [114, 102],
    },
    b: {
      head: [115, 23], shoulder: [112, 28], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [113, 58], wrist: [114, 88], bar: [114, 90],
    },
  },
  curl: {
    captionA: 'Arms straight, elbows pinned to your sides.',
    captionB: 'Curl the bar up without swinging, squeeze, then lower slowly.',
    a: {
      head: [115, 23], shoulder: [112, 40], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [114, 70], wrist: [118, 98], bar: [120, 100],
    },
    b: {
      head: [115, 23], shoulder: [112, 40], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [116, 70], wrist: [136, 52], bar: [138, 50],
    },
  },
  skull: {
    bench: true,
    captionA: 'Arms straight up over your shoulders, upper arms still.',
    captionB: 'Bend only at the elbows to lower the bar toward your forehead, then press back up.',
    a: {
      head: [54, 138], shoulder: [72, 142], hip: [122, 142], knee: [160, 125], ankle: [158, 172],
      toe: [172, 174], elbow: [74, 112], wrist: [76, 84], bar: [76, 84],
    },
    b: {
      head: [54, 138], shoulder: [72, 142], hip: [122, 142], knee: [160, 125], ankle: [158, 172],
      toe: [172, 174], elbow: [74, 112], wrist: [50, 114], bar: [50, 114],
    },
  },
  rdl: {
    captionA: 'Stand tall with the bar at your thighs, soft knees.',
    captionB: 'Push your hips back, slide the bar down your legs, keep your back flat.',
    a: {
      head: [115, 23], shoulder: [112, 40], hip: [112, 88], knee: [114, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [113, 70], wrist: [114, 100], bar: [114, 102],
    },
    b: {
      head: [136, 77], shoulder: [120, 86], hip: [78, 110], knee: [118, 138], ankle: [112, 176],
      toe: [126, 176], elbow: [121, 116], wrist: [121, 144], bar: [121, 146],
    },
  },
  'front-squat': {
    captionA: 'Bar on your front delts, elbows high, torso upright.',
    captionB: 'Sit straight down, keep your elbows up, then drive up.',
    a: {
      head: [115, 23], shoulder: [112, 40], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [136, 38], wrist: [118, 40], bar: [118, 38],
    },
    b: {
      head: [106, 77], shoulder: [101, 94], hip: [88, 142], knee: [130, 138], ankle: [112, 176],
      toe: [126, 176], elbow: [127, 88], wrist: [112, 92], bar: [112, 92],
    },
  },
  'hip-thrust': {
    hipBench: true,
    captionA: 'Upper back on the bench, bar over your hips, feet flat.',
    captionB: 'Drive through your heels and squeeze your glutes at the top.',
    a: {
      head: [34, 126], shoulder: [50, 127], hip: [92, 150], knee: [132, 130], ankle: [140, 172],
      toe: [154, 174], elbow: [70, 140], wrist: [91, 147], bar: [92, 146],
    },
    b: {
      head: [34, 122], shoulder: [50, 127], hip: [96, 128], knee: [140, 128], ankle: [140, 172],
      toe: [154, 174], elbow: [73, 132], wrist: [95, 125], bar: [96, 124],
    },
  },
  lunge: {
    captionA: 'Stand tall with the bar on your upper back.',
    captionB: 'Step long, lower until both knees are bent, then push through the front heel.',
    a: {
      head: [115, 22], shoulder: [112, 38], hip: [112, 88], knee: [112, 133], ankle: [112, 176],
      toe: [126, 176], elbow: [98, 58], wrist: [106, 40], bar: [106, 38],
      knee2: [112, 133], ankle2: [112, 176], toe2: [126, 176],
    },
    b: {
      head: [121, 63], shoulder: [118, 80], hip: [118, 130], knee: [160, 132], ankle: [156, 176],
      toe: [170, 176], elbow: [104, 100], wrist: [112, 82], bar: [112, 80],
      knee2: [92, 160], ankle2: [54, 166], toe2: [64, 176],
    },
  },
};

// ---------- no-equipment poses ----------
const P = (
  head: Pt, shoulder: Pt, hip: Pt, knee: Pt, ankle: Pt, toe: Pt, elbow: Pt, wrist: Pt,
  more: Partial<Pose> = {}
): Pose => ({ head, shoulder, hip, knee, ankle, toe, elbow, wrist, ...more });

/** Same motion as a barbell exercise, with the plate hidden. */
const nb = (d: Demo, o: Partial<Demo> = {}): Demo => ({
  ...d,
  a: { ...d.a, bar: undefined },
  b: { ...d.b, bar: undefined },
  ...o,
});

const pushA = P([168, 126], [150, 132], [112, 144], [78, 156], [40, 168], [32, 174], [152, 154], [152, 176]);
const pushB = P([168, 164], [150, 166], [112, 170], [78, 172], [40, 172], [32, 176], [132, 164], [152, 176]);
const push: Demo = {
  captionA: 'Hands under shoulders, body in one straight line.',
  captionB: 'Lower your chest to just above the floor, then press up.',
  a: pushA,
  b: pushB,
};
POSES['pushup'] = push;
POSES['wide-pushup'] = {
  ...push,
  captionA: 'Hands wider than your shoulders, body straight.',
  captionB: 'Lower until your chest nearly touches the floor.',
};
POSES['diamond-pushup'] = {
  ...push,
  captionA: 'Thumbs and fingers form a diamond under your chest.',
  captionB: 'Elbows stay close to your body as you lower.',
};
POSES['close-grip-pushup'] = {
  ...push,
  captionA: 'Hands just inside shoulder width.',
  captionB: 'Keep your elbows tight to your ribs as you lower.',
};

POSES['decline-pushup'] = {
  blocks: [[16, 108, 44, 70]],
  captionA: 'Feet on a chair, hands on the floor, body straight.',
  captionB: 'Lower under control, then press back up.',
  a: P([168, 134], [150, 134], [112, 124], [78, 116], [40, 106], [30, 108], [152, 156], [152, 176]),
  b: P([168, 164], [150, 164], [112, 148], [78, 128], [40, 106], [30, 108], [132, 166], [152, 176]),
};

POSES['pike-pushup'] = {
  captionA: 'Hips high in an upside-down V, head between your arms.',
  captionB: 'Lower the top of your head toward the floor, then press.',
  a: P([150, 142], [140, 130], [108, 90], [86, 131], [64, 172], [52, 176], [145, 154], [150, 176]),
  b: P([158, 158], [148, 148], [120, 104], [92, 138], [64, 172], [52, 176], [128, 150], [150, 176]),
};

POSES['bench-dips'] = {
  blocks: [[24, 126, 64, 52]],
  captionA: 'Hands on a sturdy chair behind you, arms straight.',
  captionB: 'Bend your elbows to about 90 degrees, then press up.',
  a: P([92, 66], [88, 84], [100, 130], [140, 140], [168, 176], [182, 176], [79, 105], [70, 126]),
  b: P([92, 90], [88, 108], [100, 152], [140, 156], [168, 176], [182, 176], [62, 116], [70, 126]),
};

POSES['inverted-row'] = {
  captionA: 'Under a sturdy table, body straight, arms extended.',
  captionB: 'Pull your chest to the table, then lower slowly.',
  a: P([166, 138], [150, 142], [112, 152], [78, 162], [40, 170], [30, 174], [150, 122], [150, 102], { bar: [150, 102] }),
  b: P([166, 106], [148, 110], [112, 128], [78, 150], [40, 170], [30, 174], [134, 108], [150, 102], { bar: [150, 102] }),
};

POSES['doorframe-row'] = {
  blocks: [[166, 30, 8, 148]],
  captionA: 'Hold the frame, lean back with a straight body.',
  captionB: 'Pull your chest toward the frame, then lean back again.',
  a: P([108, 52], [114, 70], [128, 106], [140, 140], [150, 176], [164, 176], [138, 72], [162, 74]),
  b: P([138, 50], [140, 68], [140, 104], [146, 140], [150, 176], [164, 176], [150, 92], [162, 74]),
};

POSES['superman'] = {
  captionA: 'Lie face down, arms stretched forward.',
  captionB: 'Lift arms, chest and legs a few centimetres, then lower.',
  a: P([166, 166], [148, 168], [110, 170], [76, 172], [40, 172], [28, 174], [172, 170], [196, 172]),
  b: P([166, 148], [148, 156], [110, 170], [76, 164], [40, 156], [28, 154], [174, 152], [198, 146]),
};

POSES['ytw-raise'] = {
  captionA: 'Lie face down, arms forward in a Y shape.',
  captionB: 'Lift your arms, then move through a T and a W. Squeeze your shoulder blades.',
  a: P([166, 166], [148, 168], [110, 170], [76, 172], [40, 172], [28, 174], [172, 170], [196, 172]),
  b: P([166, 160], [148, 164], [110, 170], [76, 172], [40, 172], [28, 174], [172, 150], [196, 140]),
};

POSES['towel-shrug'] = nb(POSES.shrug, {
  captionA: 'Stand on a towel and hold both ends at your sides.',
  captionB: 'Pull up on the towel while you shrug, hold, then relax.',
});
POSES['backpack-curl'] = nb(POSES.curl, {
  captionA: 'Hold the backpack handle, elbow pinned to your side.',
  captionB: 'Curl it up, squeeze, then lower slowly.',
});

POSES['isometric-curl'] = {
  blocks: [[120, 58, 60, 8]],
  captionA: 'Hook your hand under a table edge, elbow at 90 degrees.',
  captionB: 'Pull up as if curling, without moving. Hold for 10 seconds.',
  a: P([115, 23], [112, 40], [112, 88], [112, 133], [112, 176], [126, 176], [112, 68], [138, 68]),
  b: P([115, 23], [112, 40], [112, 88], [112, 133], [112, 176], [126, 176], [112, 66], [138, 65]),
};

POSES['bw-tricep-ext'] = {
  blocks: [[150, 100, 70, 10]],
  captionA: 'Hands on a sturdy table, body in a slanted line.',
  captionB: 'Bend your elbows to lower your forehead to your hands, then press.',
  a: P([140, 70], [128, 84], [96, 118], [68, 148], [40, 176], [54, 176], [146, 94], [162, 100]),
  b: P([150, 96], [136, 104], [102, 134], [72, 156], [40, 176], [54, 176], [148, 98], [162, 100]),
};

const sq = POSES.squat;
POSES['air-squat'] = {
  captionA: 'Feet shoulder-width apart, arms out in front.',
  captionB: 'Sit back and down until your thighs are parallel, then stand tall.',
  a: { ...sq.a, bar: undefined, elbow: [132, 42] as Pt, wrist: [152, 44] as Pt },
  b: { ...sq.b, bar: undefined, elbow: [132, 104] as Pt, wrist: [152, 106] as Pt },
};

POSES['bw-lunge'] = nb(POSES.lunge, {
  captionA: 'Stand tall, hands behind your head.',
  captionB: 'Take a long step, lower both knees to about 90 degrees, then step through.',
});

POSES['split-squat'] = {
  blocks: [[16, 138, 48, 40]],
  captionA: 'Back foot on a chair, front foot a long step ahead.',
  captionB: 'Lower straight down, then press through your front heel.',
  a: P([109, 22], [106, 38], [104, 86], [128, 134], [140, 176], [154, 176], [96, 62], [106, 84],
    { knee2: [86, 128], ankle2: [62, 134], toe2: [52, 136] }),
  b: P([109, 66], [106, 82], [104, 130], [146, 134], [140, 176], [154, 176], [98, 106], [106, 128],
    { knee2: [84, 160], ankle2: [62, 134], toe2: [52, 136] }),
};

POSES['glute-ham-slide'] = {
  captionA: 'Lie on your back, heels on towels, hips lifted.',
  captionB: 'Slide your heels out slowly, then pull them back in.',
  a: P([170, 168], [150, 166], [112, 142], [76, 124], [62, 172], [54, 176], [130, 168], [112, 172]),
  b: P([170, 168], [150, 166], [112, 142], [71, 157], [30, 172], [20, 174], [130, 168], [112, 172]),
};

POSES['single-leg-bridge'] = {
  captionA: 'One foot flat, the other leg straight, hips on the floor.',
  captionB: 'Drive through your heel and squeeze your glutes at the top.',
  a: P([170, 168], [150, 166], [112, 166], [86, 132], [66, 172], [78, 174], [130, 170], [112, 174],
    { knee2: [70, 148], ankle2: [30, 130], toe2: [22, 126] }),
  b: P([170, 168], [150, 166], [112, 138], [84, 126], [66, 172], [78, 174], [130, 170], [112, 174],
    { knee2: [70, 120], ankle2: [30, 100], toe2: [22, 96] }),
};

POSES['hollow-hold'] = {
  captionA: 'Lie flat, lower back pressed into the floor, arms overhead.',
  captionB: 'Lift shoulders and legs a few centimetres and hold without arching.',
  a: P([168, 170], [150, 170], [110, 170], [70, 172], [30, 172], [20, 174], [176, 170], [200, 170]),
  b: P([164, 140], [148, 150], [110, 170], [72, 158], [34, 140], [24, 138], [176, 134], [200, 128]),
};

POSES['russian-twist'] = {
  captionA: 'Sit leaning back, feet lifted, hands together to one side.',
  captionB: 'Turn your shoulders to the other side and keep going.',
  a: P([70, 102], [76, 118], [100, 166], [136, 142], [164, 160], [176, 160], [96, 126], [114, 126]),
  b: P([70, 102], [76, 118], [100, 166], [136, 142], [164, 160], [176, 160], [96, 134], [80, 132]),
};

POSES['side-plank'] = {
  captionA: 'Elbow under your shoulder, hips resting low.',
  captionB: 'Lift your hips so your body is one straight line. Hold, then switch sides.',
  a: P([168, 148], [150, 152], [112, 166], [78, 168], [40, 168], [30, 170], [150, 172], [172, 174]),
  b: P([168, 138], [150, 142], [112, 150], [78, 159], [40, 168], [30, 170], [150, 172], [172, 174]),
};

POSES['plank'] = {
  captionA: 'Elbows under shoulders, body in one straight line.',
  captionB: 'Squeeze your glutes and brace your abs. Do not let your hips sag.',
  a: P([168, 130], [150, 136], [112, 146], [78, 157], [40, 168], [30, 172], [150, 172], [172, 174]),
  b: P([168, 132], [150, 137], [112, 144], [78, 156], [40, 168], [30, 172], [150, 172], [172, 174]),
};

POSES['side-lying-raise'] = {
  captionA: 'Lie on your side, top arm resting along your body.',
  captionB: 'Raise your arm toward the ceiling slowly, then lower.',
  a: P([172, 160], [150, 164], [112, 168], [76, 170], [40, 172], [30, 174], [118, 164], [88, 164]),
  b: P([172, 160], [150, 164], [112, 168], [76, 170], [40, 172], [30, 174], [150, 134], [150, 104]),
};
