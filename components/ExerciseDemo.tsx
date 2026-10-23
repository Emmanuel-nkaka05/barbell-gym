import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { mono, radius, useColors } from '../theme';
import { POSES, Pt } from '../data/poses';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

const LOOP_MS = 4000;
const TICK_MS = 40;

export default function ExerciseDemo({ exerciseId, height = 230 }: { exerciseId: string; height?: number }) {
  const c = useColors();
  const demo = POSES[exerciseId];
  const [p, setP] = useState(0);
  const [playing, setPlaying] = useState(true);
  const phase = useRef(0);

  useEffect(() => {
    if (!demo || !playing) return;
    const id = setInterval(() => {
      phase.current = (phase.current + TICK_MS / LOOP_MS) % 1;
      const wave = 0.5 - 0.5 * Math.cos(2 * Math.PI * phase.current); // 0 -> 1 -> 0
      setP(Math.min(1, Math.max(0, (wave - 0.1) / 0.8))); // short pause at both ends
    }, TICK_MS);
    return () => clearInterval(id);
  }, [demo, playing]);

  if (!demo) return null;

  const at = (k: keyof typeof demo.a) => mix(demo.a[k], demo.b[k], p);
  const head = at('head');
  const shoulder = at('shoulder');
  const hip = at('hip');
  const knee = at('knee');
  const ankle = at('ankle');
  const toe = at('toe');
  const elbow = at('elbow');
  const wrist = at('wrist');
  const bar = at('bar');

  const limb = (from: Pt, to: Pt, w = 7) => (
    <Line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      stroke={c.text}
      strokeWidth={w}
      strokeLinecap="round"
    />
  );

  return (
    <Pressable
      onPress={() => setPlaying((v) => !v)}
      style={{
        backgroundColor: c.panelRaised,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: c.edge,
        overflow: 'hidden',
      }}
    >
      <Svg width="100%" height={height} viewBox="0 -30 240 220">
        <Line x1={10} y1={178} x2={230} y2={178} stroke={c.edge} strokeWidth={2} />
        {demo.bench && (
          <>
            <Rect x={40} y={148} width={150} height={8} rx={3} fill={c.panel} stroke={c.edge} strokeWidth={1.5} />
            <Line x1={55} y1={156} x2={55} y2={178} stroke={c.edge} strokeWidth={4} />
            <Line x1={175} y1={156} x2={175} y2={178} stroke={c.edge} strokeWidth={4} />
          </>
        )}

        {/* legs and torso */}
        {limb(ankle, toe, 6)}
        {limb(ankle, knee)}
        {limb(knee, hip)}
        {limb(hip, shoulder, 9)}
        {limb(shoulder, head, 4)}
        <Circle cx={head[0]} cy={head[1]} r={10} fill={c.panelRaised} stroke={c.text} strokeWidth={3} />

        {/* arm */}
        {limb(shoulder, elbow, 6)}
        {limb(elbow, wrist, 5)}

        {/* barbell plate (side view) */}
        <Circle cx={bar[0]} cy={bar[1]} r={14} fill="none" stroke={c.accent} strokeWidth={5} />
        <Circle cx={bar[0]} cy={bar[1]} r={3} fill={c.accent} />
      </Svg>

      <View style={{ paddingHorizontal: 14, paddingBottom: 12, gap: 4 }}>
        <Text style={{ color: c.text, fontSize: 13, lineHeight: 19 }}>{p < 0.5 ? demo.captionA : demo.captionB}</Text>
        <Text style={{ color: c.muted, fontFamily: mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>
          {playing ? 'Tap to pause' : 'Paused, tap to play'}
        </Text>
      </View>
    </Pressable>
  );
}
