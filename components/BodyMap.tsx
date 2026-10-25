import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';
import { useColors } from '../theme';
import type { BodyPart } from '../data/anatomy';
import { Label } from './Panel';

export default function BodyMap({ part, size = 96 }: { part: BodyPart; size?: number }) {
  const c = useColors();
  const BODY = c.body;
  const limb = (x1: number, y1: number, x2: number, y2: number, w: number) => (
    <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={BODY} strokeWidth={w} strokeLinecap="round" />
  );

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Svg width={size} height={size * 2} viewBox="0 0 120 240">
        <Circle cx={60} cy={22} r={14} fill={BODY} />
        {limb(60, 34, 60, 46, 10)}
        <Path d="M25 48 Q60 40 95 48 L88 120 L82 134 L38 134 L32 120 Z" fill={BODY} />

        {/* arms */}
        {limb(24, 54, 14, 100, 14)}
        {limb(14, 100, 12, 142, 11)}
        {limb(96, 54, 106, 100, 14)}
        {limb(106, 100, 108, 142, 11)}

        {/* legs */}
        {limb(46, 132, 44, 185, 22)}
        {limb(44, 185, 44, 228, 16)}
        {limb(74, 132, 76, 185, 22)}
        {limb(76, 185, 76, 228, 16)}

        {part.shapes.map((s, i) => (
          <Ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={c.accent} fillOpacity={0.9} />
        ))}
      </Svg>
      <Label style={{ color: c.muted }}>{part.view === 'front' ? 'Front view' : 'Back view'}</Label>
    </View>
  );
}
