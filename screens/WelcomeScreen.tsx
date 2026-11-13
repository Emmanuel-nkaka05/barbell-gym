import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, useColors } from '../theme';
import { Label, Panel, useTopPad } from '../components/Panel';
import type { IconName } from '../components/Panel';

type Slide = { image: ImageSourcePropType; title: string };

// Put the six photos in assets/welcome/ as gym-1.jpg ... gym-6.jpg
const SLIDES: Slide[] = [
  { image: require('../assets/welcome/gym-1.jpg'), title: 'Powerlifting' },
  { image: require('../assets/welcome/gym-2.jpg'), title: 'Hypertrophy' },
  { image: require('../assets/welcome/gym-3.jpg'), title: 'Conditioning' },
  { image: require('../assets/welcome/gym-4.jpg'), title: 'Endurance' },
  { image: require('../assets/welcome/gym-5.jpg'), title: 'Strength' },
  { image: require('../assets/welcome/gym-6.jpg'), title: 'Bodybuilding' },
];

const CHIPS: IconName[] = ['barbell', 'body', 'shield-checkmark'];
const AUTO_MS = 4500;

export default function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const c = useColors();
  const top = useTopPad();
  const { width: W, height: H } = useWindowDimensions();

  // a different photo to start on every time the app opens
  const start = useRef(Math.floor(Math.random() * SLIDES.length)).current;
  const [index, setIndex] = useState(start);
  const indexRef = useRef(start);
  indexRef.current = index;

  const scrollX = useRef(new Animated.Value(start * W)).current;
  const scroller = useRef<ScrollView>(null);
  const dragging = useRef(false);
  const placed = useRef(false);
  const [pagerH, setPagerH] = useState(0);

  // photos change by themselves, and pause while you are swiping
  useEffect(() => {
    const id = setInterval(() => {
      if (dragging.current) return;
      const next = (indexRef.current + 1) % SLIDES.length;
      scroller.current?.scrollTo({ x: next * W, animated: true });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [W]);

  const goTo = (i: number) => scroller.current?.scrollTo({ x: i * W, animated: true });

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* background: the same photos, blurred and tinted, fading along with the swipe */}
      {SLIDES.map((s, i) => (
        <Animated.Image
          key={i}
          source={s.image}
          blurRadius={16}
          resizeMode="cover"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: scrollX.interpolate({
                inputRange: [(i - 1) * W, i * W, (i + 1) * W],
                outputRange: [0, 1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      ))}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bg, opacity: 0.8 }]} />

      <View style={{ flex: 1, paddingTop: top, paddingBottom: 24 }}>
        {/* brand */}
        <View style={{ paddingHorizontal: 18 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: c.edge,
              backgroundColor: 'rgba(0,0,0,0.25)',
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.green }} />
            <Label>Cortex Systems Technologies</Label>
          </View>
        </View>

        {/* photo cards */}
        <View style={{ flex: 1, marginTop: 14 }} onLayout={(e) => setPagerH(e.nativeEvent.layout.height)}>
          {pagerH > 0 && (
            <Animated.ScrollView
              ref={scroller as any}
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
                listener: (e: any) => {
                  const i = Math.round(e.nativeEvent.contentOffset.x / W);
                  if (i !== indexRef.current && i >= 0 && i < SLIDES.length) setIndex(i);
                },
              })}
            >
              {SLIDES.map((s, i) => (
                <View key={i} style={{ width: W, height: pagerH, paddingHorizontal: 36, paddingVertical: 6 }}>
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 32,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: c.edge,
                      backgroundColor: c.panel,
                    }}
                  >
                    <Image source={s.image} resizeMode="cover" style={StyleSheet.absoluteFill} />
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        gap: 10,
                        padding: 18,
                        paddingTop: 40,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Label>Featured workout</Label>
                        <Text
                          style={{
                            color: c.text,
                            fontFamily: fonts.display,
                            fontSize: 26,
                            textTransform: 'uppercase',
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {s.title}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: c.accent,
                          backgroundColor: c.panel,
                        }}
                      >
                        <Text style={{ color: c.accent, fontFamily: fonts.bodySemi, fontSize: 13 }}>
                          {i + 1}/{SLIDES.length}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
          )}
        </View>

        {/* dots */}
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

        <View style={{ paddingHorizontal: 18, gap: 14 }}>
          <Panel style={{ gap: 12 }}>
            <Text
              style={{ color: c.accent, fontFamily: fonts.serif, fontSize: 32, lineHeight: 36, textTransform: 'uppercase' }}
            >
              Achieve{'\n'}ultimate power
            </Text>
            <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
              Barbell workouts built around your goals, strength and pace. Log every set and watch the numbers climb.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {CHIPS.map((icon) => (
                <View
                  key={icon}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: c.edge,
                    backgroundColor: c.panelRaised,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={icon} size={20} color={c.text} />
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
              paddingVertical: 18,
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
