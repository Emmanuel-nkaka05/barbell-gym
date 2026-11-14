import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, useColors } from '../theme';
import { Label, Panel, useTopPad } from '../components/Panel';
import type { IconName } from '../components/Panel';

type Slide = { image: ImageSourcePropType; title: string };

const SLIDES: Slide[] = [
  { image: require('../assets/welcome/gym-1.jpg'), title: 'Powerlifting' },
  { image: require('../assets/welcome/gym-2.jpg'), title: 'Hypertrophy' },
  { image: require('../assets/welcome/gym-3.jpg'), title: 'Conditioning' },
  { image: require('../assets/welcome/gym-4.jpg'), title: 'Endurance' },
  { image: require('../assets/welcome/gym-5.jpg'), title: 'Strength' },
  { image: require('../assets/welcome/gym-6.jpg'), title: 'Bodybuilding' },
];

const PADDED_SLIDES = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];

const CHIPS: IconName[] = ['barbell', 'body', 'shield-checkmark'];
const AUTO_MS = 4500;
const BG_OPACITY = 0.5;

export default function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const c = useColors();
  const top = useTopPad();
  const { width: W, height: H } = useWindowDimensions();

  // Start at index 1 (the real first image) instead of the left clone
  const start = useRef(1).current;
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  indexRef.current = index;

  const scrollX = useRef(new Animated.Value(start * W)).current;
  const scroller = useRef<any>(null);
  const dragging = useRef(false);
  const placed = useRef(false);
  const [pagerH, setPagerH] = useState(0);

  // Auto-play
  useEffect(() => {
    const id = setInterval(() => {
      if (dragging.current) return;
      const currentScroll = indexRef.current + 1;
      let next = currentScroll + 1;
      if (next > PADDED_SLIDES.length - 1) next = PADDED_SLIDES.length - 1;
      scroller.current?.scrollTo({ x: next * W, animated: true });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [W]);

  const goTo = (i: number) => scroller.current?.scrollTo({ x: (i + 1) * W, animated: true });

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    let i = Math.round(x / W);

    const realIndex = (i - 1 + SLIDES.length) % SLIDES.length;
    if (realIndex !== indexRef.current) {
      setIndex(realIndex);
      indexRef.current = realIndex;
    }

    // Seamless teleport logic
    if (i === 0) {
      scroller.current?.scrollTo({ x: SLIDES.length * W, animated: false });
    } else if (i === PADDED_SLIDES.length - 1) {
      scroller.current?.scrollTo({ x: 1 * W, animated: false });
    }
  };

  const cardH = Math.max(0, pagerH - 12);
  const cardW = Math.min(W - 56, Math.round(cardH * 0.66));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Backgrounds (also padded for the loop) */}
      {PADDED_SLIDES.map((s, i) => (
        <Animated.Image
          key={i}
          source={s.image}
          blurRadius={10}
          resizeMode="cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: W,
            height: H,
            opacity: scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [0, BG_OPACITY, 0],
              extrapolate: 'clamp',
            }),
          }}
        />
      ))}

      <View style={{ flex: 1, paddingTop: top, paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 18 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: c.edge,
              backgroundColor: 'rgba(0,0,0,0.25)',
            }}
          >
            <Text style={{ color: c.accent, fontFamily: fonts.display, fontSize: 20, letterSpacing: 4 }}>CORTEX</Text>
            <Text style={{ color: c.muted, fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 3, marginTop: 2 }}>
              SYSTEMS TECHNOLOGIES
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, marginTop: 14 }} onLayout={(e) => setPagerH(e.nativeEvent.layout.height)}>
          {pagerH > 0 && (
            <Animated.ScrollView
              ref={scroller}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ height: pagerH }}
              scrollEventThrottle={16}
              onLayout={() => {
                if (placed.current) return;
                placed.current = true;
                scroller.current?.scrollTo({ x: start * W, animated: false });
              }}
              onScrollBeginDrag={() => {
                dragging.current = true;
              }}
              onScrollEndDrag={() => {
                dragging.current = false;
              }}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: true,
                listener: handleScroll,
              })}
            >
              {PADDED_SLIDES.map((s, i) => (
                <View key={i} style={{ width: W, height: pagerH, alignItems: 'center', justifyContent: 'center' }}>
                  <View
                    style={{
                      width: cardW,
                      height: cardH,
                      borderRadius: 28,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: c.edge,
                      backgroundColor: c.panel,
                    }}
                  >
                    <Image source={s.image} resizeMode="cover" style={{ width: cardW, height: cardH }} />
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: 14,
                        paddingTop: 26,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                      }}
                    >
                      <Label>Featured workout</Label>
                      <Text
                        style={{
                          color: c.text,
                          fontFamily: fonts.display,
                          fontSize: 22,
                          textTransform: 'uppercase',
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {s.title}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginVertical: 12 }}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={8}>
              <View
                style={{
                  width: i === index ? 36 : 12,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === index ? c.accent : c.muted,
                  opacity: i === index ? 1 : 0.5,
                }}
              />
            </Pressable>
          ))}
        </View>

        <View style={{ paddingHorizontal: 18, gap: 12 }}>
          <Panel style={{ gap: 10, padding: 16 }}>
            <Text
              style={{ color: c.accent, fontFamily: fonts.serif, fontSize: 24, textTransform: 'uppercase' }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Achieve ultimate power
            </Text>
            <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
              Barbell workouts built around your goals, strength and pace. Log every set and watch the numbers climb.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {CHIPS.map((icon) => (
                <View
                  key={icon}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: c.edge,
                    backgroundColor: c.panelRaised,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={icon} size={19} color={c.text} />
                </View>
              ))}
            </View>
          </Panel>

          <Pressable
            onPress={onStart}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderRadius: radius.pill,
              borderWidth: 2,
              borderColor: c.accent,
              backgroundColor: c.panel,
              paddingVertical: 17,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: c.accent, fontFamily: fonts.display, fontSize: 16, letterSpacing: 1.5 }}>
              START WORKOUT
            </Text>
            <Ionicons name="arrow-forward" size={18} color={c.accent} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}