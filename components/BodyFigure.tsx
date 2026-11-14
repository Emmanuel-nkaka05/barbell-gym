import React from 'react';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useColors } from '../theme';
import { BODY_PARTS } from '../data/anatomy';

const MIRROR = 'translate(120, 0) scale(-1, 1)';

const TORSO =
  'M26 50 Q40 43 52 47 L68 47 Q80 43 94 50 Q99 58 97 70 L91 112 Q89 124 86 134 L34 134 Q31 124 29 112 L23 70 Q21 58 26 50 Z';
const ARM_UPPER = 'M26 50 Q14 52 12 66 L9 102 Q10 107 19 107 L26 103 L30 70 Z';
const ARM_LOWER = 'M9 104 L20 106 L26 104 L27 144 Q25 152 17 152 Q9 150 8 142 Z';
const THIGH = 'M33 132 L58 132 L56 192 L38 192 Z';
const SHIN = 'M38 190 L56 190 L54 234 Q47 240 41 234 Z';
const LIMBS = [ARM_UPPER, ARM_LOWER, THIGH, SHIN];
const NECK = 'M53 31 L67 31 L68 47 L52 47 Z';

// thin anatomical detail lines (mirrored where marked)
const DETAIL = {
  front: [
    { d: 'M52 49 Q44 50 36 53', m: true }, // collar bone
    { d: 'M60 50 L60 80' }, // sternum
    { d: 'M42 78 Q50 84 58 82', m: true }, // lower chest edge
    { d: 'M60 80 L60 122' }, // linea alba
    { d: 'M60 118 m-1.5 0 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0' }, // navel
    { d: 'M40 188 Q47 195 55 188', m: true }, // knee cap
    { d: 'M18 106 L18 140', m: true }, // forearm
  ],
  back: [
    { d: 'M60 46 L60 130' }, // spine
    { d: 'M52 72 Q44 82 46 94', m: true }, // shoulder blade
    { d: 'M60 130 L60 160' }, // glute crease
    { d: 'M36 192 Q47 198 57 192', m: true }, // back of knee
    { d: 'M44 200 L46 226', m: true }, // calf split
  ],
};

type Props = {
  view: 'front' | 'back';
  selected?: string[];
  onSelect?: (id: string) => void;
  width?: number;
  glow?: boolean;
};

export default function BodyFigure({ view, selected = [], onSelect, width = 130, glow = false }: Props) {
  const c = useColors();
  const pad = glow ? 40 : 0;
  const boxW = 120 + pad * 2;
  const height = (width * 240) / boxW;
  const parts = BODY_PARTS.filter((p) => p.view === view);
  const glowId = `glow-${view}`;
  const shadeId = `shade-${view}`;
  const litId = `lit-${view}`;

  const outline = [NECK, TORSO, ...LIMBS];

  return (
    <Svg width={width} height={height} viewBox={`${-pad} 0 ${boxW} 240`}>
      <Defs>
        {glow && (
          <RadialGradient id={glowId} cx="50%" cy="48%" r="50%">
            <Stop offset="0" stopColor={c.accent} stopOpacity="0.55" />
            <Stop offset="1" stopColor={c.accent} stopOpacity="0" />
          </RadialGradient>
        )}
        {/* soft light from the left gives the body volume */}
        <LinearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={c.text} stopOpacity="0.16" />
          <Stop offset="0.55" stopColor={c.text} stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </LinearGradient>
        <LinearGradient id={litId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.accent} stopOpacity="1" />
          <Stop offset="1" stopColor={c.accent} stopOpacity="0.72" />
        </LinearGradient>
      </Defs>

      {glow && <Rect x={-pad} y={0} width={boxW} height={240} fill={`url(#${glowId})`} />}

      {/* body base */}
      <Ellipse cx={60} cy={20} rx={12} ry={15} fill={c.body} stroke={c.muted} strokeOpacity={0.4} strokeWidth={1} />
      {outline.map((d, i) => (
        <React.Fragment key={i}>
          <Path d={d} fill={c.body} stroke={c.muted} strokeOpacity={0.4} strokeWidth={1} />
          <G transform={MIRROR}>
            <Path d={d} fill={c.body} stroke={c.muted} strokeOpacity={0.4} strokeWidth={1} />
          </G>
        </React.Fragment>
      ))}
      {/* hands and feet */}
      <Ellipse cx={17} cy={158} rx={7} ry={8} fill={c.body} stroke={c.muted} strokeOpacity={0.4} />
      <Ellipse cx={103} cy={158} rx={7} ry={8} fill={c.body} stroke={c.muted} strokeOpacity={0.4} />
      <Ellipse cx={47} cy={238} rx={11} ry={3.5} fill={c.body} stroke={c.muted} strokeOpacity={0.4} />
      <Ellipse cx={73} cy={238} rx={11} ry={3.5} fill={c.body} stroke={c.muted} strokeOpacity={0.4} />

      {/* volume shading over the whole body */}
      <G opacity={1}>
        {[TORSO, ...LIMBS].map((d, i) => (
          <React.Fragment key={i}>
            <Path d={d} fill={`url(#${shadeId})`} />
            <G transform={MIRROR}>
              <Path d={d} fill={`url(#${shadeId})`} />
            </G>
          </React.Fragment>
        ))}
      </G>

      {/* muscle groups */}
      {parts.map((p) => {
        const on = selected.includes(p.id);
        const press = onSelect ? () => onSelect(p.id) : undefined;
        const base = {
          fill: on ? `url(#${litId})` : c.muted,
          fillOpacity: on ? 1 : 0.16,
          stroke: on ? c.text : c.muted,
          strokeOpacity: on ? 0.7 : 0.45,
          strokeWidth: on ? 1.2 : 0.8,
          strokeLinejoin: 'round' as const,
        };
        return (
          <React.Fragment key={p.id}>
            {p.shapes.map((s, i) => (
              <React.Fragment key={i}>
                {on && <Path d={s.d} fill="none" stroke={c.accent} strokeOpacity={0.3} strokeWidth={5} strokeLinejoin="round" />}
                <Path d={s.d} {...base} onPress={press} />
                {s.mirror && (
                  <G transform={MIRROR}>
                    {on && <Path d={s.d} fill="none" stroke={c.accent} strokeOpacity={0.3} strokeWidth={5} strokeLinejoin="round" />}
                    <Path d={s.d} {...base} onPress={press} />
                  </G>
                )}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}

      {/* anatomical detail lines on top */}
      {DETAIL[view].map((l, i) => (
        <React.Fragment key={i}>
          <Path d={l.d} fill="none" stroke={c.muted} strokeOpacity={0.5} strokeWidth={0.8} strokeLinecap="round" />
          {l.m && (
            <G transform={MIRROR}>
              <Path d={l.d} fill="none" stroke={c.muted} strokeOpacity={0.5} strokeWidth={0.8} strokeLinecap="round" />
            </G>
          )}
        </React.Fragment>
      ))}
    </Svg>
  );
}