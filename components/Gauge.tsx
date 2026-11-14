import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../theme';

const ARC = 'M 10 62 A 50 50 0 0 1 110 62';
const LENGTH = Math.PI * 50;
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** A half-circle progress arc that fills smoothly. progress is 0 to 1. */
export default function Gauge({ progress, color, height = 62 }: { progress: number; color?: string; height?: number }) {
  const c = useColors();
  const p = Math.min(1, Math.max(0, progress || 0));
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, { toValue: p, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [p]);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width="100%" height={height} viewBox="0 0 120 70">
        <Path d={ARC} stroke={c.edge} strokeWidth={8} strokeLinecap="round" fill="none" />
        <AnimatedPath
          d={ARC}
          stroke={color ?? c.accent}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${LENGTH} ${LENGTH}`}
          strokeDashoffset={v.interpolate({ inputRange: [0, 1], outputRange: [LENGTH, 0] })}
          opacity={v.interpolate({ inputRange: [0, 0.01], outputRange: [0, 1], extrapolate: 'clamp' })}
        />
      </Svg>
    </View>
  );
}