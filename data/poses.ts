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
