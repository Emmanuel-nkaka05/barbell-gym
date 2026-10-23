import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mono, radius, useColors } from '../theme';
import { Button, Header, IconName, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { CATEGORY_LABEL, Category, EXERCISES, EXERCISE_MAP } from '../data/exercises';
import type { ProgramExercise } from '../data/programs';
import type { Nav } from '../nav';

function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  const c = useColors();
  const btn = (icon: IconName, d: number) => (
    <Pressable
      onPress={() => onChange(Math.min(max, Math.max(min, value + d)))}
      hitSlop={6}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: c.edge,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={16} color={c.accent} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {btn('remove', -1)}
      <Text style={{ color: c.text, fontFamily: mono, minWidth: 24, textAlign: 'center' }}>{value}</Text>
      {btn('add', 1)}
    </View>
  );
}

export default function BuilderScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const { addProgram } = useStore();
  const [name, setName] = useState('');
  const [items, setItems] = useState<ProgramExercise[]>([]);

  const has = (id: string) => items.some((i) => i.exerciseId === id);
  const toggleExercise = (id: string) =>
    setItems((list) =>
      list.some((i) => i.exerciseId === id)
        ? list.filter((i) => i.exerciseId !== id)
        : [...list, { exerciseId: id, sets: 3, reps: '8' }]
    );
  const update = (id: string, p: Partial<ProgramExercise>) =>
    setItems((list) => list.map((i) => (i.exerciseId === id ? { ...i, ...p } : i)));

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Name your protocol', 'Give it a name first.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Add exercises', 'Pick at least one exercise from the library.');
      return;
    }
    addProgram({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      tag: 'Custom protocol',
      level: 'Custom',
      exercises: items,
      custom: true,
    });
    nav.back();
  };

  const categories: Category[] = ['big4', 'upper', 'lower'];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="New protocol" onBack={nav.back} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 12 }} keyboardShouldPersistTaps="handled">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Protocol name (e.g. Push Day)"
          placeholderTextColor={c.muted}
          style={{
            height: 50,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: c.edge,
            backgroundColor: c.panel,
            color: c.text,
            paddingHorizontal: 16,
            fontSize: 16,
          }}
        />

        {items.length > 0 && (
          <>
            <Label>Your lineup</Label>
            {items.map((it) => (
              <Panel key={it.exerciseId} style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ flex: 1, color: c.text, fontSize: 15, fontWeight: '800' }}>
                    {EXERCISE_MAP[it.exerciseId].name}
                  </Text>
                  <Pressable onPress={() => toggleExercise(it.exerciseId)} hitSlop={8}>
                    <Ionicons name="close-circle" size={22} color={c.muted} />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Label style={{ color: c.muted }}>Sets</Label>
                  <Stepper value={it.sets} min={1} max={10} onChange={(n) => update(it.exerciseId, { sets: n })} />
                  <Label style={{ color: c.muted }}>Reps</Label>
                  <Stepper
                    value={parseInt(it.reps, 10) || 8}
                    min={1}
                    max={30}
                    onChange={(n) => update(it.exerciseId, { reps: String(n) })}
                  />
                </View>
              </Panel>
            ))}
          </>
        )}

        {categories.map((cat) => (
          <View key={cat} style={{ gap: 8 }}>
            <Label style={{ marginTop: 6 }}>{CATEGORY_LABEL[cat]}</Label>
            {EXERCISES.filter((e) => e.category === cat).map((e) => {
              const on = has(e.id);
              return (
                <Pressable key={e.id} onPress={() => toggleExercise(e.id)}>
                  <Panel
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      borderColor: on ? c.accent : c.edge,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>{e.name}</Text>
                      <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10, marginTop: 3 }} numberOfLines={1}>
                        {e.muscles.slice(0, 3).join(', ')}
                      </Text>
                    </View>
                    <Ionicons name={on ? 'checkmark-circle' : 'add-circle-outline'} size={24} color={on ? c.accent : c.muted} />
                  </Panel>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 18,
          paddingBottom: 24,
          backgroundColor: c.bg,
          borderTopWidth: 1,
          borderTopColor: c.edge,
        }}
      >
        <Button title={`Save protocol (${items.length} exercises)`} icon="save" onPress={save} />
      </View>
    </View>
  );
}
