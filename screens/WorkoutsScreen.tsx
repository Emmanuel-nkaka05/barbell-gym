import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bump, fonts, mono, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { estMinutes, totalSets } from '../data/programs';
import { programFit } from '../lib/equipment';
import type { Program } from '../data/programs';
import type { Nav } from '../nav';

export default function WorkoutsScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const { programs } = useStore();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Workouts" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 12 }}>
        {programs.map((p) => (
          <Pressable key={p.id} onPress={() => nav.go({ name: 'detail', programId: p.id })}>
            <Panel style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label style={{ flex: 1 }} numberOfLines={1}>
                  {p.custom ? 'Custom workout' : p.tag}
                </Label>
                <Label style={{ color: c.muted }}>{p.level}</Label>
              </View>
              <Text style={{ color: c.text, fontSize: 24, fontFamily: fonts.display, textTransform: 'uppercase' }}>{p.name}</Text>
              <Text style={{ color: c.muted, fontSize: bump(12), lineHeight: bump(18) }} numberOfLines={2}>
                {p.exercises.map((e) => EXERCISE_MAP[e.exerciseId]?.name).filter(Boolean).join(', ')}
              </Text>
              <FitLabel p={p} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="time-outline" size={13} color={c.muted} />
                <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10 }}>
                  {estMinutes(p)} min  |  {totalSets(p)} sets
                </Text>
              </View>
            </Panel>
          </Pressable>
        ))}
        <Button title="Build a new workout" icon="add" variant="ghost" onPress={() => nav.go({ name: 'builder' })} />
      </ScrollView>
    </View>
  );
}

function FitLabel({ p }: { p: Program }) {
  const c = useColors();
  const { profile } = useStore();
  if (!profile.equipment) return null; // gear not set yet, so there is nothing to compare with

  const f = programFit(p, profile.equipment);
  let text = 'Fits your gear';
  let color = c.green;
  if (f.missing > 0) {
    text = `${f.missing} ${f.missing === 1 ? 'exercise needs' : 'exercises need'} gear you do not have`;
    color = c.orange;
  } else if (f.swaps > 0) {
    text = `${f.swaps} ${f.swaps === 1 ? 'exercise' : 'exercises'} swapped for no-equipment versions`;
    color = c.orange;
  }
  return <Text style={{ color, fontFamily: fonts.bodySemi, fontSize: 11 }}>{text}</Text>;
}
