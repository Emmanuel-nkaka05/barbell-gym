import React from 'react';
import Svg, { Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useColors } from '../theme';
import { BODY_PARTS } from '../data/anatomy';

// Draws the other side of a shape by flipping it around the middle of the 120 wide body.
const MIRROR = 'translate(120, 0) scale(-1, 1)';

const TORSO =
  'M26 50 Q40 43 52 47 L68 47 Q80 43 94 50 Q99 58 97 70 L91 112 Q89 124 86 134 L34 134 Q31 124 29 112 L23 70 Q21 58 26 50 Z';
const ARM_UPPER = 'M26 50 Q14 52 12 66 L9 102 Q10 107 19 107 L26 103 L30 70 Z';
const ARM_LOWER = 'M9 104 L20 106 L26 104 L27 144 Q25 152 17 152 Q9 150 8 142 Z';
const THIGH = 'M33 132 L58 132 L56 192 L38 192 Z';
const SHIN = 'M38 190 L56 190 L54 234 Q47 240 41 234 Z';
const LIMBS = [ARM_UPPER, ARM_LOWER, THIGH, SHIN];

type Props = {
  view: 'front' | 'back';
  selected?: string[]; // ids of the muscle groups to light up
  onSelect?: (id: string) => void;
  width?: number;
  glow?: boolean; // soft light behind the figure
};

export default function BodyFigure({ view, selected = [], onSelect, width = 130, glow = false }: Props) {
  const c = useColors();
  const pad = glow ? 40 : 0;
  const boxW = 120 + pad * 2;
  const height = (width * 240) / boxW;
  const parts = BODY_PARTS.filter((p) => p.view === view);
  const gradId = `glow-${view}`;

  return (
    <Svg width={width} height={height} viewBox={`${-pad} 0 ${boxW} 240`}>
      {glow && (
        <>
          <Defs>
            <RadialGradient id={gradId} cx="50%" cy="48%" r="50%">
              <Stop offset="0" stopColor={c.accent} stopOpacity="0.55" />
              <Stop offset="1" stopColor={c.accent} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x={-pad} y={0} width={boxW} height={240} fill={`url(#${gradId})`} />
        </>
      )}

      {/* body outline */}
      <Ellipse cx={60} cy={20} rx={12} ry={15} fill={c.body} />
      <Path d="M54 33 L66 33 L68 47 L52 47 Z" fill={c.body} />
      <Path d={TORSO} fill={c.body} />
      {LIMBS.map((d, i) => (
        <React.Fragment key={i}>
          <Path d={d} fill={c.body} />
          <G transform={MIRROR}>
            <Path d={d} fill={c.body} />
          </G>
        </React.Fragment>
      ))}

      {/* muscle groups: lit ones use the theme color */}
      {parts.map((p) => {
        const on = selected.includes(p.id);
        const style = {
          fill: on ? c.accent : c.body,
          fillOpacity: on ? 0.92 : 1,
          stroke: on ? c.text : c.muted,
          strokeOpacity: on ? 0.55 : 0.35,
          strokeWidth: 1,
        };
        const press = onSelect ? () => onSelect(p.id) : undefined;
        return (
          <React.Fragment key={p.id}>
            {p.shapes.map((s, i) => (
              <React.Fragment key={i}>
                <Path d={s.d} {...style} onPress={press} />
                {s.mirror && (
                  <G transform={MIRROR}>
                    <Path d={s.d} {...style} onPress={press} />
                  </G>
                )}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
