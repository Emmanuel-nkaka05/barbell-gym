import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mono, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { estMinutes, totalSets } from '../data/programs';
import type { Nav } from '../nav';

export default function WorkoutsScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const { programs } = useStore();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Protocols" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 12 }}>
        {programs.map((p) => (
          <Pressable key={p.id} onPress={() => nav.go({ name: 'detail', programId: p.id })}>
            <Panel style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label style={{ flex: 1 }} numberOfLines={1}>
                  {p.custom ? 'Custom protocol' : p.tag}
                </Label>
                <Label style={{ color: c.muted }}>{p.level}</Label>
              </View>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{p.name}</Text>
              <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }} numberOfLines={2}>
                {p.exercises.map((e) => EXERCISE_MAP[e.exerciseId]?.name).filter(Boolean).join(', ')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="time-outline" size={13} color={c.muted} />
                <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10 }}>
                  {estMinutes(p)} min  |  {totalSets(p)} sets
                </Text>
              </View>
            </Panel>
          </Pressable>
        ))}
        <Button title="Build a new protocol" icon="add" variant="ghost" onPress={() => nav.go({ name: 'builder' })} />
      </ScrollView>
    </View>
  );
}
