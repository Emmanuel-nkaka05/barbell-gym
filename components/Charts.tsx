import React from 'react';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { mono, useColors } from '../theme';

const W = 320;
const H = 170;
const PAD_L = 10;
const PAD_R = 10;
const PAD_T = 24;
const PAD_B = 24;

const short = (v: number) =>
  v >= 10000 ? `${Math.round(v / 1000)}k` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v));

export type BarDatum = { label: string; value: number; highlight?: boolean };
export type LineDatum = { label: string; value: number | null };

export function BarChart({ data }: { data: BarDatum[] }) {
  const c = useColors();
  const max = Math.max(...data.map((d) => d.value), 1);
  const plotH = H - PAD_T - PAD_B;
  const slot = (W - PAD_L - PAD_R) / data.length;
  const bw = slot * 0.58;

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <Line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke={c.edge} strokeWidth={1.5} />
      {data.map((d, i) => {
        const h = d.value > 0 ? Math.max(3, (d.value / max) * plotH) : 2;
        const x = PAD_L + i * slot + (slot - bw) / 2;
        const y = H - PAD_B - h;
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width={bw} height={h} rx={4} fill={c.accent} fillOpacity={d.highlight ? 1 : 0.45} />
            {d.value > 0 && (
              <SvgText x={x + bw / 2} y={y - 5} fill={c.text} fontSize={9} fontFamily={mono} textAnchor="middle">
                {short(d.value)}
              </SvgText>
            )}
            <SvgText x={x + bw / 2} y={H - 8} fill={c.muted} fontSize={9} fontFamily={mono} textAnchor="middle">
              {d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export function LineChart({ data }: { data: LineDatum[] }) {
  const c = useColors();
  const vals = data.filter((d) => d.value !== null).map((d) => d.value as number);
  if (vals.length === 0) return null;

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(max - min, max * 0.1, 1);
  const lo = min - span * 0.3;
  const hi = max + span * 0.3;
  const plotW = W - PAD_L - PAD_R - 16;
  const plotH = H - PAD_T - PAD_B;
  const x = (i: number) => PAD_L + 8 + (data.length === 1 ? plotW / 2 : (i * plotW) / (data.length - 1));
  const y = (v: number) => PAD_T + (1 - (v - lo) / (hi - lo)) * plotH;

  const pts: [number, number, number][] = [];
  data.forEach((d, i) => {
    if (d.value !== null) pts.push([x(i), y(d.value), d.value]);
  });

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <Line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke={c.edge} strokeWidth={1.5} />
      {pts.length > 1 && (
        <Polyline
          points={pts.map((p) => `${p[0]},${p[1]}`).join(' ')}
          fill="none"
          stroke={c.accent}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {pts.map((p, i) => (
        <React.Fragment key={i}>
          <Circle cx={p[0]} cy={p[1]} r={4} fill={c.accent} />
          <SvgText x={p[0]} y={p[1] - 9} fill={c.text} fontSize={9} fontFamily={mono} textAnchor="middle">
            {Math.round(p[2])}
          </SvgText>
        </React.Fragment>
      ))}
      {data.map((d, i) => (
        <SvgText key={i} x={x(i)} y={H - 8} fill={c.muted} fontSize={9} fontFamily={mono} textAnchor="middle">
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
}
