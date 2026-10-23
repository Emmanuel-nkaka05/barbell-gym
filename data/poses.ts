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
  bar: Pt; // plate centre (side view of the barbell)
};

export type Demo = {
  a: Pose;
  b: Pose;
  captionA: string;
  captionB: string;
  bench?: boolean;
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
};
