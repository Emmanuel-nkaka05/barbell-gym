import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../theme';

const ARC = 'M 10 62 A 50 50 0 0 1 110 62';
const LENGTH = Math.PI * 50;

/** A half-circle progress arc. progress is 0 to 1. */
export default function Gauge({ progress, color, height = 62 }: { progress: number; color?: string; height?: number }) {
  const c = useColors();
  const p = Math.min(1, Math.max(0, progress));
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width="100%" height={height} viewBox="0 0 120 70">
        <Path d={ARC} stroke={c.edge} strokeWidth={8} strokeLinecap="round" fill="none" />
        {p > 0 && (
          <Path
            d={ARC}
            stroke={color ?? c.accent}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${LENGTH * p} ${LENGTH}`}
          />
        )}
      </Svg>
    </View>
  );
}
