import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useColors } from '../theme';

const SIZES = {
  large: { w: 40, h: 70, colon: 14, gap: 8, pad: 16, dot: 8 },
  small: { w: 22, h: 38, colon: 8, gap: 5, pad: 8, dot: 5 },
};
type Size = keyof typeof SIZES;

const pad2 = (n: number) => String(n).padStart(2, '0');

// Seven segments drawn as hexagons on a 24 x 42 grid
const SEG = {
  a: '5,3 7,1 17,1 19,3 17,5 7,5',
  b: '22,4 24,6 24,18 22,20 20,18 20,6',
  c: '22,22 24,24 24,36 22,38 20,36 20,24',
  d: '5,39 7,37 17,37 19,39 17,41 7,41',
  e: '2,22 4,24 4,36 2,38 0,36 0,24',
  f: '2,4 4,6 4,18 2,20 0,18 0,6',
  g: '5,21 7,19 17,19 19,21 17,23 7,23',
};
type SegKey = keyof typeof SEG;

const DIGITS: Record<string, SegKey[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

function Digit({ ch, size }: { ch: string; size: Size }) {
  const c = useColors();
  const d = SIZES[size];
  const on = DIGITS[ch] ?? [];
  return (
    <Svg width={d.w} height={d.h} viewBox="-2 -2 28 46">
      {(Object.keys(SEG) as SegKey[]).map((k) => {
        const lit = on.includes(k);
        return (
          <React.Fragment key={k}>
            {/* soft halo behind lit segments (no filters, so it works on every device) */}
            {lit && (
              <Polygon
                points={SEG[k]}
                fill={c.accent}
                fillOpacity={0.3}
                stroke={c.accent}
                strokeOpacity={0.35}
                strokeWidth={3}
                strokeLinejoin="round"
              />
            )}
            <Polygon points={SEG[k]} fill={c.accent} fillOpacity={lit ? 1 : 0.1} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

/** Old digit slides up and out, new digit slides in from below. */
function AnimatedDigit({ ch, size }: { ch: string; size: Size }) {
  const d = SIZES[size];
  const [cur, setCur] = useState(ch);
  const [prev, setPrev] = useState<string | null>(null);
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (ch === cur) return;
    setPrev(cur);
    setCur(ch);
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) setPrev(null);
      }
    );
  }, [ch]);

  return (
    <View style={{ width: d.w, height: d.h, overflow: 'hidden' }}>
      {prev !== null && (
        <Animated.View
          style={{
            position: 'absolute',
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -d.h] }) }],
          }}
        >
          <Digit ch={prev} size={size} />
        </Animated.View>
      )}
      <Animated.View
        style={{
          opacity: prev === null ? 1 : anim,
          transform: [{ translateY: prev === null ? 0 : anim.interpolate({ inputRange: [0, 1], outputRange: [d.h, 0] }) }],
        }}
      >
        <Digit ch={cur} size={size} />
      </Animated.View>
    </View>
  );
}

export default function DigitalTimer({
  seconds,
  size = 'large',
  style,
}: {
  seconds: number;
  size?: Size;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const d = SIZES[size];

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.25, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const text = h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
  const chars = text.split('');

  return (
    <View
      style={[
        {
          alignSelf: 'center',
          backgroundColor: c.panelRaised,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: c.edge,
          paddingVertical: d.pad,
          paddingHorizontal: d.pad + 4,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: d.gap }}>
        {chars.map((ch, i) => {
          const key = chars.length - i; // count from the right so tiles keep their place
          if (ch === ':') {
            return (
              <Animated.View
                key={key}
                style={{ width: d.colon, height: d.h, alignItems: 'center', justifyContent: 'center', gap: d.dot, opacity: pulse }}
              >
                <View style={{ width: d.dot, height: d.dot, borderRadius: d.dot / 2, backgroundColor: c.accent }} />
                <View style={{ width: d.dot, height: d.dot, borderRadius: d.dot / 2, backgroundColor: c.accent }} />
              </Animated.View>
            );
          }
          return <AnimatedDigit key={key} ch={ch} size={size} />;
        })}
      </View>
    </View>
  );
}
