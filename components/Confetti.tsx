import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { radius, useColors } from '../theme';

const COLORS = ['#FFD700', '#FF2E55', '#00F0FF', '#3DDC97', '#FF8A3D', '#FFFFFF'];

export function Confetti({ count = 40 }: { count?: number }) {
  const { width: W, height: H } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * W,
        size: 6 + Math.random() * 7,
        delay: Math.random() * 700,
        dur: 1800 + Math.random() * 1600,
        spin: 360 + Math.random() * 720,
        color: COLORS[i % COLORS.length],
        v: new Animated.Value(0),
      })),
    []
  );

  useEffect(() => {
    pieces.forEach((p) =>
      Animated.timing(p.v, {
        toValue: 1,
        duration: p.dur,
        delay: p.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start()
    );
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: -20,
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, H + 40] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

/** Pulsing accent glow behind a card. Put it as the first child of a relative-positioned Panel. */
export function PulseGlow() {
  const c = useColors();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: radius.card,
          backgroundColor: c.accent,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.2] }),
        },
      ]}
    />
  );
}