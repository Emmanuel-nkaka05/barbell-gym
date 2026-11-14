import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { fonts, useColors } from '../theme';
import { Label, Panel } from './Panel';
import { useStore } from '../store';
import { deloadAdvice } from '../lib/deload';

const KEY = 'barbell-gym-deload-dismissed';
const HIDE_DAYS = 14;

export default function DeloadCard() {
  const c = useColors();
  const { sessions, bodyweight } = useStore();
  const [hidden, setHidden] = useState(true); // hidden until we know it was not dismissed recently
  const advice = useMemo(() => deloadAdvice(sessions, bodyweight), [sessions, bodyweight]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => setHidden(!!raw && Date.now() - Number(raw) < HIDE_DAYS * 86400000))
      .catch(() => setHidden(false));
  }, []);

  if (!advice || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    AsyncStorage.setItem(KEY, String(Date.now())).catch(() => {});
  };

  return (
    <Panel style={{ gap: 8, borderLeftWidth: 3, borderLeftColor: c.orange }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="battery-half" size={18} color={c.orange} />
        <Label style={{ flex: 1, color: c.orange }}>Time for a deload week?</Label>
      </View>
      <Text style={{ color: c.text, fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 20 }}>{advice.reason}</Text>
      <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
        For one week, cut your sets by about 40% (5 sets becomes 3) and keep the same weights. Stop every set with reps
        left in the tank, then go back to full volume.
      </Text>
      <Pressable onPress={dismiss} style={{ alignSelf: 'flex-start', paddingVertical: 6 }}>
        <Text style={{ color: c.accent, fontFamily: fonts.bodySemi, fontSize: 13 }}>Got it, remind me later</Text>
      </Pressable>
    </Panel>
  );
}