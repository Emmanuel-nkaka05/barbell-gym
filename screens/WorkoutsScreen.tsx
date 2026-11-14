import React, { useState } from 'react';
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
  const [tab, setTab] = useState<'mine' | 'recommended'>('recommended');

  const mine = programs.filter((p) => p.custom);
  const recommended = programs.filter((p) => !p.custom);
  const shown = tab === 'mine' ? mine : recommended;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Workouts" />
      
      {/* Tab Switcher */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 18, marginBottom: 12 }}>
        {(['recommended', 'mine'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? c.accent : 'transparent',
            }}
          >
            <Text style={{ color: tab === t ? c.text : c.muted, fontFamily: fonts.display, fontSize: 16, textTransform: 'uppercase' }}>
              {t === 'recommended' ? 'Recommended' : 'My Routines'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 12 }}>
        
        {tab === 'mine' && mine.length === 0 && (
          <Panel style={{ alignItems: 'center', padding: 30, gap: 12 }}>
            <Ionicons name="barbell-outline" size={40} color={c.muted} />
            <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 18 }}>No custom workouts yet</Text>
            <Text style={{ color: c.muted, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
              Build your own routines exactly how you like them.
            </Text>
            <Button title="Build a workout" icon="add" onPress={() => nav.go({ name: 'builder' })} />
          </Panel>
        )}

        {shown.map((p) => (
          <Pressable key={p.id} onPress={() => nav.go({ name: 'detail', programId: p.id })}>
            <Panel style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label style={{ flex: 1 }} numberOfLines={1}>
                  {p.custom ? 'My Routine' : p.tag}
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

        {tab === 'mine' && mine.length > 0 && (
          <Button title="Build another workout" icon="add" variant="ghost" onPress={() => nav.go({ name: 'builder' })} />
        )}
      </ScrollView>
    </View>
  );
}

function FitLabel({ p }: { p: Program }) {
  const c = useColors();
  const { profile } = useStore();
  if (!profile.equipment) return null;

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