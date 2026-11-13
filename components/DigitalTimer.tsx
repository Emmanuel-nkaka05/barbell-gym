import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';
import { fonts, useColors } from '../theme';

const SIZES = {
  large: { w: 38, h: 54, font: 38, colon: 36, gap: 6 },
  small: { w: 26, h: 38, font: 26, colon: 24, gap: 4 },
};
type Size = keyof typeof SIZES;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * One digit tile. The digit is always drawn as plain text, so it can never go missing.
 * When it changes, the old digit slides up and out while the new one slides in from below.
 */
function Digit({ ch, size }: { ch: string; size: Size }) {
  const c = useColors();
  const d = SIZES[size];
  const [cur, setCur] = useState(ch);
  const [prev, setPrev] = useState<string | null>(null);
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (ch === cur) return;
    setPrev(cur);
    setCur(ch);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setPrev(null);
    });
  }, [ch]);

  const text = {
    width: '100%' as const,
    textAlign: 'center' as const,
    textAlignVertical: 'center' as const,
    includeFontPadding: false,
    color: c.accent,
    fontFamily: fonts.dots,
    fontSize: d.font,
    lineHeight: d.h,
  };

  const moving = prev !== null;

  return (
    <View
      style={{
        width: d.w,
        height: d.h,
        borderRadius: 10,
        backgroundColor: c.panelRaised,
        borderWidth: 1,
        borderColor: c.edge,
        overflow: 'hidden',
      }}
    >
      {moving && (
        <Animated.Text
          style={[
            text,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -d.h] }) }],
            },
          ]}
        >
          {prev}
        </Animated.Text>
      )}
      <Animated.Text
        style={[
          text,
          {
            opacity: moving ? anim : 1,
            transform: [{ translateY: moving ? anim.interpolate({ inputRange: [0, 1], outputRange: [d.h, 0] }) : 0 }],
          },
        ]}
      >
        {cur}
      </Animated.Text>
    </View>
  );
}

/** A digital clock with sliding digits and a blinking colon. Shows M:SS and adds hours after the first hour. */
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
  const [colonOn, setColonOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setColonOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const text = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  const chars = text.split('');

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: d.gap }, style]}>
      {chars.map((ch, i) => {
        // keys count from the right, so a digit keeps its tile when the clock grows an hour digit
        const key = chars.length - i;
        return ch === ':' ? (
          <Animated.Text
            key={key}
            style={{ color: c.accent, fontFamily: fonts.dots, fontSize: d.colon, opacity: colonOn ? 1 : 0.25 }}
          >
            :
          </Animated.Text>
        ) : (
          <Digit key={key} ch={ch} size={size} />
        );
      })}
    </View>
  );
}
