import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { fonts, useColors } from '../theme';

const TILE_W = 38;
const TILE_H = 54;

const pad = (n: number) => String(n).padStart(2, '0');

/** One digit tile. When the digit changes, the old one slides up and out and the new one slides in from below. */
function Digit({ ch }: { ch: string }) {
  const c = useColors();
  const [cur, setCur] = useState(ch);
  const [prev, setPrev] = useState(ch);
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (ch === cur) return;
    setPrev(cur);
    setCur(ch);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [ch]);

  const text = {
    color: c.accent,
    fontFamily: fonts.dots,
    fontSize: 40,
  } as const;

  return (
    <View
      style={{
        width: TILE_W,
        height: TILE_H,
        borderRadius: 10,
        backgroundColor: c.panelRaised,
        borderWidth: 1,
        borderColor: c.edge,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -TILE_H] }) }],
          },
        ]}
      >
        <Animated.Text style={text}>{prev}</Animated.Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.fill,
          {
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [TILE_H, 0] }) }],
          },
        ]}
      >
        <Animated.Text style={text}>{cur}</Animated.Text>
      </Animated.View>
    </View>
  );
}

/** A digital clock with sliding digits and a blinking colon. Shows M:SS and adds hours after the first hour. */
export default function DigitalTimer({ seconds }: { seconds: number }) {
  const c = useColors();
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const text = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  const chars = text.split('');

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {chars.map((ch, i) => {
        // keys count from the right, so a digit keeps its tile when the clock grows an hour digit
        const key = chars.length - i;
        return ch === ':' ? (
          <Animated.Text
            key={key}
            style={{ color: c.accent, fontFamily: fonts.dots, fontSize: 36, opacity: blink }}
          >
            :
          </Animated.Text>
        ) : (
          <Digit key={key} ch={ch} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
});
